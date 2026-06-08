import os
import sys
import datetime

# Add root folder to python path so backend imports resolve
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../..')))

from backend.database.connection import SessionLocal, Base, engine
from backend.database.models import User, Role, Patient, Admission, ModelVersion, RiskAssessment, FairnessAudit
from backend.pipelines.pipeline import seed_database, extract_pipeline_features, train_and_evaluate_models
from backend.explainability.explain import explain_patient_risk
from backend.fairness.fairness import run_fairness_audit_on_active_model
from backend.reports.pdf_generator import generate_patient_pdf_report

def run_all_tests():
    print("==================================================")
    print("STARTING CDSS BACKEND VALIDATION & VERIFICATION")
    print("==================================================")
    
    # 1. Clean and Setup database
    print("\n[Step 1] Initializing SQLite database schema...")
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    print("[OK] Schema created successfully.")

    # 2. Test Database Seeder
    print("\n[Step 2] Seeding database with default roles, users, and patients...")
    try:
        seed_database(db, num_patients=50) # use 50 for fast test
        
        users_count = db.query(User).count()
        patients_count = db.query(Patient).count()
        admissions_count = db.query(Admission).count()
        
        print(f"[OK] Users seeded: {users_count}")
        print(f"[OK] Patients seeded: {patients_count}")
        print(f"[OK] Admissions seeded: {admissions_count}")
        assert users_count == 4, "Users count mismatch"
        assert patients_count == 50, "Patients count mismatch"
        assert admissions_count >= 50, "Admissions count mismatch"
    except Exception as e:
        print(f"[FAIL] Seeding failed: {e}")
        db.close()
        sys.exit(1)

    # 3. Test Feature Engineering
    print("\n[Step 3] Extracting features and running ICD-9 grouping...")
    try:
        df = extract_pipeline_features(db)
        print(f"[OK] Dataframe shape: {df.shape}")
        print(f"[OK] Target variable (readmitted) distribution: \n{df['readmitted'].value_counts()}")
        
        assert "num_prev_admissions" in df.columns, "Feature missing"
        assert "comorbidity_score" in df.columns, "Feature missing"
        assert "length_of_stay" in df.columns, "Feature missing"
        assert "readmitted" in df.columns, "Target missing"
    except Exception as e:
        print(f"[FAIL] Feature extraction failed: {e}")
        db.close()
        sys.exit(1)

    # 4. Test Model Training Pipeline
    print("\n[Step 4] Running training, comparison, and MLflow registry simulation...")
    try:
        result = train_and_evaluate_models(db)
        print(f"[OK] Pipeline response: {result['status']}")
        print(f"[OK] Best model found: {result['best_model']}")
        print(f"[OK] Active model version: {result['version']}")
        print(f"[OK] Performance Metrics: {result['metrics']}")
        
        active_model = db.query(ModelVersion).filter(ModelVersion.is_active == True).first()
        assert active_model is not None, "No model marked active in DB"
        assert active_model.version == result["version"], "Version mismatch"
        print("[OK] Best model saved to DB registry successfully.")
    except Exception as e:
        print(f"[FAIL] Model training failed: {e}")
        db.close()
        sys.exit(1)

    # 5. Test Inference & SHAP Explainability
    print("\n[Step 5] Testing inference and SHAP local explanations...")
    try:
        pt = db.query(Patient).first()
        adm = db.query(Admission).filter(Admission.patient_id == pt.id).first()
        
        age = datetime.datetime.utcnow().year - pt.date_of_birth.year
        age_group = "70+" if age >= 70 else ("50-70" if age >= 50 else ("30-50" if age >= 30 else "30-"))
        
        features_dict = {
            "length_of_stay": 4.0,
            "num_prev_admissions": 1.0,
            "num_diagnoses": 3.0,
            "num_procedures": 2.0,
            "comorbidity_score": 2.0,
            f"gender_{pt.gender}": 1.0,
            f"race_{pt.race}": 1.0,
            f"age_group_{age_group}": 1.0,
            f"insurance_{adm.insurance}": 1.0
        }
        
        explanation = explain_patient_risk(db, df, features_dict, active_model)
        
        print("[OK] SHAP explanation generated successfully.")
        print(f"[OK] Narrative output sample: {explanation['risk_explanation'][:120]}...")
        assert "shap_waterfall" in explanation, "SHAP waterfall data missing"
        assert len(explanation["shap_waterfall"]) > 0, "Waterfall values are empty"
    except Exception as e:
        print(f"[FAIL] Inference or SHAP failed: {e}")
        db.close()
        sys.exit(1)

    # 6. Test Fairness Auditing
    print("\n[Step 6] Running group fairness auditing...")
    try:
        audit_res = run_fairness_audit_on_active_model(db, df)
        print(f"[OK] Fairness audit response: {audit_res['status']}")
        
        # Verify db log
        audits_logged = db.query(FairnessAudit).count()
        print(f"[OK] Fairness records saved to DB: {audits_logged}")
        assert audits_logged > 0, "No fairness records saved"
    except Exception as e:
        print(f"[FAIL] Fairness audit failed: {e}")
        db.close()
        sys.exit(1)

    # 7. Test PDF Report Generation
    print("\n[Step 7] Generating patient discharge PDF report...")
    try:
        patient_dict = {
            "id": pt.id,
            "patient_mrn": pt.patient_mrn,
            "gender": pt.gender,
            "race": pt.race,
            "date_of_birth": pt.date_of_birth,
            "age": age
        }
        
        admission_dict = {
            "id": adm.id,
            "admission_date": adm.admission_date,
            "discharge_date": adm.discharge_date,
            "admission_type": adm.admission_type,
            "discharge_disposition": adm.discharge_disposition,
            "insurance": adm.insurance
        }
        
        assessment_dict = {
            "probability": 0.42,
            "risk_tier": "Medium",
            "risk_explanation": explanation["risk_explanation"],
            "shap_waterfall": explanation["shap_waterfall"],
            "model_version": active_model.version
        }
        
        filepath = generate_patient_pdf_report(patient_dict, admission_dict, assessment_dict, output_dir="backend/tests/output_reports")
        print(f"[OK] PDF report saved to: {filepath}")
        assert os.path.exists(filepath), "PDF file was not created"
        assert os.path.getsize(filepath) > 0, "PDF file is empty"
        print("[OK] PDF report verified successfully.")
    except Exception as e:
        print(f"[FAIL] PDF generation failed: {e}")
        db.close()
        sys.exit(1)

    db.close()
    print("\n==================================================")
    print("ALL CDSS BACKEND VALIDATION CHECKS PASSED!")
    print("==================================================")

if __name__ == "__main__":
    run_all_tests()

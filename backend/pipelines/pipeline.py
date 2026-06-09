import os
import random
import datetime
import json
import numpy as np
import pandas as pd
import pickle
from sqlalchemy.orm import Session

# Import SQLAlchemy models
from backend.database.models import (
    Role, User, Patient, Admission, Diagnosis, Procedure,
    ModelVersion, RiskAssessment, FairnessAudit, AuditLog, Tenant
)
from backend.auth.auth import get_password_hash

# Try importing ML packages. We will define fallbacks if they are not fully installed yet.
try:
    from sklearn.model_selection import train_test_split
    from sklearn.preprocessing import StandardScaler
    from sklearn.impute import SimpleImputer
    from sklearn.linear_model import LogisticRegression
    from sklearn.ensemble import RandomForestClassifier
    from xgboost import XGBClassifier
    from sklearn.metrics import roc_auc_score, precision_score, recall_score, f1_score, brier_score_loss
    HAS_ML = True
except ImportError:
    HAS_ML = False

try:
    import mlflow
    HAS_MLFLOW = True
except ImportError:
    HAS_MLFLOW = False

# --- ICD-9 GROUPER MAPPING (CCS style) ---
# Group diagnoses into: Circulatory, Respiratory, Diabetes, Kidney, Infectious, Other
def map_icd9_to_category(code: str) -> str:
    if not code:
        return "Other"
    
    # Try converting to float for numeric checking
    try:
        # Strip sub-codes for grouping (e.g. 428.0 -> 428)
        numeric_part = code.split('.')[0]
        val = int(numeric_part)
        
        if 1 <= val <= 139:
            return "Infectious"
        elif val == 250:
            return "Diabetes"
        elif 390 <= val <= 459:
            return "Circulatory"
        elif 460 <= val <= 519:
            return "Respiratory"
        elif 580 <= val <= 629:
            return "Kidney"
        else:
            return "Other"
    except ValueError:
        # Check codes starting with 'V' or 'E'
        if code.startswith('V') or code.startswith('E'):
            return "Other"
        return "Other"

# --- DATABASE SEEDER (Synthetic Clinical Data) ---
def seed_database(db: Session, num_patients: int = 250):
    # 0. Seed Tenants
    tenants = [
        {"name": "Alpha General Hospital", "domain": "alpha.hospital.org"},
        {"name": "Beta Clinical Center", "domain": "beta.hospital.org"}
    ]
    db_tenants = []
    for t_data in tenants:
        tenant = db.query(Tenant).filter(Tenant.name == t_data["name"]).first()
        if not tenant:
            tenant = Tenant(name=t_data["name"], domain=t_data["domain"])
            db.add(tenant)
            db.commit()
            db.refresh(tenant)
        db_tenants.append(tenant)

    # 1. Seed Roles
    roles = {
        "Admin": {"manage_users": True, "manage_models": True, "view_analytics": True},
        "Doctor": {"view_patients": True, "assess_risk": True, "generate_reports": True},
        "Nurse": {"view_patients": True, "view_risk_scores": True},
        "Analyst": {"monitor_models": True, "run_fairness_audits": True}
    }
    
    db_roles = {}
    for role_name, perms in roles.items():
        role = db.query(Role).filter(Role.name == role_name).first()
        if not role:
            role = Role(name=role_name, permissions=perms)
            db.add(role)
            db.commit()
            db.refresh(role)
        db_roles[role_name] = role
        
    # 2. Seed Users
    users_data = [
        ("admin", "admin@cdss.hospital.org", "admin", "Admin"),
        ("doctor", "doctor@cdss.hospital.org", "doctor", "Doctor"),
        ("nurse", "nurse@cdss.hospital.org", "nurse", "Nurse"),
        ("analyst", "analyst@cdss.hospital.org", "analyst", "Analyst")
    ]
    for username, email, pwd, r_name in users_data:
        user = db.query(User).filter(User.username == username).first()
        if not user:
            user = User(
                username=username,
                email=email,
                hashed_password=get_password_hash(pwd),
                role_id=db_roles[r_name].id,
                tenant_id=db_tenants[0].id
            )
            db.add(user)
    db.commit()

    # 3. Seed Patients & Admissions if empty
    if db.query(Patient).count() > 0:
        print("Database already seeded with clinical records.")
        return

    genders = ["Female", "Male"]
    races = ["Caucasian", "African American", "Asian", "Hispanic", "Other"]
    insurances = ["Private", "Medicare", "Medicaid", "Self-Pay", "Government"]
    admission_types = ["Emergency", "Urgent", "Elective"]
    
    # Common codes
    circulatory_codes = [("428", "Congestive heart failure"), ("410", "Acute myocardial infarction"), ("401", "Essential hypertension")]
    respiratory_codes = [("486", "Pneumonia, organism unspecified"), ("496", "Chronic airway obstruction"), ("491", "Chronic bronchitis")]
    diabetes_codes = [("250", "Diabetes mellitus without mention of complication")]
    kidney_codes = [("584", "Acute kidney failure"), ("585", "Chronic kidney disease")]
    infectious_codes = [("038", "Septicemia"), ("008", "Intestinal infections")]
    other_codes = [("276", "Disorders of fluid, electrolyte, and acid-base balance"), ("780", "General symptoms")]
    
    procedure_codes = [("38.93", "Venous catheterization"), ("99.04", "Transfusion of packed cells"), ("88.72", "Diagnostic ultrasound of heart"), ("39.95", "Hemodialysis")]
 
    dispositions = [
        "Discharged to home", 
        "Discharged to home with home health service",
        "Left against medical advice",
        "Transferred to another short-term hospital",
        "Discharged to skilled nursing facility (SNF)"
    ]

    print(f"Generating {num_patients} synthetic patient records...")
    start_date = datetime.date(1940, 1, 1)
    end_date = datetime.date(2015, 12, 31)

    for i in range(num_patients):
        patient_mrn = f"MRN-{100000 + i}"
        gender = random.choice(genders)
        # Shift race probabilities slightly to simulate demographic representation
        race = random.choices(races, weights=[0.6, 0.2, 0.05, 0.1, 0.05])[0]
        
        # Calculate random DOB
        dob_days = (end_date - start_date).days
        random_days = random.randint(0, dob_days)
        dob = start_date + datetime.timedelta(days=random_days)
        dob_dt = datetime.datetime.combine(dob, datetime.time.min)

        # Distribute patient records between hospital systems
        patient_tenant_id = random.choices([db_tenants[0].id, db_tenants[1].id], weights=[0.7, 0.3])[0]

        patient = Patient(
            patient_mrn=patient_mrn,
            gender=gender,
            race=race,
            date_of_birth=dob_dt,
            tenant_id=patient_tenant_id
        )
        db.add(patient)
        db.commit()
        db.refresh(patient)

        # Decide how many admissions this patient will have (1 to 4)
        num_admissions = random.choices([1, 2, 3, 4], weights=[0.6, 0.25, 0.1, 0.05])[0]
        curr_date = datetime.datetime(2025, 1, 1) + datetime.timedelta(days=random.randint(0, 100))

        for adm_idx in range(num_admissions):
            los = random.randint(1, 14)  # Length of stay
            discharge_date = curr_date + datetime.timedelta(days=los)
            admission_type = random.choices(admission_types, weights=[0.5, 0.3, 0.2])[0]
            insurance = random.choices(insurances, weights=[0.4, 0.3, 0.15, 0.1, 0.05])[0]
            discharge_disp = random.choices(dispositions, weights=[0.6, 0.2, 0.02, 0.08, 0.1])[0]

            admission = Admission(
                patient_id=patient.id,
                admission_date=curr_date,
                discharge_date=discharge_date,
                admission_type=admission_type,
                discharge_disposition=discharge_disp,
                insurance=insurance,
                tenant_id=patient_tenant_id
            )
            db.add(admission)
            db.commit()
            db.refresh(admission)

            # Assign diagnoses
            num_diagnoses = random.randint(1, 5)
            selected_diag = []
            for _ in range(num_diagnoses):
                cat = random.choices(
                    ["Circulatory", "Respiratory", "Diabetes", "Kidney", "Infectious", "Other"],
                    weights=[0.3, 0.2, 0.25, 0.1, 0.05, 0.1]
                )[0]
                if cat == "Circulatory":
                    code, desc = random.choice(circulatory_codes)
                elif cat == "Respiratory":
                    code, desc = random.choice(respiratory_codes)
                elif cat == "Diabetes":
                    code, desc = random.choice(diabetes_codes)
                elif cat == "Kidney":
                    code, desc = random.choice(kidney_codes)
                elif cat == "Infectious":
                    code, desc = random.choice(infectious_codes)
                else:
                    code, desc = random.choice(other_codes)
                
                # Deduplicate codes for this admission
                if code not in [x.code for x in selected_diag]:
                    diag = Diagnosis(
                        admission_id=admission.id,
                        code=code,
                        description=desc,
                        category=cat
                    )
                    db.add(diag)
                    selected_diag.append(diag)

            # Assign procedures
            num_proc = random.randint(0, 3)
            selected_proc = []
            for _ in range(num_proc):
                code, desc = random.choice(procedure_codes)
                if code not in [x.code for x in selected_proc]:
                    proc = Procedure(
                        admission_id=admission.id,
                        code=code,
                        description=desc
                    )
                    db.add(proc)
                    selected_proc.append(proc)

            # Advance current date for next potential admission (at least 15 to 90 days after discharge)
            # Create some 30-day readmissions (risk labeling logic)
            readmit_days = random.choices([random.randint(5, 29), random.randint(31, 150)], weights=[0.25, 0.75])[0]
            curr_date = discharge_date + datetime.timedelta(days=readmit_days)

    db.commit()
    print("Database seeding completed.")


# --- FEATURES EXTRACTION PIPELINE ---
def extract_pipeline_features(db: Session) -> pd.DataFrame:
    """
    Extracts clinical tables and builds structured features for training/inference.
    Target variable: readmitted within 30 days (1 or 0)
    """
    # Fetch all admissions, patients, diagnoses, procedures
    patients = db.query(Patient).all()
    admissions = db.query(Admission).all()
    
    # Store patient metadata lookup
    pt_lookup = {pt.id: pt for pt in patients}
    
    # Sort admissions by date for previous admission calculations
    admissions = sorted(admissions, key=lambda a: a.admission_date)
    
    # List to hold admission feature dictionaries
    records = []
    
    for idx, adm in enumerate(admissions):
        patient = pt_lookup[adm.patient_id]
        
        # Calculate length of stay (days)
        los = (adm.discharge_date - adm.admission_date).days
        if los <= 0:
            los = 1
            
        # Count previous admissions for this patient before current admission date
        prev_adms = sum(1 for a in admissions[:idx] if a.patient_id == adm.patient_id and a.admission_date < adm.admission_date)
        
        # Count diagnoses & procedures
        num_diagnoses = len(adm.diagnoses)
        num_procedures = len(adm.procedures)
        
        # Age at admission
        age = (adm.admission_date.year - patient.date_of_birth.year)
        
        # Map age group
        if age < 30:
            age_group = "30-"
        elif 30 <= age < 50:
            age_group = "30-50"
        elif 50 <= age < 70:
            age_group = "50-70"
        else:
            age_group = "70+"
            
        # Comorbidity indicators based on CCS categories
        has_diabetes = 1 if any(d.category == "Diabetes" for d in adm.diagnoses) else 0
        has_circulatory = 1 if any(d.category == "Circulatory" for d in adm.diagnoses) else 0
        has_respiratory = 1 if any(d.category == "Respiratory" for d in adm.diagnoses) else 0
        has_kidney = 1 if any(d.category == "Kidney" for d in adm.diagnoses) else 0
        has_infectious = 1 if any(d.category == "Infectious" for d in adm.diagnoses) else 0
        
        comorbidity_score = has_diabetes + has_circulatory + has_respiratory + has_kidney + has_infectious
        
        # Check if there is a next admission for this patient within 30 days of this discharge date
        readmitted = 0
        readmit_days = 9999
        for other_adm in admissions:
            if other_adm.patient_id == adm.patient_id and other_adm.admission_date > adm.discharge_date:
                gap = (other_adm.admission_date - adm.discharge_date).days
                readmit_days = gap
                if gap <= 30:
                    readmitted = 1
                break  # First admission after discharge is the readmission event
                
        records.append({
            "admission_id": adm.id,
            "patient_id": adm.patient_id,
            "gender": patient.gender,
            "race": patient.race,
            "age": age,
            "age_group": age_group,
            "length_of_stay": los,
            "num_prev_admissions": prev_adms,
            "num_diagnoses": num_diagnoses,
            "num_procedures": num_procedures,
            "insurance": adm.insurance,
            "discharge_disposition": adm.discharge_disposition,
            "has_diabetes": has_diabetes,
            "has_circulatory": has_circulatory,
            "has_respiratory": has_respiratory,
            "has_kidney": has_kidney,
            "has_infectious": has_infectious,
            "comorbidity_score": comorbidity_score,
            "readmitted": readmitted
        })
        
    return pd.DataFrame(records)

# --- TRAINING & EVALUATION PIPELINE ---
def train_and_evaluate_models(db: Session) -> dict:
    """
    Runs model training, tracks experiments using MLflow, computes performance and calibration,
    saves the best model as active in the database and serialized model directory.
    """
    if not HAS_ML:
        return {"status": "error", "message": "ML packages (sklearn, xgboost) not fully installed yet."}
        
    df = extract_pipeline_features(db)
    if df.empty or len(df) < 20:
        return {"status": "error", "message": "Not enough database patient records to train models."}
        
    # Set feature list & categorical encoding
    categorical_cols = ["gender", "race", "age_group", "insurance", "discharge_disposition"]
    numeric_cols = ["length_of_stay", "num_prev_admissions", "num_diagnoses", "num_procedures", "comorbidity_score"]
    
    # Missingness simulator (introducing 5% missingness in length_of_stay and num_procedures for imputer logic verification)
    np.random.seed(42)
    for col in ["length_of_stay", "num_procedures"]:
        mask = np.random.rand(*df[col].shape) < 0.05
        df.loc[mask, col] = np.nan
        
    # Perform one-hot encoding on categorical values
    df_encoded = pd.get_dummies(df, columns=categorical_cols, drop_first=False)
    
    # Make sure all standard dummy columns exist (in case synthetic sample misses one)
    expected_categories = {
        "gender_Female": 0, "gender_Male": 0,
        "race_Caucasian": 0, "race_African American": 0, "race_Asian": 0, "race_Hispanic": 0, "race_Other": 0,
        "age_group_30-": 0, "age_group_30-50": 0, "age_group_50-70": 0, "age_group_70+": 0,
        "insurance_Private": 0, "insurance_Medicare": 0, "insurance_Medicaid": 0, "insurance_Self-Pay": 0, "insurance_Government": 0
    }
    
    for col, val in expected_categories.items():
        if col not in df_encoded.columns:
            df_encoded[col] = val
            
    # Filter columns to train on
    exclude_cols = ["admission_id", "patient_id", "readmitted", "age"]
    feature_cols = [c for c in df_encoded.columns if c not in exclude_cols and not c.startswith("discharge_disposition_")]
    
    X = df_encoded[feature_cols]
    y = df_encoded["readmitted"]
    
    # Missing data handling using Imputer
    # We will use simple imputer with add_indicator=True as a robust alternative to MICE if MICE is not fully set up
    imputer = SimpleImputer(strategy="median", add_indicator=True)
    X_imputed_array = imputer.fit_transform(X)
    
    # Create column names for imputed array (including indicators)
    imputed_cols = list(X.columns)
    if imputer.indicator_:
        for idx in imputer.indicator_.features_:
            imputed_cols.append(f"{X.columns[idx]}_missing")
            
    X_imputed = pd.DataFrame(X_imputed_array, columns=imputed_cols)
    
    # Train-test split
    X_train, X_test, y_train, y_test = train_test_split(X_imputed, y, test_size=0.3, random_state=42, stratify=y)
    
    # Standardize numeric columns
    scaler = StandardScaler()
    # Find active numeric/scale columns in features
    active_num_cols = [c for c in numeric_cols if c in X_train.columns]
    X_train_scaled = X_train.copy()
    X_test_scaled = X_test.copy()
    X_train_scaled[active_num_cols] = scaler.fit_transform(X_train[active_num_cols])
    X_test_scaled[active_num_cols] = scaler.transform(X_test[active_num_cols])
    
    models = {
        "Logistic Regression": LogisticRegression(max_iter=1000, random_state=42),
        "Random Forest": RandomForestClassifier(n_estimators=100, max_iter=None, random_state=42) if hasattr(RandomForestClassifier, 'max_iter') else RandomForestClassifier(n_estimators=100, random_state=42),
        "XGBoost": XGBClassifier(n_estimators=50, max_depth=4, random_state=42, eval_metric="logloss")
    }
    
    best_auroc = 0.0
    best_model_name = None
    best_model_object = None
    best_model_metrics = {}
    best_model_params = {}
    
    # Create directory for models if not exists
    os.makedirs("ml_models", exist_ok=True)
    
    for name, model in models.items():
        # Train model
        model.fit(X_train_scaled, y_train)
        
        # Predict probability
        y_prob = model.predict_proba(X_test_scaled)[:, 1]
        y_pred = model.predict(X_test_scaled)
        
        # Calculate evaluation metrics
        auroc = float(roc_auc_score(y_test, y_prob))
        recall = float(recall_score(y_test, y_pred, zero_division=0))
        precision = float(precision_score(y_test, y_pred, zero_division=0))
        f1 = float(f1_score(y_test, y_pred, zero_division=0))
        brier = float(brier_score_loss(y_test, y_prob))
        
        metrics = {
            "auroc": auroc,
            "recall": recall,
            "precision": precision,
            "f1_score": f1,
            "brier_score": brier
        }
        
        # Fetch simple params description
        if name == "Logistic Regression":
            params = {"C": float(model.C), "penalty": str(model.penalty)}
        elif name == "Random Forest":
            params = {"n_estimators": int(model.n_estimators), "max_depth": str(model.max_depth)}
        else:
            params = {"n_estimators": int(model.n_estimators), "max_depth": int(model.max_depth)}
            
        print(f"Model: {name} | AUROC: {auroc:.4f} | Recall: {recall:.4f} | Brier: {brier:.4f}")
        
        # Log to MLflow if enabled
        if HAS_MLFLOW:
            try:
                # Set Experiment name
                mlflow.set_experiment("Hospital_Readmission_CDSS")
                with mlflow.start_run(run_name=name.replace(" ", "_")):
                    mlflow.log_params(params)
                    mlflow.log_metrics(metrics)
                    mlflow.sklearn.log_model(model, "model")
            except Exception as e:
                print(f"MLflow log failed for {name}: {e}")
                
        if auroc > best_auroc:
            best_auroc = auroc
            best_model_name = name
            best_model_object = model
            best_model_metrics = metrics
            best_model_params = params
            
    # Save the pipeline artifacts (Imputer, Scaler, Columns, and Best Model)
    version_str = datetime.datetime.utcnow().strftime("v%Y%m%d_%H%M%S")
    filepath = f"ml_models/cdss_pipeline_{version_str}.pkl"
    
    pipeline_artifact = {
        "model_name": best_model_name,
        "features": list(X.columns),
        "imputer": imputer,
        "scaler": scaler,
        "active_num_cols": active_num_cols,
        "model": best_model_object,
        "version": version_str
    }
    
    with open(filepath, "wb") as f:
        pickle.dump(pipeline_artifact, f)
        
    # Set all other model versions to inactive
    db.query(ModelVersion).update({ModelVersion.is_active: False})
    
    # Save Model Version to DB
    model_ver = ModelVersion(
        version=version_str,
        name=best_model_name,
        metrics=best_model_metrics,
        parameters=best_model_params,
        filepath=filepath,
        is_active=True
    )
    db.add(model_ver)
    db.commit()
    db.refresh(model_ver)
    
    # Return features dataframe along with model info for fairness audits
    return {
        "status": "success",
        "best_model": best_model_name,
        "version": version_str,
        "metrics": best_model_metrics,
        "filepath": filepath,
        "df_features": df
    }

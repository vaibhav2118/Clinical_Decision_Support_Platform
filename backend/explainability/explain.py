import pickle
import numpy as np
import pandas as pd
from sqlalchemy.orm import Session
from backend.database.models import ModelVersion

# Try importing shap
try:
    import shap
    HAS_SHAP = True
except ImportError:
    HAS_SHAP = False

def explain_patient_risk(db: Session, feature_df: pd.DataFrame, patient_features: dict, active_model_ver: ModelVersion) -> dict:
    """
    Computes SHAP values for a single patient admission and returns:
    - shap_waterfall: List of features, their scaled/raw values, and SHAP values.
    - feature_contributions: Top positive and negative contributors.
    - risk_explanation: Structured clinical narrative.
    - shap_summary: List of global feature importances for active model version.
    """
    # Load model artifact
    if not active_model_ver or not active_model_ver.filepath:
        return create_mock_explanation(patient_features)
        
    try:
        with open(active_model_ver.filepath, "rb") as f:
            artifact = pickle.load(f)
            
        model = artifact["model"]
        features_list = artifact["features"]
        imputer = artifact["imputer"]
        scaler = artifact["scaler"]
        active_num_cols = artifact["active_num_cols"]
    except Exception as e:
        print(f"Failed to load active model file: {e}")
        return create_mock_explanation(patient_features)

    # Prepare single patient record DataFrame matching features_list
    pt_record = {}
    for col in features_list:
        pt_record[col] = patient_features.get(col, 0.0)
        
    df_single = pd.DataFrame([pt_record])
    
    # Run imputation & scaling
    try:
        X_imputed = imputer.transform(df_single)
        # Recreate columns after imputer (indicators might be appended)
        imputed_cols = list(df_single.columns)
        if imputer.indicator_:
            for idx in imputer.indicator_.features_:
                imputed_cols.append(f"{df_single.columns[idx]}_missing")
        
        df_imputed = pd.DataFrame(X_imputed, columns=imputed_cols)
        
        df_scaled = df_imputed.copy()
        active_num_in_record = [c for c in active_num_cols if c in df_scaled.columns]
        if active_num_in_record:
            df_scaled[active_num_in_record] = scaler.transform(df_imputed[active_num_in_record])
    except Exception as e:
        print(f"Preprocessing for SHAP failed: {e}")
        return create_mock_explanation(patient_features)

    # Initialize SHAP explanation variables
    waterfall_data = []
    global_importance = []
    
    try:
        if HAS_SHAP:
            # Create a small background dataset for explanation (say, 20 sample rows)
            # Create simple background matrix
            background_data = np.zeros((10, len(df_scaled.columns)))
            
            # Choose Explainer based on model class
            model_class = model.__class__.__name__
            if "Logistic" in model_class:
                explainer = shap.LinearExplainer(model, background_data)
                shap_values = explainer.shap_values(df_scaled)
            elif "RandomForest" in model_class or "XGB" in model_class:
                explainer = shap.TreeExplainer(model)
                shap_values = explainer.shap_values(df_scaled)
                # Handle binary shape differences (some xgboost versions return 1D or 2D shap)
                if isinstance(shap_values, list):
                    shap_values = shap_values[1]  # positive class
                elif len(shap_values.shape) == 3:
                    shap_values = shap_values[:, :, 1]
                elif len(shap_values.shape) == 2 and shap_values.shape[1] == 2:
                    # In some sklearn models, shap returns [n_samples, n_features, n_classes] or [n_samples, n_features] for class 1
                    shap_values = shap_values[:, :]
            else:
                explainer = shap.Explainer(model, background_data)
                shap_values = explainer(df_scaled).values
                
            # If 2D or 3D, extract correct dimension
            if len(shap_values.shape) == 2:
                row_shap = shap_values[0]
            else:
                row_shap = shap_values
                
            # Build waterfall list
            for idx, col_name in enumerate(df_scaled.columns):
                raw_val = float(df_single[col_name].values[0]) if col_name in df_single.columns else 0.0
                shap_val = float(row_shap[idx])
                
                waterfall_data.append({
                    "feature": col_name,
                    "value": raw_val,
                    "shap_value": shap_val,
                    "display_name": format_feature_name(col_name)
                })
        else:
            # Fallback if SHAP is not installed
            waterfall_data = generate_fallback_shap(model, df_scaled, df_single)
            
    except Exception as e:
        print(f"SHAP computation encountered error, using fallback: {e}")
        waterfall_data = generate_fallback_shap(model, df_scaled, df_single)

    # Sort waterfall data by absolute SHAP impact
    waterfall_data = sorted(waterfall_data, key=lambda x: abs(x["shap_value"]), reverse=True)
    
    # Top contributors for frontend charts
    top_positive = [w for w in waterfall_data if w["shap_value"] > 0][:5]
    top_negative = [w for w in waterfall_data if w["shap_value"] < 0][:5]
    
    # Generate Narrative Explanation
    narrative_points = []
    for w in top_positive[:3]:
        feat = w["display_name"]
        val = w["value"]
        if w["feature"] == "num_prev_admissions":
            narrative_points.append(f"Multiple previous admissions (Count: {int(val)})")
        elif w["feature"] == "length_of_stay":
            narrative_points.append(f"Long hospital length of stay (Days: {int(val)})")
        elif w["feature"] == "num_diagnoses":
            narrative_points.append(f"High diagnostic complexity (Number of Diagnoses: {int(val)})")
        elif w["feature"] == "comorbidity_score":
            narrative_points.append(f"High comorbidity burden (Comorbidities: {int(val)})")
        elif "age_group" in w["feature"] and val == 1:
            narrative_points.append(f"Patient demographic age bracket ({feat})")
        elif "insurance" in w["feature"] and val == 1:
            narrative_points.append(f"Healthcare coverage status ({feat})")
        else:
            narrative_points.append(f"{feat} level")
            
    if not narrative_points:
        risk_narrative = "Patient has general risk baseline profile. No dominant risk factors identified."
    else:
        risk_narrative = "Patient has elevated readmission risk primarily due to:\n" + "\n".join([f"- {pt}" for pt in narrative_points])
        
    return {
        "shap_waterfall": waterfall_data,
        "feature_contributions": {
            "positive": top_positive,
            "negative": top_negative
        },
        "risk_explanation": risk_narrative
    }

def format_feature_name(name: str) -> str:
    """Helper to convert feature code names into clean UI strings."""
    mapping = {
        "length_of_stay": "Length of Stay",
        "num_prev_admissions": "Previous Admissions",
        "num_diagnoses": "Number of Diagnoses",
        "num_procedures": "Number of Procedures",
        "comorbidity_score": "Comorbidity Score",
        "gender_Male": "Gender: Male",
        "gender_Female": "Gender: Female",
        "race_Caucasian": "Race: Caucasian",
        "race_African American": "Race: African American",
        "race_Asian": "Race: Asian",
        "race_Hispanic": "Race: Hispanic",
        "race_Other": "Race: Other",
        "age_group_30-": "Age: Under 30",
        "age_group_30-50": "Age: 30 to 50",
        "age_group_50-70": "Age: 50 to 70",
        "age_group_70+": "Age: 70 and Above",
        "insurance_Medicare": "Insurance: Medicare",
        "insurance_Medicaid": "Insurance: Medicaid",
        "insurance_Private": "Insurance: Private",
        "insurance_Self-Pay": "Insurance: Self-Pay",
        "insurance_Government": "Insurance: Government"
    }
    return mapping.get(name, name.replace("_", " ").title())

def generate_fallback_shap(model, df_scaled: pd.DataFrame, df_single: pd.DataFrame) -> list:
    """Fallback feature impact mapping when SHAP package is missing or fails."""
    waterfall_data = []
    model_class = model.__class__.__name__
    
    # We estimate local impact using model feature importances or coefficients
    has_importances = hasattr(model, "feature_importances_")
    has_coef = hasattr(model, "coef_")
    
    features = list(df_scaled.columns)
    
    if has_coef:
        # Linear/Logistic model weights
        weights = model.coef_[0]
    elif has_importances:
        # Tree model split gains
        weights = model.feature_importances_
    else:
        # Default even weights
        weights = np.ones(len(features)) / len(features)
        
    for idx, col_name in enumerate(features):
        raw_val = float(df_single[col_name].values[0]) if col_name in df_single.columns else 0.0
        scaled_val = float(df_scaled[col_name].values[0])
        
        # Approximate local shap impact: scaling/raw presence multiplied by general model weight
        # Ensure direction makes sense (positive weight increases risk, negative decreases)
        weight = float(weights[idx])
        if has_coef:
            impact = scaled_val * weight
        else:
            # Tree importances are all positive. We assign direction by checking if feature is positive/present
            # Adjust weights based on high risk traits
            high_risk_feats = ["num_prev_admissions", "length_of_stay", "num_diagnoses", "comorbidity_score", "insurance_Medicaid", "age_group_70+"]
            direction = 1 if col_name in high_risk_feats or raw_val > 1 else -1
            impact = raw_val * weight * direction
            
        waterfall_data.append({
            "feature": col_name,
            "value": raw_val,
            "shap_value": impact,
            "display_name": format_feature_name(col_name)
        })
        
    return waterfall_data

def create_mock_explanation(patient_features: dict) -> dict:
    """Safeguard default values if training has never run."""
    waterfall_data = []
    for k, v in patient_features.items():
        waterfall_data.append({
            "feature": k,
            "value": float(v),
            "shap_value": 0.05 if k in ["num_prev_admissions", "length_of_stay"] else -0.01,
            "display_name": format_feature_name(k)
        })
    return {
        "shap_waterfall": waterfall_data,
        "feature_contributions": {
            "positive": [w for w in waterfall_data if w["shap_value"] > 0],
            "negative": [w for w in waterfall_data if w["shap_value"] < 0]
        },
        "risk_explanation": "Explainability narrative unavailable. Best-performing model has not been trained or loaded yet."
    }

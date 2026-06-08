import datetime
import pickle
import numpy as np
import pandas as pd
from sqlalchemy.orm import Session
from backend.database.models import FairnessAudit, ModelVersion

try:
    from fairlearn.metrics import selection_rate, demographic_parity_difference, equalized_odds_difference
    from sklearn.metrics import confusion_matrix
    HAS_FAIRLEARN = True
except ImportError:
    HAS_FAIRLEARN = False

def run_fairness_audit_on_active_model(db: Session, df_features: pd.DataFrame) -> dict:
    """
    Runs Fairlearn checks on the currently active model across Gender, Race, and Age Group.
    Saves audits to database and returns structured report.
    """
    active_model_ver = db.query(ModelVersion).filter(ModelVersion.is_active == True).first()
    if not active_model_ver or not active_model_ver.filepath:
        return {"status": "error", "message": "No active model version available for audit."}

    # Load model artifact
    try:
        with open(active_model_ver.filepath, "rb") as f:
            artifact = pickle.load(f)
            
        model = artifact["model"]
        features_list = artifact["features"]
        imputer = artifact["imputer"]
        scaler = artifact["scaler"]
        active_num_cols = artifact["active_num_cols"]
    except Exception as e:
        return {"status": "error", "message": f"Failed to load model file for audit: {e}"}

    # Extract target and features matching the trained model structure
    categorical_cols = ["gender", "race", "age_group", "insurance", "discharge_disposition"]
    
    # Run the same encoding and imputation on the whole dataset for audit
    df_encoded = pd.get_dummies(df_features, columns=categorical_cols, drop_first=False)
    
    expected_categories = {
        "gender_Female": 0, "gender_Male": 0,
        "race_Caucasian": 0, "race_African American": 0, "race_Asian": 0, "race_Hispanic": 0, "race_Other": 0,
        "age_group_30-": 0, "age_group_30-50": 0, "age_group_50-70": 0, "age_group_70+": 0,
        "insurance_Private": 0, "insurance_Medicare": 0, "insurance_Medicaid": 0, "insurance_Self-Pay": 0, "insurance_Government": 0
    }
    for col, val in expected_categories.items():
        if col not in df_encoded.columns:
            df_encoded[col] = val
            
    exclude_cols = ["admission_id", "patient_id", "readmitted", "age"]
    feature_cols = [c for c in df_encoded.columns if c not in exclude_cols and not c.startswith("discharge_disposition_")]
    
    X = df_encoded[feature_cols]
    y = df_encoded["readmitted"]
    
    # Impute and Scale
    X_imputed = imputer.transform(X)
    imputed_cols = list(X.columns)
    if imputer.indicator_:
        for idx in imputer.indicator_.features_:
            imputed_cols.append(f"{X.columns[idx]}_missing")
    df_imputed = pd.DataFrame(X_imputed, columns=imputed_cols)
    
    df_scaled = df_imputed.copy()
    active_num_in_record = [c for c in active_num_cols if c in df_scaled.columns]
    if active_num_in_record:
        df_scaled[active_num_in_record] = scaler.transform(df_imputed[active_num_in_record])
        
    # Generate predictions
    y_pred = model.predict(df_scaled)
    y_prob = model.predict_proba(df_scaled)[:, 1]
    
    # Sensitive attributes lists from raw df
    sensitive_attrs = {
        "Gender": df_features["gender"],
        "Race": df_features["race"],
        "Age Group": df_features["age_group"]
    }
    
    audit_results = {}
    
    # Execute audits for each sensitive category
    for attr_name, series in sensitive_attrs.items():
        unique_groups = series.unique()
        group_metrics = {}
        
        # 1. Selection rates & error rates per subgroup
        for g_val in unique_groups:
            mask = (series == g_val)
            if mask.sum() == 0:
                continue
                
            y_sub = y[mask]
            y_pred_sub = y_pred[mask]
            y_prob_sub = y_prob[mask]
            
            # Simple calculations
            count = int(mask.sum())
            sel_rate = float(y_pred_sub.mean())
            avg_prob = float(y_prob_sub.mean())
            
            # Confusion matrix metrics
            tn, fp, fn, tp = 0, 0, 0, 0
            if len(y_sub.unique()) > 1 or (0 in y_sub.values and 1 in y_sub.values):
                try:
                    tn, fp, fn, tp = confusion_matrix(y_sub, y_pred_sub, labels=[0,1]).ravel()
                except Exception:
                    pass
            else:
                # Handle edge cases where subgroup is all 0 or all 1
                tp = int(sum((y_sub == 1) & (y_pred_sub == 1)))
                fp = int(sum((y_sub == 0) & (y_pred_sub == 1)))
                fn = int(sum((y_sub == 1) & (y_pred_sub == 0)))
                tn = int(sum((y_sub == 0) & (y_pred_sub == 0)))
                
            fpr = float(fp / (fp + tn)) if (fp + tn) > 0 else 0.0
            fnr = float(fn / (fn + tp)) if (fn + tp) > 0 else 0.0
            
            group_metrics[g_val] = {
                "count": count,
                "selection_rate": sel_rate,
                "average_risk": avg_prob,
                "fpr": fpr,
                "fnr": fnr
            }
            
            # Write individual subgroup metrics to DB
            for metric, val in [("Selection Rate", sel_rate), ("Average Risk", avg_prob), ("FPR", fpr), ("FNR", fnr)]:
                audit = FairnessAudit(
                    model_version=active_model_ver.version,
                    sensitive_attribute=attr_name,
                    metric_name=metric,
                    group_value=str(g_val),
                    metric_value=val
                )
                db.add(audit)
                
        # 2. Parity differences using Fairlearn (if available) or standard math
        selection_rates = [gm["selection_rate"] for gm in group_metrics.values()]
        fpr_rates = [gm["fpr"] for gm in group_metrics.values()]
        fnr_rates = [gm["fnr"] for gm in group_metrics.values()]
        
        # Demographic Parity Difference: max(rate) - min(rate)
        dp_diff = float(max(selection_rates) - min(selection_rates)) if selection_rates else 0.0
        
        # Equalized Odds Difference: max(max_FPR_diff, max_TPR_diff)
        # TPR = 1 - FNR
        tpr_rates = [1.0 - fnr for fnr in fnr_rates]
        fpr_diff = float(max(fpr_rates) - min(fpr_rates)) if fpr_rates else 0.0
        tpr_diff = float(max(tpr_rates) - min(tpr_rates)) if tpr_rates else 0.0
        eo_diff = float(max(fpr_diff, tpr_diff))
        
        # Save differences to DB
        for metric, val in [("Demographic Parity Difference", dp_diff), ("Equalized Odds Difference", eo_diff)]:
            audit = FairnessAudit(
                model_version=active_model_ver.version,
                sensitive_attribute=attr_name,
                metric_name=metric,
                group_value="ALL",
                metric_value=val
            )
            db.add(audit)
            
        audit_results[attr_name] = {
            "demographic_parity_difference": dp_diff,
            "equalized_odds_difference": eo_diff,
            "groups": group_metrics
        }
        
    db.commit()
    
    return {
        "status": "success",
        "model_version": active_model_ver.version,
        "audits": audit_results,
        "timestamp": datetime.datetime.utcnow().isoformat()
    }

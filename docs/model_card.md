# Model Card: Hospital Readmission Prediction Engine

This model card details the training, evaluation, characteristics, and limitations of the machine learning classifiers used in the Clinical Decision Support System.

---

## 1. Model Description

* **Developed by:** CDSS Analytics Group
* **Model Date:** June 2026
* **Model Type:** Binary Classifier (Logistic Regression, Random Forest, XGBoost)
* **Target Variable:** `readmitted` (1 if patient is readmitted within 30 days of discharge, 0 otherwise)
* **Intended Use:** Assisting clinical staff in identifying high-risk patients before discharge to allocate transitional care resources.

---

## 2. Feature Schema & Engineering

The pipeline ingests raw patient demographics, admissions, diagnoses, and procedures, generating the following features:

### Demographics
* **Gender:** Enriched as dummy variables (`gender_Male`, `gender_Female`).
* **Race:** Caucasian, African American, Asian, Hispanic, Other (`race_*` dummy encoding).
* **Age Group:** Categorized into four ranges (`30-`, `30-50`, `50-70`, `70+`) based on age at admission.

### Encounter Metrics
* **Length of Stay:** Number of days between admission and discharge.
* **Previous Admissions:** Cumulative count of previous admissions recorded for the patient before the current encounter date.
* **Number of Diagnoses:** Diagnostic complexity indicator (total ICD-9 codes logged).
* **Number of Procedures:** Quantity of active surgical or clinical procedures logged.
* **Insurance Type:** Private, Medicare, Medicaid, Self-Pay, Government (`insurance_*` dummy encoding).

### Comorbidities (CCS Grouped)
Mapped from ICD-9 diagnoses codes into CCS clinical groups:
* `has_circulatory` (ICD-9 390-459)
* `has_respiratory` (ICD-9 460-519)
* `has_diabetes` (ICD-9 250)
* `has_kidney` (ICD-9 580-629)
* `has_infectious` (ICD-9 001-139)
* **Comorbidity Score:** Aggregated sum of active comorbidity indicators (ranges 0 to 5).

---

## 3. Data Preprocessing & Imputation

1. **Catgorical Dummies:** Automatic alignment of dummy categories to handle sparse demographic samples.
2. **Missing Data Imputation:** Utilizes `SimpleImputer` (median strategy) with an active `Missingness Indicator` to robustly track and learn from missing diagnostic values.
3. **Feature Scaling:** Uses `StandardScaler` to normalize numeric clinical features.

---

## 4. Evaluated Classifiers & Metrics

The system trains three distinct estimators, automatically selecting the best one based on test-set **AUROC**:

| Metric | Logistic Regression | Random Forest | XGBoost |
| :--- | :--- | :--- | :--- |
| **AUROC** | Area Under Receiver Operating Curve | Out-of-bag comparison | Log-loss gradient tree |
| **Recall / Sensitivity** | Captures readmission events | Maximize capture rate | Trade-off tuning |
| **Precision** | Positive predictive accuracy | Minimize false alarms | Department resource check |
| **Brier Score** | Calibration metric | Reliability | Probability accuracy |

*Note: In the validation run, the XGBoost or Logistic Regression model is automatically selected based on which receives the highest AUROC score.*

---

## 5. Intended Users & Clinical Context

* **Attending Physicians:** Review readmission risk percentages and SHAP drivers during discharge checklist review.
* **Transitional Care Managers:** Allocate post-discharge nurse phone calls, home health visits, and early PCP scheduling.
* **Quality Assurance Analysts:** Monitor aggregated department averages and drift stability checks.

# Fairness Audit Report & Clinical Limitations Guide

This document discusses the demographic fairness auditing methodologies implemented via Fairlearn and outlines the essential clinical limitations and guidelines for utilizing AI predictions in hospital environments.

---

## 1. Fairness Auditing Methodology

To prevent algorithmic bias in healthcare delivery, the CDSS audits its active predictive models across three sensitive demographic attributes:
* **Gender:** Male, Female.
* **Race:** Caucasian, African American, Asian, Hispanic, Other.
* **Age Group:** Under 30, 30 to 50, 50 to 70, 70 and Above.

### Core Fairness Metrics
1. **Demographic Parity Difference:** Checks if the selection rate (the percentage of patients flagged as "high risk") is equal across subgroups. A high difference indicates selection bias.
2. **Equalized Odds Difference:** Checks if the error rates (FPR and FNR) are uniform across groups. In clinical settings, keeping equalized odds low is vital so that high-risk patients are not disproportionately missed (high FNR) or incorrectly flagged (high FPR) based on their demographic group.
3. **False Positive Rate (FPR) & False Negative Rate (FNR) per group:** Monitored individually to identify if a particular group experiences higher rate of misclassification.

---

## 2. Clinical Boundaries & System Limitations

The AI-powered CDSS is designed as a **support tool**, not a replacement for medical decision-making. Practitioners must keep the following boundaries in mind:

### 1. Data Bias & Social Determinants of Health (SDOH)
* Predictive features are extracted from Electronic Health Records (EHR). The models do not fully capture social determinants of health (SDOH) such as stable housing, access to transportation, pharmacy proximity, and health literacy, which are strong indicators of post-discharge readmission.
* If a patient lacks transit access, their readmission risk may be higher than predicted by clinical metrics alone.

### 2. Generalizability Limits
* The model is trained on a specific patient demographic distribution matching the seeded database. Performance may degrade if deployed at hospitals with significantly different patient distributions (e.g., specialized pediatric facilities, rural clinics, or safety-net hospitals).
* Data drift monitoring (PSI) should be checked monthly to verify stability.

### 3. Excluded Clinical Indicators
* The pipeline groups primary ICD-9 categories, but does not parse unstructured clinical notes, lab results trends (e.g., serum creatinine, BNP), vital signs stability, or patient self-reported wellness. Attending clinicians should override the model if physical symptoms indicate vulnerability.

### 4. Overreliance Warning (Automation Bias)
* A "Low Risk" model score must not bypass standard discharge safety checklists. If the clinician's judgment suggests a patient is not ready for discharge, that judgment must always take precedence over the machine learning prediction.

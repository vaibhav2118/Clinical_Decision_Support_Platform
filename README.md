# AI-Powered Clinical Decision Support System (CDSS) for Hospital Readmission Risk Prediction

An end-to-end healthcare analytics platform that predicts the probability of patient readmission within 30 days of discharge, helping hospital staff identify high-risk patients, understand risk drivers using Explainable AI (SHAP), monitor model demographic parity (Fairlearn), download clinical PDF reports, and track model quality.

---

## 🌟 Key Features

* **Real-time Patient Risk Assessment:** Calculates 30-day readmission risk percentage and displays it in Low, Medium, and High risk classifications.
* **Explainable AI (SHAP):** Visualizes feature importance contributions (SHAP Waterfall) for every prediction and generates a clinical text explanation.
* **Demographic Fairness Audit (Fairlearn):** Tracks Selection Rates, False Positive Rates, and False Negative Rates across Gender, Race, and Age Group.
* **Patient Directory Management:** Features filtering and search for patient MRNs, admission histories, diagnoses, and procedure logs.
* **Model Versioning & Registry:** Supports classifier evaluation (Logistic Regression, Random Forest, XGBoost), MLflow experiment tracking, and model activation swaps.
* **PDF Report Generation:** Compiles assessment probabilities, SHAP drivers, and transitional care guidelines into downloadable PDF reports using ReportLab.
* **Data Drift Logs:** Tracks Population Stability Index (PSI) values.
* **Security Audit Trail:** Tracks administrative operations, risk queries, and credential logins.

---

## 📂 Project Structure

```text
clinical_decision_support/
├── frontend/                   # React.js + TypeScript SPA
│   ├── src/
│   │   ├── App.tsx             # Main router, pages & Recharts graphics
│   │   ├── index.css           # Premium styling theme and animations
│   │   └── main.tsx
│   ├── Dockerfile
│   └── nginx.conf              # SPA asset routing & API reverse proxy
│
├── backend/                    # FastAPI python services
│   ├── api/
│   │   └── main.py             # API endpoints and startup DB seeder
│   ├── auth/
│   │   └── auth.py             # JWT issuance and Role-Based Access Control
│   ├── database/
│   │   ├── connection.py       # Session manager (PostgreSQL/SQLite)
│   │   └── models.py           # SQLAlchemy tables
│   ├── explainability/
│   │   └── explain.py          # SHAP explanations and narrative builder
│   ├── fairness/
│   │   └── fairness.py         # Fairlearn group auditing services
│   ├── pipelines/
│   │   └── pipeline.py         # Data seeder and ML training pipeline
│   ├── reports/
│   │   └── pdf_generator.py    # ReportLab clinical PDF generator
│   ├── tests/
│   │   └── run_tests.py        # Integration test runner script
│   └── Dockerfile
│
├── docs/                       # Enterprise documentation
│   ├── architecture_and_er_diagram.md
│   ├── model_card.md
│   ├── fairness_and_limitations.md
│   └── deployment_guide.md
│
├── docker-compose.yml          # Container coordination
└── README.md
```

---

## 🚀 Quick Start (Local Development)

### 1. Set Up Backend (Python Virtual Env)
```bash
# Initialize venv
python -m venv .venv
.venv\Scripts\activate

# Install dependencies
pip install -r backend/requirements.txt

# Run backend validation tests
python backend/tests/run_tests.py

# Launch FastAPI server
python -m uvicorn backend.api.main:app --host 127.0.0.1 --port 8000 --reload
```

### 2. Set Up Frontend (Vite)
```bash
cd frontend
npm install
npm run dev
```
Open `http://localhost:5173/` in your browser.

*Credentials:* Log in with user `doctor` / password `doctor` or user `admin` / password `admin`.

---

## 🐳 Docker Production Setup
Orchestrates PostgreSQL, Redis, MLflow, FastAPI Backend, and React Frontend:
```bash
docker-compose up --build -d
```
Open `http://localhost:80` for the React app, and `http://localhost:5000` for the MLflow tracking dashboard.

---

## 📖 Detailed System Documentation

For in-depth technical analysis and guidelines, refer to the following documents in the `docs/` folder:
1. **[System Architecture & ER Diagrams](file:///c:/Users/vaibh/OneDrive/Documents/clinical_decision_support/docs/architecture_and_er_diagram.md):** Architectural flows and database relations.
2. **[Model Card Details](file:///c:/Users/vaibh/OneDrive/Documents/clinical_decision_support/docs/model_card.md):** Technical details of predictors and preprocessings.
3. **[Fairness & Clinical Limitations](file:///c:/Users/vaibh/OneDrive/Documents/clinical_decision_support/docs/fairness_and_limitations.md):** Parity checks and warning guides.
4. **[Deployment & Setup Guide](file:///c:/Users/vaibh/OneDrive/Documents/clinical_decision_support/docs/deployment_guide.md):** Full setup and config guides.

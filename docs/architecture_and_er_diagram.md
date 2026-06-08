# CDSS System Architecture & Database ER Diagrams

This document contains visual diagrams mapping out the clinical decision support system's components, internal communication paths, and relational database schema.

---

## 1. System Architecture Diagram

The diagram below details the data flow between user sessions, API endpoints, internal pipelines, machine learning registries, and output reports.

```mermaid
flowchart TB
    %% Nodes
    subgraph Frontend [React TS Client Application]
        UI[UI Dashboard & Directory]
        AuthC[Auth Context & RBAC]
        Charts[Recharts Visualization]
        PDFD[PDF Downloader]
    end

    subgraph API [FastAPI Gateway Services]
        Router[FastAPI Router]
        AuthM[JWT & Password Authenticator]
        Audit[System Audit Logger]
    end

    subgraph ML [Machine Learning Core & Pipeline]
        Pipe[Ingestion & Feature Engine]
        Impute[MICE & Simple Imputer]
        Train[LR / RF / XGBoost Classifiers]
        SHAP[SHAP Explainability Module]
        Fair[Fairlearn Bias Audit]
    end

    subgraph Storage [Persistent Storage & Logging]
        DB[(SQLite / PostgreSQL DB)]
        Cache[(In-Memory Caching)]
        MLF[(MLflow Local Experiment Registry)]
        Disk[(Reports Disk Cache)]
    end

    %% Connections
    UI -->|HTTPS Request| Router
    AuthC -->|JWT Token| AuthM
    Router --> AuthM
    Router -->|Query Database| DB
    Router -->|Check Token Cache| Cache
    
    Router -->|Trigger Predict & XAI| SHAP
    SHAP -->|Load Active Model| DB
    SHAP -->|Feature Input| Pipe
    
    Pipe --> Impute
    Impute --> Train
    Train -->|Save Artifacts| MLF
    Train -->|Register Model Version| DB
    
    Router -->|Auditing| Fair
    Fair -->|Group Metrics| DB
    
    Router -->|Compile Document| PDFD
    PDFD -->|ReportLab Builder| Disk
    Disk -->|PDF Binary Stream| UI
    
    Router -->|Write Operations Logs| Audit
    Audit -->|Write Records| DB
```

---

## 2. Database Entity Relationship (ER) Diagram

The following diagram maps out our SQLAlchemy table models, indices, primary keys, and foreign keys.

```mermaid
erDiagram
    ROLES ||--o{ USERS : "assigned to"
    USERS ||--o{ RISK_ASSESSMENTS : "assesses"
    USERS ||--o{ AUDIT_LOGS : "logs actions of"
    USERS ||--o{ PDF_REPORTS : "generates"
    
    PATIENTS ||--o{ ADMISSIONS : "undergoes"
    PATIENTS ||--o{ RISK_ASSESSMENTS : "evaluated for"
    PATIENTS ||--o{ PDF_REPORTS : "receives"
    
    ADMISSIONS ||--o{ DIAGNOSES : "has"
    ADMISSIONS ||--o{ PROCEDURES : "undergoes"
    ADMISSIONS ||--o{ RISK_ASSESSMENTS : "has readmission risk calculated for"
    ADMISSIONS ||--o{ PDF_REPORTS : "has report generated for"

    ROLES {
        int id PK
        string name "Unique Role Name"
        json permissions
    }

    USERS {
        int id PK
        string username
        string email
        string hashed_password
        int role_id FK
        boolean is_active
        datetime created_at
    }

    PATIENTS {
        int id PK
        string patient_mrn UK
        string gender
        string race
        datetime date_of_birth
        datetime created_at
    }

    ADMISSIONS {
        int id PK
        int patient_id FK
        datetime admission_date
        datetime discharge_date
        string admission_type
        string discharge_disposition
        string insurance
        datetime created_at
    }

    DIAGNOSES {
        int id PK
        int admission_id FK
        string code
        string description
        string category "CCS Mapped Category"
    }

    PROCEDURES {
        int id PK
        int admission_id FK
        string code
        string description
    }

    RISK_ASSESSMENTS {
        int id PK
        int patient_id FK
        int admission_id FK
        float probability
        string risk_tier
        json shap_summary
        json shap_waterfall
        json feature_contributions
        text risk_explanation
        string model_version
        int assessor_id FK
        datetime created_at
    }

    FAIRNESS_AUDITS {
        int id PK
        string model_version
        string sensitive_attribute "Gender, Race, Age Group"
        string metric_name "DP Diff, EO Diff, FPR, FNR"
        string group_value "Subgroup name or ALL"
        float metric_value
        datetime created_at
    }

    PDF_REPORTS {
        int id PK
        int patient_id FK
        int admission_id FK
        string file_path
        int created_by FK
        datetime created_at
    }

    MODEL_VERSIONS {
        int id PK
        string version UK
        string name "Model Name (XGBoost, etc.)"
        json metrics
        json parameters
        string filepath
        boolean is_active
        datetime created_at
    }

    AUDIT_LOGS {
        int id PK
        int user_id FK
        string username
        string action
        string ip_address
        text details
        datetime timestamp
    }
```

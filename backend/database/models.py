import datetime
from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime, Boolean, JSON, Text
from sqlalchemy.orm import relationship
from backend.database.connection import Base

class Role(Base):
    __tablename__ = "roles"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(50), unique=True, nullable=False, index=True)  # Admin, Doctor, Nurse, Analyst
    permissions = Column(JSON, nullable=True)

    users = relationship("User", back_populates="role")

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, nullable=False, index=True)
    email = Column(String(100), unique=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    role_id = Column(Integer, ForeignKey("roles.id"), nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    role = relationship("Role", back_populates="users")
    risk_assessments = relationship("RiskAssessment", back_populates="assessor")
    audit_logs = relationship("AuditLog", back_populates="user")

class Patient(Base):
    __tablename__ = "patients"

    id = Column(Integer, primary_key=True, index=True)
    patient_mrn = Column(String(50), unique=True, nullable=False, index=True)
    gender = Column(String(20), nullable=False)  # Female, Male
    race = Column(String(50), nullable=False)    # Caucasian, African American, Asian, Hispanic, Other
    date_of_birth = Column(DateTime, nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    admissions = relationship("Admission", back_populates="patient", cascade="all, delete-orphan")
    risk_assessments = relationship("RiskAssessment", back_populates="patient", cascade="all, delete-orphan")
    pdf_reports = relationship("PDFReport", back_populates="patient", cascade="all, delete-orphan")

class Admission(Base):
    __tablename__ = "admissions"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id"), nullable=False)
    admission_date = Column(DateTime, nullable=False)
    discharge_date = Column(DateTime, nullable=False)
    admission_type = Column(String(50), nullable=False)  # Emergency, Urgent, Elective
    discharge_disposition = Column(String(100), nullable=False)  # Discharged to home, Transferred, etc.
    insurance = Column(String(50), nullable=False)        # Private, Medicaid, Medicare, Government, Self-Pay
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    patient = relationship("Patient", back_populates="admissions")
    diagnoses = relationship("Diagnosis", back_populates="admission", cascade="all, delete-orphan")
    procedures = relationship("Procedure", back_populates="admission", cascade="all, delete-orphan")
    risk_assessments = relationship("RiskAssessment", back_populates="admission", cascade="all, delete-orphan")
    pdf_reports = relationship("PDFReport", back_populates="admission", cascade="all, delete-orphan")

class Diagnosis(Base):
    __tablename__ = "diagnoses"

    id = Column(Integer, primary_key=True, index=True)
    admission_id = Column(Integer, ForeignKey("admissions.id"), nullable=False)
    code = Column(String(20), nullable=False, index=True)  # ICD-9 code (e.g. 428.0)
    description = Column(String(255), nullable=True)
    category = Column(String(100), nullable=False)  # Mapped via CCS Grouper

    admission = relationship("Admission", back_populates="diagnoses")

class Procedure(Base):
    __tablename__ = "procedures"

    id = Column(Integer, primary_key=True, index=True)
    admission_id = Column(Integer, ForeignKey("admissions.id"), nullable=False)
    code = Column(String(20), nullable=False, index=True)  # ICD-9/CPT code
    description = Column(String(255), nullable=True)

    admission = relationship("Admission", back_populates="procedures")

class RiskAssessment(Base):
    __tablename__ = "risk_assessments"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id"), nullable=False)
    admission_id = Column(Integer, ForeignKey("admissions.id"), nullable=False)
    probability = Column(Float, nullable=False)
    risk_tier = Column(String(20), nullable=False)  # Low, Medium, High
    shap_summary = Column(JSON, nullable=True)      # Global SHAP features list
    shap_waterfall = Column(JSON, nullable=True)    # Local SHAP contributions for this patient
    feature_contributions = Column(JSON, nullable=True)
    risk_explanation = Column(Text, nullable=True)
    model_version = Column(String(50), nullable=False)
    assessor_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    patient = relationship("Patient", back_populates="risk_assessments")
    admission = relationship("Admission", back_populates="risk_assessments")
    assessor = relationship("User", back_populates="risk_assessments")

class FairnessAudit(Base):
    __tablename__ = "fairness_audits"

    id = Column(Integer, primary_key=True, index=True)
    model_version = Column(String(50), nullable=False)
    sensitive_attribute = Column(String(50), nullable=False)  # Gender, Race, Age Group
    metric_name = Column(String(100), nullable=False)          # Demographic Parity, Equalized Odds, FPR, FNR
    group_value = Column(String(100), nullable=False)          # e.g. Male, Female, Caucasian, etc.
    metric_value = Column(Float, nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class PDFReport(Base):
    __tablename__ = "pdf_reports"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id"), nullable=False)
    admission_id = Column(Integer, ForeignKey("admissions.id"), nullable=False)
    file_path = Column(String(255), nullable=False)
    created_by = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    patient = relationship("Patient", back_populates="pdf_reports")
    admission = relationship("Admission", back_populates="pdf_reports")

class ModelVersion(Base):
    __tablename__ = "model_versions"

    id = Column(Integer, primary_key=True, index=True)
    version = Column(String(50), unique=True, nullable=False, index=True)
    name = Column(String(100), nullable=False)  # XGBoost, Random Forest, etc.
    metrics = Column(JSON, nullable=True)       # AUROC, Recall, etc.
    parameters = Column(JSON, nullable=True)
    filepath = Column(String(255), nullable=True)
    is_active = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    username = Column(String(50), nullable=True)
    action = Column(String(100), nullable=False)  # Login, Patient Access, Risk Assessment, etc.
    ip_address = Column(String(50), nullable=True)
    details = Column(Text, nullable=True)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", back_populates="audit_logs")

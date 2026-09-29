from datetime import datetime
from sqlalchemy import (
    Column, Integer, String, Float, Boolean, Text, DateTime, ForeignKey, JSON
)
from sqlalchemy.orm import relationship
from backend.app.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, index=True, nullable=False)
    role = Column(String(30), default="clinician") # oncologist, pathologist, pharmacist, researcher, admin
    department = Column(String(100), default="Thoracic Oncology")
    created_at = Column(DateTime, default=datetime.utcnow)

    approvals = relationship("Approval", back_populates="approver")
    audit_logs = relationship("AuditLog", back_populates="user")


class Patient(Base):
    __tablename__ = "patients"

    id = Column(String(50), primary_key=True, index=True) # De-identified ID e.g. PT-NSCLC-0104
    age = Column(Integer, nullable=False)
    sex = Column(String(10), nullable=False)
    smoking_history = Column(String(30), default="Unknown") # Current, Former, Never
    primary_diagnosis = Column(String(100), default="Non-Small Cell Lung Cancer (NSCLC)")
    stage_category = Column(String(20), default="Stage IV") # Stage III, Stage IV
    biomarkers = Column(JSON, default=dict) # EGFR, ALK, KRAS, PD-L1, ctDNA, TMB
    clinical_labs = Column(JSON, default=dict) # creatinine, alt, ast, platelets, anc
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    clinical_notes = relationship("ClinicalNote", back_populates="patient", cascade="all, delete-orphan")
    ml_predictions = relationship("MLPrediction", back_populates="patient", cascade="all, delete-orphan")
    dl_predictions = relationship("DLPrediction", back_populates="patient", cascade="all, delete-orphan")
    nlp_entities = relationship("NLPEntityRecord", back_populates="patient", cascade="all, delete-orphan")
    slm_summaries = relationship("SLMSummary", back_populates="patient", cascade="all, delete-orphan")
    agent_runs = relationship("AgentRun", back_populates="patient", cascade="all, delete-orphan")


class ClinicalNote(Base):
    __tablename__ = "clinical_notes"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(String(50), ForeignKey("patients.id"), nullable=False)
    author_role = Column(String(50), default="Thoracic Oncologist")
    raw_text = Column(Text, nullable=False)
    deidentified_text = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    patient = relationship("Patient", back_populates="clinical_notes")


class MLPrediction(Base):
    __tablename__ = "ml_predictions"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(String(50), ForeignKey("patients.id"), nullable=False)
    model_name = Column(String(50), nullable=False)
    risk_level = Column(String(20), nullable=False) # Low, Moderate, High
    prob_low = Column(Float, nullable=False)
    prob_moderate = Column(Float, nullable=False)
    prob_high = Column(Float, nullable=False)
    feature_contributions = Column(JSON, default=dict)
    calibration_applied = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    patient = relationship("Patient", back_populates="ml_predictions")


class DLPrediction(Base):
    __tablename__ = "dl_predictions"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(String(50), ForeignKey("patients.id"), nullable=False)
    image_type = Column(String(50), default="histopathology")
    image_result = Column(String(255), nullable=False)
    temporal_result = Column(String(255), nullable=False)
    confidence = Column(Float, nullable=False)
    demo_mode = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    patient = relationship("Patient", back_populates="dl_predictions")


class NLPEntityRecord(Base):
    __tablename__ = "nlp_entities"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(String(50), ForeignKey("patients.id"), nullable=False)
    gene_mutations = Column(JSON, default=list)
    drug_names = Column(JSON, default=list)
    dosages = Column(JSON, default=list)
    adverse_events = Column(JSON, default=list)
    negated_entities = Column(JSON, default=list)
    urgency = Column(String(20), default="Moderate")
    confidence = Column(Float, default=0.92)
    created_at = Column(DateTime, default=datetime.utcnow)

    patient = relationship("Patient", back_populates="nlp_entities")


class SLMSummary(Base):
    __tablename__ = "slm_summaries"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(String(50), ForeignKey("patients.id"), nullable=False)
    summary_text = Column(Text, nullable=False)
    model_name = Column(String(100), default="SmolLM2-135M-Instruct-LoRA (Fallback Engine)")
    rouge_l = Column(Float, default=0.88)
    factual_consistency_score = Column(Float, default=0.96)
    omission_count = Column(Integer, default=0)
    latency_ms = Column(Float, default=42.0)
    created_at = Column(DateTime, default=datetime.utcnow)

    patient = relationship("Patient", back_populates="slm_summaries")


class GenAIScenario(Base):
    __tablename__ = "genai_scenarios"

    id = Column(Integer, primary_key=True, index=True)
    seed_hash = Column(String(64), index=True)
    scenario_type = Column(String(30), nullable=False) # Mild, Moderate, Severe, Wildcard
    genomic_profile = Column(JSON, nullable=False)
    clinical_profile = Column(JSON, nullable=False)
    progression_pattern = Column(Text, nullable=False)
    toxicity_pattern = Column(Text, nullable=False)
    rationale = Column(Text, nullable=False)
    realism_score = Column(Float, nullable=False)
    warnings = Column(JSON, default=list)
    is_synthetic = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)


class AgentRun(Base):
    __tablename__ = "agent_runs"

    id = Column(String(50), primary_key=True, index=True)
    patient_id = Column(String(50), ForeignKey("patients.id"), nullable=False)
    goal = Column(Text, nullable=False)
    status = Column(String(30), default="Awaiting Human Approval") # Running, Awaiting Human Approval, Approved, Rejected
    recommendation_summary = Column(Text, nullable=False)
    trial_recommendation = Column(JSON, nullable=True)
    therapy_option = Column(JSON, nullable=True)
    evidence_citations = Column(JSON, default=list)
    requires_human_approval = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    patient = relationship("Patient", back_populates="agent_runs")
    tool_calls = relationship("ToolCall", back_populates="agent_run", cascade="all, delete-orphan")
    approval = relationship("Approval", back_populates="agent_run", uselist=False)


class ToolCall(Base):
    __tablename__ = "tool_calls"

    id = Column(Integer, primary_key=True, index=True)
    agent_run_id = Column(String(50), ForeignKey("agent_runs.id"), nullable=False)
    step_number = Column(Integer, nullable=False)
    tool_name = Column(String(80), nullable=False)
    tool_input = Column(JSON, default=dict)
    tool_output = Column(JSON, default=dict)
    thought_reasoning = Column(Text, nullable=True)
    latency_ms = Column(Float, default=10.0)
    created_at = Column(DateTime, default=datetime.utcnow)

    agent_run = relationship("AgentRun", back_populates="tool_calls")


class Approval(Base):
    __tablename__ = "approvals"

    id = Column(Integer, primary_key=True, index=True)
    agent_run_id = Column(String(50), ForeignKey("agent_runs.id"), nullable=False, unique=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    decision = Column(String(20), nullable=False) # Approved, Rejected, Modified
    clinician_notes = Column(Text, nullable=True)
    timestamp = Column(DateTime, default=datetime.utcnow)

    agent_run = relationship("AgentRun", back_populates="approval")
    approver = relationship("User", back_populates="approvals")


class ModelMetric(Base):
    __tablename__ = "model_metrics"

    id = Column(Integer, primary_key=True, index=True)
    stage = Column(String(30), nullable=False) # ML, DL, NLP, SLM, GenAI, Agent
    metric_name = Column(String(50), nullable=False)
    metric_value = Column(Float, nullable=False)
    split = Column(String(20), default="test")
    dataset_version = Column(String(50), default="v1.0")
    timestamp = Column(DateTime, default=datetime.utcnow)


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)
    stage = Column(String(30), nullable=False) # Patient, ML, DL, NLP, SLM, GenAI, Agent, Safety
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    input_reference = Column(String(100), nullable=True) # e.g. Patient ID or Note ID
    model_name = Column(String(80), nullable=True)
    confidence = Column(Float, nullable=True)
    validation_status = Column(String(20), default="PASS") # PASS, WARN, FAIL
    warnings = Column(JSON, default=list)
    output_summary = Column(Text, nullable=True)
    requires_approval = Column(Boolean, default=False)
    approval_status = Column(String(20), nullable=True) # Pending, Approved, Rejected

    user = relationship("User", back_populates="audit_logs")

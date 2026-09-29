from typing import Dict, Any, List, Optional
from pydantic import BaseModel, Field

# Demographics & Clinical Schemas
class Demographics(BaseModel):
    age: int = Field(..., ge=18, le=105, description="Patient age between 18 and 105")
    sex: str = Field(..., description="Biological sex (Male, Female)")
    smoking_history: str = Field("Former", description="Current, Former, Never")
    primary_diagnosis: str = Field("Non-Small Cell Lung Cancer (NSCLC)")
    stage_category: str = Field("Stage IV")

class ClinicalFeatures(BaseModel):
    creatinine_mg_dl: float = Field(1.0, ge=0.2, le=10.0)
    alt_u_l: float = Field(28.0, ge=5.0, le=500.0)
    ast_u_l: float = Field(24.0, ge=5.0, le=500.0)
    platelets_k_ul: float = Field(220.0, ge=20.0, le=1000.0)
    anc_k_ul: float = Field(3.8, ge=0.5, le=30.0)
    tmb_mut_mb: float = Field(8.5, ge=0.0, le=100.0, description="Tumor Mutational Burden (mut/Mb)")
    ctdna_change_pct: float = Field(12.5, description="ctDNA longitudinal trajectory percent change")

class GenomicFeatures(BaseModel):
    egfr_status: str = Field("Exon 19 del", description="e.g. Exon 19 del, L858R, T790M, Wildtype")
    alk_status: str = Field("Negative", description="Positive, Negative")
    kras_status: str = Field("Negative", description="G12C, G12D, Negative")
    pdl1_tps_pct: float = Field(45.0, ge=0.0, le=100.0, description="PD-L1 Tumor Proportion Score (%)")
    other_mutations: List[str] = Field(default_factory=list)

# Unified Patient State
class PatientState(BaseModel):
    patient_id: str
    demographics: Dict[str, Any]
    clinical_features: Dict[str, Any]
    genomic_features: Dict[str, Any]
    ml_risk: Dict[str, Any] = Field(default_factory=dict)
    dl_findings: Dict[str, Any] = Field(default_factory=dict)
    nlp_entities: Dict[str, Any] = Field(default_factory=dict)
    urgency: Dict[str, Any] = Field(default_factory=dict)
    slm_summary: str = ""
    genai_scenarios: List[Dict[str, Any]] = Field(default_factory=list)
    agent_decision_support: Dict[str, Any] = Field(default_factory=dict)
    confidence: Dict[str, float] = Field(default_factory=dict)
    warnings: List[str] = Field(default_factory=list)
    requires_human_review: bool = True

# Stage 1: ML Schemas
class MLPredictRequest(BaseModel):
    patient_id: Optional[str] = None
    age: int = Field(65, ge=18, le=105)
    smoking_history: str = "Former"
    creatinine_mg_dl: float = 1.1
    alt_u_l: float = 32.0
    ast_u_l: float = 29.0
    platelets_k_ul: float = 210.0
    anc_k_ul: float = 3.6
    tmb_mut_mb: float = 9.2
    ctdna_change_pct: float = 18.0
    egfr_positive: bool = True
    alk_positive: bool = False
    kras_positive: bool = False
    pdl1_tps_pct: float = 40.0

class MLProbabilities(BaseModel):
    Low: float
    Moderate: float
    High: float

class MLPredictResponse(BaseModel):
    risk_level: str
    probabilities: MLProbabilities
    model: str
    calibration: Dict[str, Any]
    confidence_score: float
    warnings: List[str] = Field(default_factory=list)

# Stage 2: DL Schemas
class DLAnalyzeRequest(BaseModel):
    patient_id: Optional[str] = None
    image_type: str = "histopathology" # histopathology, radiological_ct
    image_data_b64: Optional[str] = None
    time_series_ctdna: List[float] = Field(default_factory=lambda: [1.2, 1.5, 2.1, 3.4, 4.8])
    time_series_cea: List[float] = Field(default_factory=lambda: [4.1, 4.5, 5.8, 8.2, 11.5])

class DLAnalyzeResponse(BaseModel):
    image_result: str
    temporal_result: str
    confidence: float
    demo_mode: bool
    details: Dict[str, Any]
    warnings: List[str] = Field(default_factory=list)

# Stage 3: NLP Schemas
class NLPAnalyzeRequest(BaseModel):
    patient_id: Optional[str] = None
    clinical_note: str

class NLPEntities(BaseModel):
    gene_mutation: List[str]
    drug_name: List[str]
    dosage: List[str]
    adverse_event: List[str]
    negated_entities: List[str] = Field(default_factory=list)
    urgency: str

class NLPAnalyzeResponse(BaseModel):
    gene_mutation: List[str]
    drug_name: List[str]
    dosage: List[str]
    adverse_event: List[str]
    negated_entities: List[str] = Field(default_factory=list)
    urgency: str
    deidentified_note: str
    confidence: float
    warnings: List[str] = Field(default_factory=list)

# Stage 4: SLM Schemas
class SLMSummarizeRequest(BaseModel):
    patient_id: Optional[str] = None
    gene: Optional[str] = None
    drug: Optional[str] = None
    dosage: Optional[str] = None
    adverse_event: Optional[str] = None
    urgency: Optional[str] = "High"
    risk: Optional[str] = "High"
    dl_finding: Optional[str] = None

class SLMSummarizeResponse(BaseModel):
    summary: str
    model: str
    evaluation: Dict[str, Any]
    latency_ms: float
    warnings: List[str] = Field(default_factory=list)

# Stage 5: GenAI Schemas
class GenAIGenerateRequest(BaseModel):
    scenario_type: str = Field("Severe", description="Mild, Moderate, Severe, Wildcard")
    tmb_threshold: float = 15.0
    ctdna_trend: str = "rising >20% per cycle"
    renal_function: str = "impaired" # normal, mild impairment, impaired
    organ_involvement: str = "multiple organ involvement (pleura + adrenal)"
    genomic_mutations: List[str] = Field(default_factory=lambda: ["EGFR L858R", "MET amplification"])
    therapy_info: str = "First-line Osimertinib resistance acquired"

class GenAIScenarioResponse(BaseModel):
    scenario_type: str
    genomic_profile: Dict[str, Any]
    clinical_profile: Dict[str, Any]
    progression_pattern: str
    toxicity_pattern: str
    rationale: str
    realism_score: float
    warnings: List[str]
    is_synthetic: bool = True

# Stage 6: Agentic AI Schemas
class AgentRunRequest(BaseModel):
    patient_id: str
    clinical_objective: str = "Optimize targeted therapy and clinical trial prioritization under organ toxicity constraints"
    candidate_patient_b_id: Optional[str] = None # For competition / limited slot scenario

class ToolTraceEntry(BaseModel):
    step: int
    tool: str
    input: Dict[str, Any]
    output: Dict[str, Any]
    reasoning: str
    latency_ms: float

class AgentRunResponse(BaseModel):
    run_id: str
    patient_id: str
    goal: str
    traces: List[ToolTraceEntry]
    decision_support_summary: str
    recommended_trial: Optional[Dict[str, Any]]
    recommended_therapy: Optional[Dict[str, Any]]
    evidence_citations: List[Dict[str, str]]
    requires_human_approval: bool = True
    status: str
    disclaimer: str

class ApprovalActionRequest(BaseModel):
    agent_run_id: str
    decision: str = Field(..., description="Approved, Rejected, Modified")
    clinician_notes: Optional[str] = None
    approver_username: str = "Dr. OncoClinician"

class ApprovalActionResponse(BaseModel):
    agent_run_id: str
    status: str
    decision: str
    timestamp: str
    message: str

# System Health
class HealthResponse(BaseModel):
    backend_status: str
    database_status: str
    ml_model_status: str
    dl_model_status: str
    nlp_status: str
    slm_status: str
    genai_availability: str
    agent_availability: str
    demo_mode: bool
    version: str

export interface Demographics {
  age: number;
  sex: string;
  smoking_history: string;
  primary_diagnosis: string;
  stage_category: string;
}

export interface ClinicalFeatures {
  creatinine_mg_dl: number;
  alt_u_l: number;
  ast_u_l: number;
  platelets_k_ul: number;
  anc_k_ul: number;
  tmb_mut_mb: number;
  ctdna_change_pct: number;
}

export interface GenomicFeatures {
  egfr_status: string;
  alk_status: string;
  kras_status: string;
  pdl1_tps_pct: number;
  other_mutations?: string[];
}

export interface MLPrediction {
  risk_level: 'Low' | 'Moderate' | 'High';
  probabilities: {
    Low: number;
    Moderate: number;
    High: number;
  };
  model: string;
  calibration: {
    available: boolean;
    method?: string;
  };
  confidence_score: number;
  warnings: string[];
}

export interface DLPrediction {
  image_result: string;
  temporal_result: string;
  confidence: number;
  demo_mode: boolean;
  details?: {
    image_subtypes?: Record<string, number>;
    ctdna_delta_pct?: number;
    temporal_category?: string;
    pipeline_trace?: Array<{ stage: string; status: string; resolution?: string; features?: number; hidden_dim?: number }>;
  };
  warnings: string[];
}

export interface NLPEntities {
  gene_mutation: string[];
  drug_name: string[];
  dosage: string[];
  adverse_event: string[];
  negated_entities: string[];
  urgency: 'Low' | 'Moderate' | 'High';
  deidentified_note: string;
  confidence: number;
  warnings: string[];
  engine?: string;
}

export interface SLMSummary {
  summary: string;
  model: string;
  evaluation: {
    rouge1: number;
    rouge2: number;
    rougeL: number;
    factual_consistency_score: number;
    omission_count: number;
    omissions: string[];
    hallucination_detected: boolean;
    latency_ms: number;
  };
  latency_ms: number;
  warnings: string[];
}

export interface GenAIScenario {
  scenario_type: 'Mild' | 'Moderate' | 'Severe' | 'Wildcard';
  genomic_profile: {
    primary_driver: string;
    secondary_alterations: string[];
    tmb_mut_mb: number;
    pdl1_tps_pct: number;
  };
  clinical_profile: {
    age: number;
    renal_status: string;
    creatinine_mg_dl: number;
    metastatic_sites: string[];
    ecog_performance: number;
  };
  progression_pattern: string;
  toxicity_pattern: string;
  rationale: string;
  realism_score: number;
  warnings: string[];
  is_synthetic: boolean;
}

export interface ToolTrace {
  step: number;
  tool: string;
  input: Record<string, any>;
  output: Record<string, any>;
  reasoning: string;
  latency_ms: number;
}

export interface AgentDecisionSupport {
  run_id?: string;
  patient_id?: string;
  goal?: string;
  traces?: ToolTrace[];
  decision_support_summary?: string;
  recommended_trial?: {
    trial_id: string;
    title: string;
    available_slots: number;
    eligibility_confirmed?: boolean;
    patient_eligible?: boolean;
  };
  recommended_therapy?: {
    drug: string;
    tier: string;
    copay_estimate: string;
    in_stock?: boolean;
  };
  evidence_citations?: Array<{ doc_id: string; title: string }>;
  requires_human_approval: boolean;
  status: 'Awaiting Human Approval' | 'Approved' | 'Rejected' | 'Modified';
  clinician_action?: {
    decision: string;
    approver: string;
    notes: string;
    timestamp: string;
  };
  disclaimer?: string;
}

export interface PatientState {
  patient_id: string;
  demographics: Demographics;
  clinical_features: ClinicalFeatures;
  genomic_features: GenomicFeatures;
  clinical_note?: string;
  ml_risk: MLPrediction;
  dl_findings: DLPrediction;
  nlp_entities: NLPEntities;
  urgency: {
    level: 'Low' | 'Moderate' | 'High';
    confidence: number;
  };
  slm_summary: string;
  genai_scenarios: GenAIScenario[];
  agent_decision_support: AgentDecisionSupport;
  confidence: {
    ml: number;
    dl: number;
    nlp: number;
    slm_factual_consistency: number;
  };
  warnings: string[];
  requires_human_review: boolean;
}

export interface AuditLogItem {
  id: number;
  timestamp: string;
  stage: string;
  user_id: string;
  input_reference: string;
  model_name: string;
  confidence: number;
  validation_status: string;
  warnings: string[];
  output_summary: string;
  requires_approval: boolean;
  approval_status: string;
}

export interface HealthState {
  backend_status: string;
  database_status: string;
  ml_model_status: string;
  dl_model_status: string;
  nlp_status: string;
  slm_status: string;
  genai_availability: string;
  agent_availability: string;
  demo_mode: boolean;
  version: string;
}

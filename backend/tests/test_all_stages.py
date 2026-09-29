import pytest
import numpy as np
import pandas as pd

from backend.safety.validators import validate_patient_input
from backend.safety.guardrails import enforce_safety_guardrails, sanitize_and_deidentify_text
from backend.ml.predict import predict_patient_risk
from backend.ml.preprocess import clean_and_validate_dataframe
from backend.dl.predict import run_dl_analysis
from backend.nlp.service import analyze_clinical_text
from backend.nlp.negation import is_entity_negated
from backend.slm.inference import summarize_structured_patient_state
from backend.slm.evaluate import audit_factual_consistency, compute_rouge_scores
from backend.genai.generator import generate_synthetic_scenario
from backend.genai.validator import validate_synthetic_scenario
from backend.genai.schema import SeedConditions
from backend.agent.workflow import run_agentic_decision_support
from backend.agent.approval import ClinicianApprovalManager

# 1. Validation & Safety Tests
def test_valid_patient():
    data = {"age": 65, "creatinine_mg_dl": 1.1, "alt_u_l": 25.0}
    is_valid, errors, warnings = validate_patient_input(data)
    assert is_valid is True
    assert len(errors) == 0

def test_invalid_age():
    # As explicitly specified in prompt: Age = 120 must be rejected
    data = {"age": 120}
    is_valid, errors, warnings = validate_patient_input(data)
    assert is_valid is False
    assert any("demo range" in err for err in errors)

def test_prohibited_fabricated_column():
    data = {"age": 60, "TNM_T": "T2", "tumor_size_cm": 4.5}
    is_valid, errors, warnings = validate_patient_input(data)
    assert any("unreliable/artificial project feature" in w for w in warnings)

def test_deidentification():
    raw = "Patient Jane Doe (MRN: 94820194, phone 555-123-4567) was examined by Dr. Smith on 2024-05-12."
    cleaned = sanitize_and_deidentify_text(raw)
    assert "Jane Doe" not in cleaned
    assert "94820194" not in cleaned
    assert "555-123-4567" not in cleaned
    assert "[REDACTED" in cleaned

# 2. ML Pipeline Tests
def test_duplicate_removal_and_no_leakage():
    df = pd.DataFrame({
        "patient_id": ["PT-1", "PT-1", "PT-2"],
        "age": [60, 60, 70],
        "smoking_history": ["Never", "Never", "Former"],
        "creatinine_mg_dl": [1.0, 1.0, 1.2],
        "TNM_T": ["T1", "T1", "T2"] # prohibited column
    })
    cleaned_df, audit = clean_and_validate_dataframe(df)
    assert len(cleaned_df) == 2
    assert audit["duplicate_records_removed"] == 1
    assert "TNM_T" not in cleaned_df.columns
    assert "patient_id" not in cleaned_df.columns

def test_ml_predict_high_risk():
    high_risk_data = {
        "age": 72,
        "creatinine_mg_dl": 2.2, # high
        "alt_u_l": 95.0, # high
        "ctdna_change_pct": 35.0, # rapid rise
        "tmb_mut_mb": 22.0
    }
    res = predict_patient_risk(high_risk_data)
    assert res["risk_level"] in ["High", "Moderate"]
    assert "probabilities" in res
    assert res["calibration"]["available"] is True

# 3. DL Tests
def test_dl_multimodal():
    res = run_dl_analysis({
        "image_type": "histopathology",
        "time_series_ctdna": [1.0, 1.5, 2.8, 4.2]
    })
    assert res["demo_mode"] is True
    assert "image_result" in res
    assert "temporal_result" in res
    assert 0.0 < res["confidence"] <= 1.0

# 4. NLP Tests
def test_nlp_extraction_and_negation():
    note = "Patient with EGFR mutation is receiving Osimertinib 80mg. Patient developed severe fatigue and denies shortness of breath. Urgent review recommended."
    res = analyze_clinical_text(note)
    assert "EGFR" in res["gene_mutation"]
    assert "Osimertinib" in res["drug_name"]
    assert any("80mg" in d for d in res["dosage"])
    assert "severe fatigue" in res["adverse_event"]
    # Negation check: 'shortness of breath' was explicitly denied
    assert any("shortness of breath" in neg for neg in res["negated_entities"])
    assert "shortness of breath" not in res["adverse_event"]
    assert res["urgency"] == "High"

def test_nlp_empty_note():
    res = analyze_clinical_text("")
    assert res["urgency"] == "Low"
    assert len(res["warnings"]) > 0

# 5. SLM Tests
def test_slm_summarize_consistency():
    req = {
        "gene": "EGFR",
        "drug": "Osimertinib",
        "dosage": "80mg",
        "adverse_event": "severe fatigue",
        "urgency": "High",
        "risk": "High"
    }
    res = summarize_structured_patient_state(req)
    assert "EGFR" in res["summary"]
    assert "Osimertinib" in res["summary"]
    assert res["evaluation"]["factual_consistency_score"] >= 0.8
    assert res["evaluation"]["hallucination_detected"] is False

# 6. GenAI Tests
def test_genai_scenario_generation():
    seed = {
        "scenario_type": "Severe",
        "tmb_threshold": 16.0,
        "ctdna_trend": "rising >20% per cycle",
        "renal_function": "impaired",
        "genomic_mutations": ["EGFR L858R", "MET amplification"]
    }
    res = generate_synthetic_scenario(seed)
    assert res["scenario_type"] == "Severe"
    assert res["is_synthetic"] is True
    assert res["realism_score"] >= 0.80

# 7. Agentic AI Tests
def test_agent_decision_support_and_approval_gate():
    patient = {
        "patient_id": "PT-TEST-001",
        "age": 64,
        "egfr_status": "Exon 19 del",
        "creatinine_mg_dl": 1.2,
        "ctdna_change_pct": 25.0
    }
    run_res = run_agentic_decision_support(patient, "Prioritize clinical trial")
    assert run_res["requires_human_approval"] is True
    assert run_res["status"] == "Awaiting Human Approval"
    assert len(run_res["traces"]) >= 4

    # Test Human Approval transition
    approval = ClinicianApprovalManager.apply_approval_decision(
        agent_run_id=run_res["run_id"],
        decision="Approved",
        clinician_notes="Approved for trial pre-screening."
    )
    assert approval["decision"] == "Approved"
    assert approval["status"] == "Completed"

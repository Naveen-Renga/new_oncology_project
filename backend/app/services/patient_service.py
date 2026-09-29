import uuid
from typing import Dict, Any, List, Optional
from backend.app.schemas.schemas import PatientState
from backend.safety.validators import validate_patient_input
from backend.safety.guardrails import enforce_safety_guardrails
from backend.ml.predict import predict_patient_risk
from backend.dl.predict import run_dl_analysis
from backend.nlp.service import analyze_clinical_text
from backend.slm.inference import summarize_structured_patient_state
from backend.genai.generator import generate_synthetic_scenario
from backend.agent.workflow import run_agentic_decision_support

# In-memory research patient repository for zero-friction local development and demo testing
DEMO_PATIENTS: Dict[str, Dict[str, Any]] = {
    "PT-NSCLC-0104": {
        "patient_id": "PT-NSCLC-0104",
        "demographics": {
            "age": 63,
            "sex": "Female",
            "smoking_history": "Former",
            "primary_diagnosis": "Advanced Non-Small Cell Lung Cancer (Adenocarcinoma)",
            "stage_category": "Stage IVB (Pleural & Bone Metastases)"
        },
        "clinical_features": {
            "creatinine_mg_dl": 1.45,
            "alt_u_l": 58.0,
            "ast_u_l": 44.0,
            "platelets_k_ul": 185.0,
            "anc_k_ul": 2.9,
            "tmb_mut_mb": 11.2,
            "ctdna_change_pct": 28.5
        },
        "genomic_features": {
            "egfr_status": "Exon 19 del (E746_A750del)",
            "alk_status": "Negative",
            "kras_status": "Negative",
            "pdl1_tps_pct": 35.0,
            "other_mutations": ["TP53 exon 5"]
        },
        "clinical_note": (
            "Patient with EGFR Exon 19 deletion is receiving Osimertinib 80mg. "
            "Patient developed severe fatigue, shortness of breath, and mild diarrhea. "
            "ctDNA rising +28.5% over the past two treatment cycles. Urgent review recommended."
        )
    },
    "PT-NSCLC-0208": {
        "patient_id": "PT-NSCLC-0208",
        "demographics": {
            "age": 68,
            "sex": "Male",
            "smoking_history": "Current",
            "primary_diagnosis": "Recurrent Non-Small Cell Lung Cancer",
            "stage_category": "Stage IVA"
        },
        "clinical_features": {
            "creatinine_mg_dl": 1.1,
            "alt_u_l": 42.0,
            "ast_u_l": 38.0,
            "platelets_k_ul": 240.0,
            "anc_k_ul": 4.1,
            "tmb_mut_mb": 18.6,
            "ctdna_change_pct": 12.0
        },
        "genomic_features": {
            "egfr_status": "Wildtype",
            "alk_status": "Negative",
            "kras_status": "G12C",
            "pdl1_tps_pct": 60.0,
            "other_mutations": ["STK11 loss"]
        },
        "clinical_note": (
            "Patient with confirmed KRAS G12C mutation is receiving Sotorasib 960mg daily following progression. "
            "Presents with mild fatigue, denies chest pain, stable performance status."
        )
    }
}

class PatientStateService:
    """
    Coordinates and persists Unified Patient State across all 6 stages.
    """

    @classmethod
    def get_patient_data(cls, patient_id: str) -> Optional[Dict[str, Any]]:
        return DEMO_PATIENTS.get(patient_id)

    @classmethod
    def list_patients(cls) -> List[Dict[str, Any]]:
        return list(DEMO_PATIENTS.values())

    @classmethod
    def save_patient(cls, data: Dict[str, Any]) -> Dict[str, Any]:
        patient_id = data.get("patient_id") or f"PT-NSCLC-{uuid.uuid4().hex[:4].upper()}"
        data["patient_id"] = patient_id
        DEMO_PATIENTS[patient_id] = data
        return data

    @classmethod
    def build_unified_patient_state(cls, patient_id: str) -> PatientState:
        """
        Runs or compiles all 6 AI stages into a standardized Unified Patient State object.
        """
        patient = DEMO_PATIENTS.get(patient_id)
        if not patient:
            patient = DEMO_PATIENTS["PT-NSCLC-0104"]

        demo = patient.get("demographics", {})
        clin = patient.get("clinical_features", {})
        gen = patient.get("genomic_features", {})
        note = patient.get("clinical_note", "")

        is_kras = gen.get("kras_status") and gen.get("kras_status") != "Negative"
        is_egfr = gen.get("egfr_status") and gen.get("egfr_status") != "Negative" and gen.get("egfr_status") != "Wildtype"
        active_driver = (
            f"KRAS {gen.get('kras_status')}"
            if is_kras
            else gen.get("egfr_status")
            if is_egfr
            else "NSCLC Wildtype"
        )

        # Flatten features for Stage 1 ML
        ml_input = {
            "patient_id": patient_id,
            "age": demo.get("age", 65),
            "smoking_history": demo.get("smoking_history", "Former"),
            "creatinine_mg_dl": clin.get("creatinine_mg_dl", 1.0),
            "alt_u_l": clin.get("alt_u_l", 28.0),
            "ast_u_l": clin.get("ast_u_l", 24.0),
            "platelets_k_ul": clin.get("platelets_k_ul", 200.0),
            "anc_k_ul": clin.get("anc_k_ul", 3.5),
            "tmb_mut_mb": clin.get("tmb_mut_mb", 8.0),
            "ctdna_change_pct": clin.get("ctdna_change_pct", 10.0),
            "pdl1_tps_pct": gen.get("pdl1_tps_pct", 30.0),
            "egfr_status": gen.get("egfr_status", "Wildtype" if is_kras else "Exon 19 del"),
            "alk_status": gen.get("alk_status", "Negative"),
            "kras_status": gen.get("kras_status", "G12C" if is_kras else "Negative")
        }

        # Stage 1: ML Risk
        ml_res = predict_patient_risk(ml_input)

        # Stage 2: DL Multimodal Analysis
        dl_res = run_dl_analysis({
            "patient_id": patient_id,
            "image_type": "histopathology",
            "time_series_ctdna": [1.0, 1.3, 1.8, 2.6, 3.8] if clin.get("ctdna_change_pct", 0) > 20 else [1.0, 1.1, 1.2, 1.1, 1.2]
        })

        # Stage 3: NLP Note Analysis
        nlp_res = analyze_clinical_text(note, patient_id=patient_id)

        # Stage 4: SLM Summarization
        slm_res = summarize_structured_patient_state({
            "patient_id": patient_id,
            "gene": nlp_res["gene_mutation"][0] if nlp_res["gene_mutation"] else active_driver,
            "drug": nlp_res["drug_name"][0] if nlp_res["drug_name"] else ("Sotorasib" if is_kras else "Osimertinib"),
            "dosage": nlp_res["dosage"][0] if nlp_res["dosage"] else ("960mg" if is_kras else "80mg"),
            "adverse_event": ", ".join(nlp_res["adverse_event"]) if nlp_res["adverse_event"] else "mild symptoms",
            "urgency": nlp_res["urgency"],
            "risk": ml_res["risk_level"],
            "dl_finding": dl_res["temporal_result"]
        })

        # Stage 5: GenAI Stress-Test Scenario
        genai_scenario = generate_synthetic_scenario({
            "scenario_type": "Severe" if ml_res["risk_level"] == "High" else "Moderate",
            "tmb_threshold": clin.get("tmb_mut_mb", 10.0),
            "ctdna_trend": f"rising +{clin.get('ctdna_change_pct', 15.0)}% per cycle",
            "renal_function": "impaired" if clin.get("creatinine_mg_dl", 1.0) > 1.3 else "normal",
            "genomic_mutations": [active_driver],
            "therapy_info": f"Targeted monotherapy surveillance for {active_driver}"
        })

        # Stage 6: Agent Decision Support
        agent_res = run_agentic_decision_support(
            patient_data=ml_input,
            clinical_objective="Prioritize therapeutic sequencing and trial eligibility",
            patient_b_data=DEMO_PATIENTS.get("PT-NSCLC-0208") if patient_id != "PT-NSCLC-0208" else None
        )

        all_warnings = (
            ml_res.get("warnings", []) +
            dl_res.get("warnings", []) +
            nlp_res.get("warnings", []) +
            slm_res.get("warnings", [])
        )

        return PatientState(
            patient_id=patient_id,
            demographics=demo,
            clinical_features=clin,
            genomic_features=gen,
            ml_risk=ml_res,
            dl_findings=dl_res,
            nlp_entities=nlp_res,
            urgency={"level": nlp_res["urgency"], "confidence": nlp_res["confidence"]},
            slm_summary=slm_res["summary"],
            genai_scenarios=[genai_scenario],
            agent_decision_support=agent_res,
            confidence={
                "ml": ml_res["confidence_score"],
                "dl": dl_res["confidence"],
                "nlp": nlp_res["confidence"],
                "slm_factual_consistency": slm_res["evaluation"]["factual_consistency_score"]
            },
            warnings=list(set(all_warnings)),
            requires_human_review=True
        )

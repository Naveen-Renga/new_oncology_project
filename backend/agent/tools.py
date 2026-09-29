import time
from typing import Dict, Any, List
from backend.knowledge.knowledge_base import knowledge_base
from backend.ml.predict import predict_patient_risk
from backend.nlp.service import analyze_clinical_text
from backend.genai.generator import generate_synthetic_scenario

# Simulated active clinical trials database
SIMULATED_TRIALS_DB = [
    {
        "trial_id": "NCT-0941829-FLAURA2-EXP",
        "title": "SIMULATED TRIAL — DEMONSTRATION ONLY: Phase III Trial: Osimertinib + Platinum Doublet for High-ctDNA EGFR Mutant NSCLC",
        "biomarker_target": "EGFR (Exon 19 del / L858R)",
        "phase": "Phase III",
        "available_slots": 1,
        "organ_requirements": {"creatinine_max": 1.6, "alt_max": 100.0, "anc_min": 1.5},
        "urgency_fit": "High",
        "sponsor": "Simulated Oncology Research Consortium (DEMO / NOT CLINICAL GUIDANCE)"
    },
    {
        "trial_id": "NCT-0883192-KRYSTAL-SHP2",
        "title": "SIMULATED TRIAL — DEMONSTRATION ONLY: Phase II Trial: KRAS G12C + SHP2 Inhibitor Combination for Recurrent Disease",
        "biomarker_target": "KRAS G12C",
        "phase": "Phase II",
        "available_slots": 1,
        "organ_requirements": {"creatinine_max": 2.0, "alt_max": 80.0, "anc_min": 1.2},
        "urgency_fit": "Moderate",
        "sponsor": "Simulated Precision Oncology Network (DEMO / NOT CLINICAL GUIDANCE)"
    },
    {
        "trial_id": "NCT-0774211-TROP2-ADC",
        "title": "SIMULATED TRIAL — DEMONSTRATION ONLY: Phase I/II Trial: Next-Gen TROP2 Antibody-Drug Conjugate for Heavily Pretreated NSCLC",
        "biomarker_target": "Biomarker Agnostic / TROP2+",
        "phase": "Phase I/II",
        "available_slots": 2,
        "organ_requirements": {"creatinine_max": 1.5, "alt_max": 60.0, "anc_min": 2.0},
        "urgency_fit": "High",
        "sponsor": "Simulated Translational Therapeutics (DEMO / NOT CLINICAL GUIDANCE)"
    }
]

# Simulated institutional pharmacy formulary
SIMULATED_PHARMACY_FORMULARY = {
    "Osimertinib": {
        "tier": "Tier 4 Specialty",
        "copay_estimate": "$45.00/mo (with foundation assistance)",
        "in_stock": True,
        "renal_adjustments": "No dose adjustment required for mild/moderate impairment. Monitor if CrCl < 30 mL/min.",
        "hepatic_adjustments": "Monitor transaminases. Hold for Grade >= 3 toxicity until resolved to Grade 1."
    },
    "Sotorasib": {
        "tier": "Tier 4 Specialty",
        "copay_estimate": "$60.00/mo",
        "in_stock": True,
        "renal_adjustments": "No specific dose modification specified for creatinine < 2.0.",
        "hepatic_adjustments": "Routine ALT/AST check every 2 weeks for first month. Dose reduce to 240mg upon transaminitis."
    },
    "Pemetrexed": {
        "tier": "Tier 2 Preferred Infusion",
        "copay_estimate": "$20.00/infusion",
        "in_stock": True,
        "renal_adjustments": "Contraindicated if CrCl < 45 mL/min. Folic acid and B12 supplementation required.",
        "hepatic_adjustments": "Administer with caution if bilirubin > 1.5x ULN."
    }
}

class AgentTools:
    """
    Standardized tool suite for clinical decision support.
    """

    @staticmethod
    def trial_registry_tool(biomarker_query: str, patient_labs: Dict[str, Any] = None) -> Dict[str, Any]:
        """Queries simulated clinical trials and evaluates slot availability and organ eligibility."""
        matching = []
        labs = patient_labs or {}
        p_creat = float(labs.get("creatinine_mg_dl", 1.0))
        p_alt = float(labs.get("alt_u_l", 25.0))

        for trial in SIMULATED_TRIALS_DB:
            # Check genomic keyword match
            bio_match = (
                biomarker_query.lower() in trial["biomarker_target"].lower() or
                "agnostic" in trial["biomarker_target"].lower()
            )
            if bio_match:
                reqs = trial["organ_requirements"]
                eligible = (p_creat <= reqs["creatinine_max"]) and (p_alt <= reqs["alt_max"])
                matching.append({
                    **trial,
                    "patient_eligible": eligible,
                    "eligibility_notes": f"Creatinine {p_creat} <= {reqs['creatinine_max']}, ALT {p_alt} <= {reqs['alt_max']}"
                })

        return {
            "status": "success",
            "matches_found": len(matching),
            "trials": matching,
            "query": biomarker_query,
            "disclaimer": "DEMO / NOT CLINICAL GUIDANCE: Simulated trial registry data."
        }

    @staticmethod
    def pharmacy_formulary_tool(drug_name: str, renal_creatinine: float = 1.0) -> Dict[str, Any]:
        """Queries institutional pharmacy formulary, stock status, and dosing adjustment criteria."""
        found = None
        for name, data in SIMULATED_PHARMACY_FORMULARY.items():
            if name.lower() in drug_name.lower():
                found = {"drug": name, **data}
                break

        if not found:
            found = {
                "drug": drug_name,
                "tier": "Non-formulary Specialty Review",
                "copay_estimate": "Prior authorization required",
                "in_stock": False,
                "renal_adjustments": "Consult oncology clinical pharmacist for renal clearance calculation.",
                "hepatic_adjustments": "Standard toxicities monitoring."
            }

        return {
            "status": "success",
            "formulary_entry": found,
            "disclaimer": "DEMO / NOT CLINICAL GUIDANCE: Simulated institutional formulary."
        }

    @staticmethod
    def sop_guideline_tool(search_topic: str) -> Dict[str, Any]:
        """Retrieves simulated institutional oncology SOPs and guideline digests."""
        docs = knowledge_base.query(search_topic, limit=2)
        return {
            "status": "success",
            "retrieved_guidelines": docs,
            "disclaimer": "DEMO / NOT CLINICAL GUIDANCE: Simulated guideline summary."
        }

    @staticmethod
    def patient_risk_tool(patient_data: Dict[str, Any]) -> Dict[str, Any]:
        """Executes Stage 1 ML risk analysis tool."""
        res = predict_patient_risk(patient_data)
        return {
            "status": "success",
            "risk_level": res["risk_level"],
            "probabilities": res["probabilities"],
            "model_used": res["model"]
        }

    @staticmethod
    def nlp_entity_tool(clinical_note: str) -> Dict[str, Any]:
        """Executes Stage 3 clinical NLP tool."""
        res = analyze_clinical_text(clinical_note)
        return {
            "status": "success",
            "extracted_entities": {
                "genes": res["gene_mutation"],
                "drugs": res["drug_name"],
                "adverse_events": res["adverse_event"],
                "urgency": res["urgency"]
            }
        }

    @staticmethod
    def scenario_generator_tool(seed_params: Dict[str, Any]) -> Dict[str, Any]:
        """Executes Stage 5 GenAI stress-test scenario generator tool."""
        res = generate_synthetic_scenario(seed_params)
        return {
            "status": "success",
            "scenario": res
        }

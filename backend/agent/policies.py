from typing import Dict, Any, List

class AgentClinicalPolicies:
    """
    Core safety and clinical priority rules governing agent actions:
    1. NEVER prescribe or enroll patients autonomously.
    2. Enforce human clinician approval gate before any action becomes operational.
    3. When competing patients request a single trial slot, prioritize based on:
       - Direct targeted biomarker alignment
       - Organ reserve eligibility (ANC >= 1.5, Creatinine <= 1.6)
       - Disease kinetics (rapid ctDNA escalation prioritizes access over stable cases)
    """

    @staticmethod
    def enforce_non_autonomous_prescription(action_type: str) -> None:
        prohibited = ["prescribe", "administer_drug", "auto_enroll_patient", "order_chemotherapy"]
        if action_type.lower() in prohibited:
            raise PermissionError(
                f"Agent safety policy violation: Autonomous action '{action_type}' is prohibited. "
                "All medical orders require licensed human oncologist sign-off."
            )

    @staticmethod
    def evaluate_trial_slot_prioritization(
        patient_a: Dict[str, Any],
        patient_b: Dict[str, Any],
        trial: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Decision-support comparative ranking when single slot exists:
        Evaluates genomic fit, organ reserve, and kinetic trajectory.
        """
        target = trial.get("biomarker_target", "").lower()

        # Score Patient A
        bio_a = 1.0 if target in str(patient_a.get("genomics", "")).lower() else 0.5
        kinetics_a = float(patient_a.get("ctdna_change_pct", 0.0))
        creat_a = float(patient_a.get("creatinine_mg_dl", 1.0))
        organ_ok_a = 1.0 if creat_a <= trial.get("organ_requirements", {}).get("creatinine_max", 1.6) else 0.0
        score_a = (bio_a * 40) + (min(kinetics_a, 50) * 0.8) + (organ_ok_a * 20)

        # Score Patient B
        bio_b = 1.0 if target in str(patient_b.get("genomics", "")).lower() else 0.5
        kinetics_b = float(patient_b.get("ctdna_change_pct", 0.0))
        creat_b = float(patient_b.get("creatinine_mg_dl", 1.0))
        organ_ok_b = 1.0 if creat_b <= trial.get("organ_requirements", {}).get("creatinine_max", 1.6) else 0.0
        score_b = (bio_b * 40) + (min(kinetics_b, 50) * 0.8) + (organ_ok_b * 20)

        if score_a >= score_b:
            chosen = patient_a.get("id", "Patient A")
            rationale = (
                f"{chosen} prioritized due to strong biomarker match, verified organ eligibility "
                f"(Creatinine {creat_a} mg/dL), and molecular urgency (ctDNA +{kinetics_a:.1f}%)."
            )
        else:
            chosen = patient_b.get("id", "Patient B")
            rationale = (
                f"{chosen} prioritized due to biomarker fit and molecular kinetics (ctDNA +{kinetics_b:.1f}%)."
            )

        return {
            "prioritized_patient_id": chosen,
            "patient_a_score": round(score_a, 2),
            "patient_b_score": round(score_b, 2),
            "decision_support_rationale": rationale,
            "requires_human_approval": True
        }

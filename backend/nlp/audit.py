from typing import Dict, Any, List
from datetime import datetime

class NLPMisinterpretationAuditor:
    """
    Tracks ambiguous entity boundaries, potential clinical contradictions,
    and misinterpretation risks for ongoing NLP quality assurance.
    """
    _audit_records: List[Dict[str, Any]] = []

    @classmethod
    def audit_extraction(
        cls,
        raw_text: str,
        entities: Dict[str, Any],
        urgency_result: Dict[str, Any],
        patient_id: str = "UNKNOWN"
    ) -> List[str]:
        warnings: List[str] = []

        # Check for empty entities
        if not entities["gene_mutation"] and not entities["drug_name"]:
            warnings.append("No standard oncogene or antineoplastic therapy detected in note.")

        # Check for contradictory negation
        for neg in entities.get("negated_entities", []):
            for drug in entities["drug_name"]:
                if drug.lower() in neg.lower():
                    warnings.append(f"Potential ambiguity: '{drug}' was also identified in negation context: {neg}")

        # Check if dosage extracted without associated drug
        if entities["dosage"] and not entities["drug_name"]:
            warnings.append("Dosage metric parsed without clear corresponding antineoplastic medication.")

        record = {
            "timestamp": datetime.utcnow().isoformat() + "Z",
            "patient_id": patient_id,
            "raw_text_length": len(raw_text),
            "entities_found": {k: len(v) if isinstance(v, list) else v for k, v in entities.items()},
            "urgency": urgency_result["urgency"],
            "warnings": warnings,
            "flagged_for_human_review": len(warnings) > 0
        }
        cls._audit_records.append(record)
        return warnings

    @classmethod
    def get_misinterpretation_logs(cls, limit: int = 50) -> List[Dict[str, Any]]:
        return list(reversed(cls._audit_records[-limit:]))

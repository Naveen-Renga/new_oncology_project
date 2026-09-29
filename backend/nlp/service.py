from typing import Dict, Any
from backend.nlp.preprocessing import clean_and_tokenize
from backend.nlp.ner import RuleBasedClinicalNER
from backend.nlp.classifier import UrgencyClassifier
from backend.nlp.audit import NLPMisinterpretationAuditor
from backend.safety.audit import SafetyAuditLogger

def analyze_clinical_text(clinical_note: str, patient_id: str = "PT-UNKNOWN") -> Dict[str, Any]:
    """
    Full Stage 3 NLP Pipeline:
    Text Cleaning -> De-identification -> Rule-Based Medical NER -> Negation Filtering -> Urgency Classification -> Audit & Error Analysis.
    """
    if not clinical_note or not clinical_note.strip():
        return {
            "gene_mutation": [],
            "drug_name": [],
            "dosage": [],
            "adverse_event": [],
            "negated_entities": [],
            "urgency": "Low",
            "deidentified_note": "",
            "confidence": 0.5,
            "warnings": ["Clinical note was empty or whitespace only."]
        }

    # Step 1: Clean & De-identify
    cleaned_note, tokens = clean_and_tokenize(clinical_note)

    # Step 2: Entity extraction with Negation handling
    ner_result = RuleBasedClinicalNER.extract_entities(cleaned_note)

    # Step 3: Urgency classification
    urgency_info = UrgencyClassifier.classify(cleaned_note, ner_result["adverse_event"])

    # Step 4: Audit & Error checking
    warnings = NLPMisinterpretationAuditor.audit_extraction(
        raw_text=cleaned_note,
        entities=ner_result,
        urgency_result=urgency_info,
        patient_id=patient_id
    )

    confidence = round(urgency_info["confidence"], 3)

    # Record safety audit
    SafetyAuditLogger.record(
        stage="NLP",
        input_reference=patient_id,
        output_summary=f"Urgency: {urgency_info['urgency']} | Genes: {ner_result['gene_mutation']} | Drugs: {ner_result['drug_name']}",
        model_name="ClinicalRuleNER + UrgencyRuleClassifier",
        confidence=confidence,
        warnings=warnings
    )

    return {
        "gene_mutation": ner_result["gene_mutation"],
        "drug_name": ner_result["drug_name"],
        "dosage": ner_result["dosage"],
        "adverse_event": ner_result["adverse_event"],
        "negated_entities": ner_result["negated_entities"],
        "urgency": urgency_info["urgency"],
        "deidentified_note": cleaned_note,
        "confidence": confidence,
        "warnings": warnings,
        "engine": ner_result["engine"]
    }

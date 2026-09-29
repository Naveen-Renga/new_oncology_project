import re
from typing import Dict, Any, List

HIGH_URGENCY_TRIGGERS = [
    r"\burgent\b",
    r"\bimmediate\b",
    r"\bemergency\b",
    r"\bstat\b",
    r"\bpneumonitis\b",
    r"\bhemoptysis\b",
    r"\bsevere\s+dyspnea\b",
    r"\bsevere\s+shortness\s+of\s+breath\b",
    r"\bgrade\s*[34]\b",
    r"\bhospitaliz\b",
    r"\btoxic\b"
]

MODERATE_URGENCY_TRIGGERS = [
    r"\bmoderate\b",
    r"\bfatigue\b",
    r"\brash\b",
    r"\bdiarrhea\b",
    r"\bnausea\b",
    r"\bmonitor\b",
    r"\bdose\s+reduction\b",
    r"\bgrade\s*2\b"
]

class UrgencyClassifier:
    """
    Oncology Clinical Urgency Classifier (Low, Moderate, High).
    """

    @classmethod
    def classify(cls, text: str, adverse_events: List[str] = None) -> Dict[str, Any]:
        lower_text = text.lower()
        aes = [ae.lower() for ae in (adverse_events or [])]

        # Check High Urgency
        for trigger in HIGH_URGENCY_TRIGGERS:
            if re.search(trigger, lower_text):
                return {
                    "urgency": "High",
                    "trigger_matched": trigger,
                    "confidence": 0.94,
                    "rationale": "High-urgency symptom, acute toxic complication, or urgent review keyword identified."
                }

        # Check if any severe adverse event was extracted
        for ae in aes:
            if any(severe_word in ae for severe_word in ["severe", "pneumonitis", "hemoptysis", "qtc"]):
                return {
                    "urgency": "High",
                    "trigger_matched": ae,
                    "confidence": 0.92,
                    "rationale": f"High-grade adverse event '{ae}' requires priority clinician evaluation."
                }

        # Check Moderate Urgency
        for trigger in MODERATE_URGENCY_TRIGGERS:
            if re.search(trigger, lower_text):
                return {
                    "urgency": "Moderate",
                    "trigger_matched": trigger,
                    "confidence": 0.88,
                    "rationale": "Grade 1-2 symptom or routine monitoring indicated."
                }

        if aes:
            return {
                "urgency": "Moderate",
                "trigger_matched": aes[0],
                "confidence": 0.82,
                "rationale": "Adverse events present without acute emergency flags."
            }

        return {
            "urgency": "Low",
            "trigger_matched": "None",
            "confidence": 0.90,
            "rationale": "Routine follow-up or stable clinical status documented."
        }

import re
from typing import Dict, Any, List

DISCLAIMER_TEXT = (
    "RESEARCH SIMULATION & CLINICAL DECISION SUPPORT DEMONSTRATION ONLY. "
    "This tool does NOT diagnose cancer, prescribe medication, or replace a licensed oncologist. "
    "All recommendations require independent multidisciplinary tumor board review and physician approval."
)

PROHIBITED_DIRECTIVES = [
    r"\bi diagnose\b",
    r"\bi prescribe\b",
    r"\bpatient must immediately take\b",
    r"\bclinically proven to cure\b",
    r"\bfda approved diagnosis\b"
]

def sanitize_and_deidentify_text(text: str) -> str:
    """
    Strips direct patient identifiers (Names, SSNs, phone numbers, mrns)
    from unstructured clinical text for HIPAA compliance simulation.
    """
    if not text:
        return ""

    # Replace potential names like "Mr. Smith", "Patient Jane Doe", "Dr. Johnson"
    cleaned = re.sub(r"\b(Patient|Mr\.|Mrs\.|Ms\.|Dr\.)\s+[A-Z][a-z]+(?:\s+[A-Z][a-z]+)?\b", "[REDACTED_NAME]", text)
    # Replace Medical Record Numbers like MRN: 12345678 or #84920492
    cleaned = re.sub(r"\b(?:MRN|mrn|ID|Record\s*#?)[:\s]*\d{5,10}\b", "MRN: [REDACTED_MRN]", cleaned)
    # Replace phone numbers
    cleaned = re.sub(r"\b(?:\+?1[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b", "[REDACTED_PHONE]", cleaned)
    # Replace SSN patterns
    cleaned = re.sub(r"\b\d{3}-\d{2}-\d{4}\b", "[REDACTED_SSN]", cleaned)
    # Replace dates like 04/12/1982 or 2024-05-19
    cleaned = re.sub(r"\b\d{1,2}[/-]\d{1,2}[/-]\d{2,4}\b", "[REDACTED_DATE]", cleaned)
    cleaned = re.sub(r"\b\d{4}-\d{2}-\d{2}\b", "[REDACTED_DATE]", cleaned)
    return cleaned

def enforce_safety_guardrails(content: str) -> Dict[str, Any]:
    """
    Checks generated content against prescriptive or diagnostic claims.
    Ensures research framing and compliance.
    """
    violations: List[str] = []
    lower_content = content.lower()

    for pattern in PROHIBITED_DIRECTIVES:
        if re.search(pattern, lower_content):
            violations.append(f"Prohibited prescriptive/diagnostic phrasing detected: match for '{pattern}'")

    has_disclaimer = "decision support" in lower_content or "research simulation" in lower_content

    return {
        "passed": len(violations) == 0,
        "violations": violations,
        "mandatory_disclaimer": DISCLAIMER_TEXT,
        "has_disclaimer": has_disclaimer
    }

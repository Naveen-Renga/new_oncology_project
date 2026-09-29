import re
from typing import List, Dict, Any, Tuple
from backend.safety.guardrails import sanitize_and_deidentify_text

def clean_and_tokenize(text: str) -> Tuple[str, List[str]]:
    """
    Cleans unstructured clinical note, applies de-identification for HIPAA safety,
    and returns tokenized words.
    """
    if not text:
        return "", []

    deidentified = sanitize_and_deidentify_text(text)

    # Standardize whitespace and normalize common clinical punctuation
    cleaned = re.sub(r"\s+", " ", deidentified).strip()

    # Medical tokenization preserving dosages like '80mg', '100mg/m2'
    tokens = re.findall(r"\b[\w.-]+(?:mg|mcg|ml|g)?\b", cleaned, flags=re.IGNORECASE)

    return cleaned, tokens

from typing import Dict, Any

SLM_SYSTEM_PROMPT = """<|im_start|>system
You are a specialized clinical oncology summarizer.
Given structured patient entities, generate exactly one concise, factual clinical summary sentence.
Strict Rules:
1. Do not invent any genes, drugs, dosages, or adverse events not provided.
2. Maintain clinical precision and urgency tone.
3. No editorial speculation or ungrounded claims.<|im_end|>"""

def format_slm_input(
    gene: str = None,
    drug: str = None,
    dosage: str = None,
    adverse_event: str = None,
    urgency: str = "Moderate",
    risk: str = "Moderate",
    dl_finding: str = None
) -> str:
    parts = []
    if gene:
        parts.append(f"Gene = {gene}")
    if drug:
        parts.append(f"Drug = {drug}")
    if dosage:
        parts.append(f"Dosage = {dosage}")
    if adverse_event:
        parts.append(f"Adverse Event = {adverse_event}")
    if urgency:
        parts.append(f"Urgency = {urgency}")
    if risk:
        parts.append(f"Risk = {risk}")
    if dl_finding:
        parts.append(f"Imaging/Dynamics = {dl_finding}")

    raw_input = " | ".join(parts) if parts else "No specific oncology entities identified."
    formatted = f"{SLM_SYSTEM_PROMPT}\n<|im_start|>user\n{raw_input}<|im_end|>\n<|im_start|>assistant\n"
    return formatted

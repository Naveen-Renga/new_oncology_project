import json
from typing import Dict, Any
from backend.genai.schema import SeedConditions

GENAI_SYSTEM_INSTRUCTION = """You are a specialized clinical oncology research simulation engine.
Your objective is to generate plausible SYNTHETIC oncology stress-test patient scenarios for educational and system benchmarking.

CRITICAL SAFETY & ETHICAL CONSTRAINTS:
1. This is a SYNTHETIC SIMULATION scenario. Do NOT claim this is a real patient.
2. Do NOT diagnose cancer or prescribe medication.
3. Respect all provided seed conditions strictly (TMB, ctDNA trend, renal function, organ involvement, mutations).
4. Maintain biological plausibility for Non-Small Cell Lung Cancer (NSCLC).
5. Output ONLY valid, parseable JSON conforming strictly to the requested schema. No markdown wrappers or preamble."""

def build_scenario_generation_prompt(seeds: SeedConditions) -> str:
    prompt = f"""Generate a synthetic {seeds.scenario_type} oncology stress-test scenario adhering to these seed conditions:
- Target Severity: {seeds.scenario_type}
- TMB: {seeds.tmb_threshold} mut/Mb
- ctDNA Dynamics: {seeds.ctdna_trend}
- Renal Function: {seeds.renal_function}
- Organ Involvement: {seeds.organ_involvement}
- Genomic Drivers: {', '.join(seeds.genomic_mutations)}
- Treatment History: {seeds.therapy_info}

Return JSON with exact keys:
{{
  "scenario_type": "{seeds.scenario_type}",
  "genomic_profile": {{
    "primary_driver": "string",
    "secondary_alterations": ["string"],
    "tmb_mut_mb": {seeds.tmb_threshold},
    "pdl1_tps_pct": float
  }},
  "clinical_profile": {{
    "age": int,
    "renal_status": "{seeds.renal_function}",
    "creatinine_mg_dl": float,
    "metastatic_sites": ["string"],
    "ecog_performance": int
  }},
  "progression_pattern": "string describing ctDNA and radiographic dynamics",
  "toxicity_pattern": "string describing organ lab changes and adverse symptoms",
  "rationale": "string explaining why this scenario provides a clinical stress-test",
  "realism_score": float between 0.80 and 0.98,
  "warnings": ["DEMO RESEARCH SCENARIO: Synthetic data generated for decision-support stress-testing."]
}}"""
    return prompt

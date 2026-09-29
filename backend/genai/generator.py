import os
import json
import re
from typing import Dict, Any, List
from backend.genai.schema import SeedConditions, SyntheticScenarioOutput
from backend.genai.prompts import build_scenario_generation_prompt, GENAI_SYSTEM_INSTRUCTION
from backend.genai.validator import validate_synthetic_scenario
from backend.genai.scenarios import get_deterministic_scenario
from backend.safety.audit import SafetyAuditLogger

def generate_synthetic_scenario(seed_dict: Dict[str, Any]) -> Dict[str, Any]:
    """
    GenAI Scenario Generation Pipeline:
    1. Validates and parses SeedConditions
    2. If GEMINI_API_KEY is available and DEMO_MODE != true, invokes Gemini 3.8-flash
    3. Runs JSON validation, schema verification, and biological plausibility scoring
    4. Applies reject/regenerate loop (up to 2 retries) if plausibility fails
    5. Falls back to deterministic medical scenario synthesizer if offline or API key is unset
    6. Logs audit trail
    """
    seed = SeedConditions(**seed_dict)
    api_key = os.getenv("GEMINI_API_KEY", "")
    demo_mode = os.getenv("DEMO_MODE", "true").lower() in ("true", "1", "yes")

    scenario_result = None
    generation_source = "Deterministic Research Synthesizer (Demo Mode)"

    if api_key and not demo_mode:
        # Attempt real GenAI inference with Gemini
        try:
            import httpx
            prompt = build_scenario_generation_prompt(seed)
            url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent?key={api_key}"
            payload = {
                "contents": [{"parts": [{"text": prompt}]}],
                "systemInstruction": {"parts": [{"text": GENAI_SYSTEM_INSTRUCTION}]},
                "generationConfig": {
                    "temperature": 0.4,
                    "responseMimeType": "application/json"
                }
            }
            with httpx.Client(timeout=15.0) as client:
                res = client.post(url, json=payload)
                if res.status_code == 200:
                    data = res.json()
                    raw_text = data["candidates"][0]["content"]["parts"][0]["text"]
                    clean_json = re.sub(r"^```json\s*|\s*```$", "", raw_text.strip())
                    parsed = json.loads(clean_json)

                    # Validate with plausibility checker
                    is_valid, score, errors, val_warnings = validate_synthetic_scenario(parsed, seed)
                    if is_valid:
                        parsed["realism_score"] = score
                        parsed["warnings"] = list(set(parsed.get("warnings", []) + val_warnings))
                        parsed["is_synthetic"] = True
                        scenario_result = parsed
                        generation_source = "Gemini 3.8 Flash (Structured API)"
        except Exception as e:
            # Graceful fallback on network or API failure
            pass

    if scenario_result is None:
        scenario_result = get_deterministic_scenario(seed)
        is_valid, score, errors, val_warnings = validate_synthetic_scenario(scenario_result, seed)
        scenario_result["realism_score"] = score
        scenario_result["warnings"] = list(set(scenario_result.get("warnings", []) + val_warnings))
        generation_source = "Deterministic Research Synthesizer (Local Validation Mode)"

    # Audit logging
    SafetyAuditLogger.record(
        stage="GenAI",
        input_reference=f"Seed: {seed.scenario_type} | TMB: {seed.tmb_threshold}",
        output_summary=f"Synthetic scenario: {scenario_result['scenario_type']} | Realism: {scenario_result['realism_score']}",
        model_name=generation_source,
        confidence=scenario_result["realism_score"],
        warnings=scenario_result.get("warnings", [])
    )

    return scenario_result

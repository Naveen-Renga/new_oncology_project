from typing import Dict, Any, Tuple, List
from backend.genai.schema import SeedConditions

def validate_synthetic_scenario(
    scenario_dict: Dict[str, Any],
    seed: SeedConditions
) -> Tuple[bool, float, List[str], List[str]]:
    """
    Validates synthetic scenario against seed constraints and biological plausibility:
    - Verifies JSON structure has all required keys
    - Verifies renal function aligns with seed (if impaired, creatinine should be elevated)
    - Verifies genomic mutations match requested seed
    - Calculates a biological realism score [0.0 - 1.0]
    """
    errors: List[str] = []
    warnings: List[str] = []
    realism_score = float(scenario_dict.get("realism_score", 0.85))

    required_keys = [
        "scenario_type", "genomic_profile", "clinical_profile",
        "progression_pattern", "toxicity_pattern", "rationale"
    ]
    for key in required_keys:
        if key not in scenario_dict:
            errors.append(f"Missing required scenario key: '{key}'")

    if errors:
        return False, 0.0, errors, warnings

    genomic = scenario_dict.get("genomic_profile", {})
    clinical = scenario_dict.get("clinical_profile", {})

    # Seed-Condition Constraint Checks
    # 1. Renal alignment
    if "impaired" in seed.renal_function.lower():
        creat = clinical.get("creatinine_mg_dl", 1.0)
        if creat < 1.3:
            warnings.append(f"Renal impairment was specified in seed, but creatinine is {creat} mg/dL (expected >= 1.4 mg/dL).")
            realism_score -= 0.05

    # 2. Genomic alignment
    primary_driver = str(genomic.get("primary_driver", "")).lower()
    secondaries = [str(s).lower() for s in genomic.get("secondary_alterations", [])]
    all_genomics = [primary_driver] + secondaries

    for expected_mut in seed.genomic_mutations:
        mut_found = any(expected_mut.lower() in g for g in all_genomics)
        if not mut_found:
            warnings.append(f"Seed mutation '{expected_mut}' not explicitly captured in generated genomic profile.")
            realism_score -= 0.08

    # 3. Biological Plausibility Checks
    # In NSCLC, KRAS G12C and EGFR L858R co-primary oncogenic drivers in the same clone are exceptionally rare (<0.5%)
    has_egfr = any("egfr" in g for g in all_genomics)
    has_kras = any("kras" in g for g in all_genomics)
    if has_egfr and has_kras and seed.scenario_type != "Wildcard":
        warnings.append("Biological outlier: Concurrent EGFR and KRAS oncogenic drivers are rare in primary NSCLC.")
        realism_score -= 0.10

    # Ensure realism score stays bounded
    realism_score = round(max(0.2, min(0.98, realism_score)), 3)

    # Reject if score is too low or hard schema errors exist
    is_valid = len(errors) == 0 and realism_score >= 0.65

    return is_valid, realism_score, errors, warnings

from typing import Dict, Any, Tuple, List

# Configured clinical parameter ranges for NSCLC decision-support research prototype
CLINICAL_BOUNDS = {
    "age": {"min": 18, "max": 105, "rare_low": 25, "rare_high": 90},
    "creatinine_mg_dl": {"min": 0.2, "max": 10.0, "rare_high": 4.0},
    "alt_u_l": {"min": 5.0, "max": 500.0, "rare_high": 200.0},
    "ast_u_l": {"min": 5.0, "max": 500.0, "rare_high": 200.0},
    "platelets_k_ul": {"min": 20.0, "max": 1000.0, "rare_low": 50.0},
    "anc_k_ul": {"min": 0.5, "max": 30.0, "rare_low": 1.0},
    "tmb_mut_mb": {"min": 0.0, "max": 100.0, "rare_high": 50.0},
    "pdl1_tps_pct": {"min": 0.0, "max": 100.0},
}

# Artificial / unreliable columns from legacy project that must NOT be silently fabricated
PROHIBITED_FABRICATED_COLUMNS = [
    "TNM_T", "TNM_N", "TNM_M", "tumor_size_cm", "tumor_location",
    "histology_type", "ECOG_performance_status", "metastasis_site"
]

def validate_patient_input(data: Dict[str, Any]) -> Tuple[bool, List[str], List[str]]:
    """
    Validates patient data without blind outlier truncation.
    Distinguishes:
    - Invalid data (out of biologically possible limits -> hard error)
    - Rare but valid clinical values (warns clinical reviewer)
    - Prohibited fabricated columns (prevents legacy artificial columns)
    """
    errors: List[str] = []
    warnings: List[str] = []

    # Prohibited column check
    for col in PROHIBITED_FABRICATED_COLUMNS:
        if col in data and data[col] is not None:
            warnings.append(
                f"Column '{col}' is flagged as an unreliable/artificial project feature. "
                "Do NOT use as primary predictive feature."
            )

    # Range and type validation
    for field, bounds in CLINICAL_BOUNDS.items():
        if field in data and data[field] is not None:
            val = data[field]
            try:
                num_val = float(val)
            except (ValueError, TypeError):
                errors.append(f"Field '{field}' must be a numerical value, got '{val}'")
                continue

            if num_val < bounds["min"] or num_val > bounds["max"]:
                errors.append(
                    f"{field.capitalize().replace('_', ' ')} is outside configured demo range "
                    f"[{bounds['min']} - {bounds['max']}]. Got {num_val}."
                )
            elif "rare_high" in bounds and num_val > bounds["rare_high"]:
                warnings.append(
                    f"{field} = {num_val} is a rare high clinical value; physician attention recommended."
                )
            elif "rare_low" in bounds and num_val < bounds["rare_low"]:
                warnings.append(
                    f"{field} = {num_val} is a rare low clinical value; physician attention recommended."
                )

    is_valid = len(errors) == 0
    return is_valid, errors, warnings

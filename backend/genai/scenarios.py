from typing import Dict, Any
from backend.genai.schema import SeedConditions

DETERMINISTIC_SCENARIOS = {
    "Severe": {
        "scenario_type": "Severe",
        "genomic_profile": {
            "primary_driver": "EGFR L858R",
            "secondary_alterations": ["MET amplification (Copy Number 8.2)", "TP53 R273H"],
            "tmb_mut_mb": 16.4,
            "pdl1_tps_pct": 55.0
        },
        "clinical_profile": {
            "age": 67,
            "renal_status": "Impaired (Stage 3 CKD)",
            "creatinine_mg_dl": 1.9,
            "metastatic_sites": ["Bilateral Pleura", "Right Adrenal Gland", "L2 Vertebral Body"],
            "ecog_performance": 2
        },
        "progression_pattern": "ctDNA mutant fraction escalated +38% between Cycle 4 and Cycle 6, preceding RECIST progression by 6 weeks. New 1.8cm subpleural nodule on restaging CT.",
        "toxicity_pattern": "Sub-acute grade 2 transaminase elevation (ALT 92 U/L) combined with worsening creatinine limits full-dose cytotoxic or MET-inhibitor combinations.",
        "rationale": "High-complexity challenge testing agentic reasoning: concurrent acquired resistance (MET bypass), renal impairment contraindicating full-dose cisplatin, and rapid clonal kinetics.",
        "realism_score": 0.94,
        "warnings": [
            "DEMO RESEARCH SCENARIO: Synthetic data generated for clinical decision-support stress-testing.",
            "Not an actual patient record."
        ],
        "is_synthetic": True
    },
    "Moderate": {
        "scenario_type": "Moderate",
        "genomic_profile": {
            "primary_driver": "KRAS G12C",
            "secondary_alterations": ["STK11 co-mutation"],
            "tmb_mut_mb": 8.5,
            "pdl1_tps_pct": 10.0
        },
        "clinical_profile": {
            "age": 64,
            "renal_status": "Mild Impairment",
            "creatinine_mg_dl": 1.3,
            "metastatic_sites": ["Contralateral Lung Nodule"],
            "ecog_performance": 1
        },
        "progression_pattern": "Stable ctDNA over 2 cycles followed by modest +12% drift in mutant allele frequency; primary lesion enlarged 2mm.",
        "toxicity_pattern": "Grade 1 intermittent diarrhea manageable with supportive loperamide; hepatic parameters within baseline limits.",
        "rationale": "Evaluates targeted G12C oral therapy options versus second-line docetaxel, balancing STK11-associated lower response to immunotherapy.",
        "realism_score": 0.91,
        "warnings": [
            "DEMO RESEARCH SCENARIO: Synthetic data generated for clinical decision-support stress-testing.",
            "Not an actual patient record."
        ],
        "is_synthetic": True
    },
    "Mild": {
        "scenario_type": "Mild",
        "genomic_profile": {
            "primary_driver": "EGFR Exon 19 del",
            "secondary_alterations": [],
            "tmb_mut_mb": 4.2,
            "pdl1_tps_pct": 5.0
        },
        "clinical_profile": {
            "age": 59,
            "renal_status": "Normal",
            "creatinine_mg_dl": 0.9,
            "metastatic_sites": ["Single Left Lower Lobe Subsolid Nodule"],
            "ecog_performance": 0
        },
        "progression_pattern": "ctDNA remains undetectable or deeply suppressed (-45% from baseline) on first-line targeted therapy.",
        "toxicity_pattern": "Grade 1 dry skin and mild paronychia; normal hematologic and renal parameters.",
        "rationale": "Tests baseline surveillance decision-support without premature treatment switching or escalation.",
        "realism_score": 0.96,
        "warnings": [
            "DEMO RESEARCH SCENARIO: Synthetic data generated for clinical decision-support stress-testing.",
            "Not an actual patient record."
        ],
        "is_synthetic": True
    },
    "Wildcard": {
        "scenario_type": "Wildcard",
        "genomic_profile": {
            "primary_driver": "NTRK1 fusion (TPM3-NTRK1)",
            "secondary_alterations": ["High Microsatellite Instability (MSI-H)", "TMB 42.1 mut/Mb"],
            "tmb_mut_mb": 42.1,
            "pdl1_tps_pct": 90.0
        },
        "clinical_profile": {
            "age": 44,
            "renal_status": "Normal",
            "creatinine_mg_dl": 0.8,
            "metastatic_sites": ["Brain (Asymptomatic 8mm solitary lesion)", "Mediastinal lymph nodes"],
            "ecog_performance": 1
        },
        "progression_pattern": "Ultra-rapid molecular response alternating with oligometastatic CNS relapse under immune-checkpoint challenge.",
        "toxicity_pattern": "Mixed immune-related thyroiditis and elevated amylase requiring endocrine replacement.",
        "rationale": "Rare agnostically targetable biomarker setting with dual hypermutation and NTRK actionable pathway.",
        "realism_score": 0.88,
        "warnings": [
            "DEMO RESEARCH SCENARIO: Synthetic data generated for clinical decision-support stress-testing.",
            "Wildcard scenario contains rare concurrent genomic patterns for edge-case testing."
        ],
        "is_synthetic": True
    }
}

def get_deterministic_scenario(seed: SeedConditions) -> Dict[str, Any]:
    scenario_type = seed.scenario_type
    base = DETERMINISTIC_SCENARIOS.get(scenario_type, DETERMINISTIC_SCENARIOS["Severe"]).copy()

    # Dynamically inject seed specifics
    base["genomic_profile"]["tmb_mut_mb"] = seed.tmb_threshold
    if seed.genomic_mutations:
        base["genomic_profile"]["primary_driver"] = seed.genomic_mutations[0]
        if len(seed.genomic_mutations) > 1:
            base["genomic_profile"]["secondary_alterations"] = seed.genomic_mutations[1:]

    base["clinical_profile"]["renal_status"] = seed.renal_function
    if "impaired" in seed.renal_function.lower():
        base["clinical_profile"]["creatinine_mg_dl"] = 1.8
    else:
        base["clinical_profile"]["creatinine_mg_dl"] = 0.9

    base["scenario_type"] = scenario_type
    return base

from typing import Dict, Any, List, Optional
from pydantic import BaseModel, Field

class SeedConditions(BaseModel):
    scenario_type: str = Field("Severe", description="Mild, Moderate, Severe, Wildcard")
    tmb_threshold: float = Field(15.0, ge=0.0, le=100.0)
    ctdna_trend: str = "rising >20% per cycle"
    renal_function: str = "impaired"
    organ_involvement: str = "multiple organ involvement (pleural + adrenal)"
    genomic_mutations: List[str] = Field(default_factory=lambda: ["EGFR L858R", "MET amplification"])
    therapy_info: str = "First-line Osimertinib resistance acquired"

class SyntheticScenarioOutput(BaseModel):
    scenario_type: str
    genomic_profile: Dict[str, Any]
    clinical_profile: Dict[str, Any]
    progression_pattern: str
    toxicity_pattern: str
    rationale: str
    realism_score: float = Field(..., ge=0.0, le=1.0)
    warnings: List[str] = Field(default_factory=list)
    is_synthetic: bool = True

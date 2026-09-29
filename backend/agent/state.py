from typing import Dict, Any, List, Optional
from pydantic import BaseModel, Field

class ToolExecutionTrace(BaseModel):
    step: int
    tool: str
    input: Dict[str, Any]
    output: Dict[str, Any]
    thought_reasoning: str
    latency_ms: float

class AgentState(BaseModel):
    run_id: str
    patient_id: str
    goal: str
    current_step: int = 0
    traces: List[ToolExecutionTrace] = Field(default_factory=list)
    observations: List[str] = Field(default_factory=list)
    retrieved_knowledge: List[Dict[str, Any]] = Field(default_factory=list)
    matched_trials: List[Dict[str, Any]] = Field(default_factory=list)
    formulary_options: List[Dict[str, Any]] = Field(default_factory=list)
    decision_support_summary: str = ""
    recommended_trial: Optional[Dict[str, Any]] = None
    recommended_therapy: Optional[Dict[str, Any]] = None
    evidence_citations: List[Dict[str, str]] = Field(default_factory=list)
    requires_human_approval: bool = True
    approval_status: str = "Awaiting Human Approval" # Awaiting Human Approval, Approved, Rejected, Modified
    clinician_action: Optional[Dict[str, Any]] = None

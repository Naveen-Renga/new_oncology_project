from typing import Dict, Any, List, Callable
from backend.agent.workflow import run_agentic_decision_support

class AgentStateGraph:
    """
    LangGraph-inspired State Graph definition for the Oncology Decision-Support Agent:
    Nodes:
    1. GOAL_RECEPTION
    2. PATIENT_STATE_INSPECTION
    3. SOP_GUIDELINE_RETRIEVAL
    4. TRIAL_REGISTRY_QUERY
    5. PHARMACY_FORMULARY_CHECK
    6. MULTI_PATIENT_COMPARISON (Conditional)
    7. DECISION_SUPPORT_SYNTHESIS
    8. HUMAN_APPROVAL_GATE (Terminal State requiring affirmative clinician transition)
    """

    NODES = [
        "GOAL_RECEPTION",
        "PATIENT_STATE_INSPECTION",
        "SOP_GUIDELINE_RETRIEVAL",
        "TRIAL_REGISTRY_QUERY",
        "PHARMACY_FORMULARY_CHECK",
        "MULTI_PATIENT_COMPARISON",
        "DECISION_SUPPORT_SYNTHESIS",
        "HUMAN_APPROVAL_GATE"
    ]

    @classmethod
    def get_graph_schema(cls) -> Dict[str, Any]:
        return {
            "name": "OncologyPrecisionDecisionSupportGraph",
            "nodes": cls.NODES,
            "edges": [
                {"from": "GOAL_RECEPTION", "to": "PATIENT_STATE_INSPECTION"},
                {"from": "PATIENT_STATE_INSPECTION", "to": "SOP_GUIDELINE_RETRIEVAL"},
                {"from": "SOP_GUIDELINE_RETRIEVAL", "to": "TRIAL_REGISTRY_QUERY"},
                {"from": "TRIAL_REGISTRY_QUERY", "to": "PHARMACY_FORMULARY_CHECK"},
                {"from": "PHARMACY_FORMULARY_CHECK", "to": "MULTI_PATIENT_COMPARISON", "condition": "if_candidate_patient_b_present"},
                {"from": "PHARMACY_FORMULARY_CHECK", "to": "DECISION_SUPPORT_SYNTHESIS", "condition": "default"},
                {"from": "MULTI_PATIENT_COMPARISON", "to": "DECISION_SUPPORT_SYNTHESIS"},
                {"from": "DECISION_SUPPORT_SYNTHESIS", "to": "HUMAN_APPROVAL_GATE"}
            ],
            "checkpoint_save": "SQLite / In-Memory Audit Trail",
            "terminal_gate": "HUMAN_APPROVAL_GATE"
        }

    @classmethod
    def execute(cls, patient_data: Dict[str, Any], goal: str, patient_b: Dict[str, Any] = None) -> Dict[str, Any]:
        return run_agentic_decision_support(patient_data, goal, patient_b)

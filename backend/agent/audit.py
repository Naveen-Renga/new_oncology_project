from typing import Dict, Any, List
from datetime import datetime

class AgentRunAuditor:
    """
    Maintains ReAct execution traces and tool call provenance.
    """
    _agent_runs: Dict[str, Dict[str, Any]] = {}

    @classmethod
    def record_run(cls, run_state: Dict[str, Any]):
        run_id = run_state["run_id"]
        cls._agent_runs[run_id] = {
            **run_state,
            "recorded_at": datetime.utcnow().isoformat() + "Z"
        }

    @classmethod
    def update_approval(cls, run_id: str, approval_data: Dict[str, Any]):
        if run_id in cls._agent_runs:
            cls._agent_runs[run_id]["approval_status"] = approval_data["decision"]
            cls._agent_runs[run_id]["clinician_action"] = approval_data

    @classmethod
    def get_run(cls, run_id: str) -> Dict[str, Any]:
        return cls._agent_runs.get(run_id)

    @classmethod
    def list_runs(cls, limit: int = 50) -> List[Dict[str, Any]]:
        return list(reversed(list(cls._agent_runs.values())[-limit:]))

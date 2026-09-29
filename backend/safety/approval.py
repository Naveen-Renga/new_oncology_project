from datetime import datetime
from typing import Dict, Any, Optional

class ApprovalGate:
    """
    Human Approval Gate for high-stakes oncology clinical decision-support actions.
    No irreversible action (e.g. trial enrollment, drug modification) may proceed
    without affirmative human clinician approval.
    """

    @staticmethod
    def evaluate_gate(action_type: str, recommendation: Dict[str, Any]) -> Dict[str, Any]:
        return {
            "requires_human_approval": True,
            "action_type": action_type,
            "status": "Awaiting Human Approval",
            "timestamp": datetime.utcnow().isoformat(),
            "policy": "CLINICAL_DECISION_SUPPORT_POLICY_V1",
            "message": "Clinical review required prior to patient discussion or medical chart entry."
        }

    @staticmethod
    def process_decision(
        decision: str,
        clinician_notes: Optional[str] = None,
        approver_username: str = "Dr. OncoClinician"
    ) -> Dict[str, Any]:
        valid_decisions = ["Approved", "Rejected", "Modified"]
        if decision not in valid_decisions:
            raise ValueError(f"Invalid decision '{decision}'. Must be one of {valid_decisions}")

        return {
            "decision": decision,
            "status": "Completed",
            "approver": approver_username,
            "clinician_notes": clinician_notes or "Reviewed by attending thoracic oncologist.",
            "timestamp": datetime.utcnow().isoformat(),
            "execution_permitted": decision == "Approved"
        }

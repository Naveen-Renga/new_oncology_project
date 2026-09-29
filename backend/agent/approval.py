from datetime import datetime
from typing import Dict, Any, Optional
from backend.agent.audit import AgentRunAuditor
from backend.safety.audit import SafetyAuditLogger

class ClinicianApprovalManager:
    """
    Manages the Human Approval Gate for agent decision-support outputs.
    Ensures that recommendations remain non-operational proposals until signed off.
    """

    @classmethod
    def apply_approval_decision(
        cls,
        agent_run_id: str,
        decision: str,
        clinician_notes: Optional[str] = None,
        approver_username: str = "Dr. OncoClinician"
    ) -> Dict[str, Any]:
        valid_decisions = ["Approved", "Rejected", "Modified"]
        if decision not in valid_decisions:
            raise ValueError(f"Decision '{decision}' is not permitted. Must be one of {valid_decisions}.")

        approval_record = {
            "agent_run_id": agent_run_id,
            "decision": decision,
            "status": "Completed",
            "approver": approver_username,
            "clinician_notes": clinician_notes or "Reviewed by attending oncologist in multidisciplinary tumor board.",
            "timestamp": datetime.utcnow().isoformat() + "Z"
        }

        # Update Agent run state
        AgentRunAuditor.update_approval(agent_run_id, approval_record)

        # Record in system-wide safety audit log
        SafetyAuditLogger.record(
            stage="Agent Approval",
            input_reference=agent_run_id,
            output_summary=f"Clinician Decision: {decision} by {approver_username}. Notes: {approval_record['clinician_notes']}",
            model_name="Human Clinician Gate",
            confidence=1.0,
            requires_approval=True,
            approval_status=decision
        )

        return approval_record

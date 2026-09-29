from datetime import datetime
from typing import Dict, Any, List, Optional

class SafetyAuditLogger:
    """
    Centralized safety audit manager recording all automated inputs,
    model inferences, uncertainty metrics, and human clinician sign-offs.
    """
    _audit_store: List[Dict[str, Any]] = []

    @classmethod
    def record(
        cls,
        stage: str,
        input_reference: Optional[str],
        output_summary: str,
        model_name: Optional[str] = None,
        confidence: Optional[float] = None,
        validation_status: str = "PASS",
        warnings: Optional[List[str]] = None,
        requires_approval: bool = False,
        approval_status: Optional[str] = None,
        user_id: Optional[str] = "clinician-default"
    ) -> Dict[str, Any]:
        entry = {
            "id": len(cls._audit_store) + 1,
            "timestamp": datetime.utcnow().isoformat() + "Z",
            "stage": stage,
            "user_id": user_id,
            "input_reference": input_reference,
            "model_name": model_name,
            "confidence": confidence,
            "validation_status": validation_status,
            "warnings": warnings or [],
            "output_summary": output_summary,
            "requires_approval": requires_approval,
            "approval_status": approval_status or ("Pending" if requires_approval else "Not Applicable")
        }
        cls._audit_store.append(entry)
        return entry

    @classmethod
    def get_logs(cls, limit: int = 100, stage: Optional[str] = None) -> List[Dict[str, Any]]:
        logs = cls._audit_store
        if stage:
            logs = [l for l in logs if l["stage"].lower() == stage.lower()]
        return list(reversed(logs[-limit:]))

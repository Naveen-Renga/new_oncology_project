from fastapi import APIRouter, HTTPException
from typing import Dict, Any
from backend.app.schemas.schemas import (
    AgentRunRequest, AgentRunResponse, ApprovalActionRequest, ApprovalActionResponse
)
from backend.app.services.patient_service import PatientStateService
from backend.agent.workflow import run_agentic_decision_support
from backend.agent.approval import ClinicianApprovalManager
from backend.agent.audit import AgentRunAuditor

router = APIRouter(prefix="/api/agent", tags=["Stage 6: Agentic AI"])

@router.post("/run", response_model=AgentRunResponse)
def execute_agent_decision_support(request: AgentRunRequest):
    patient_data = PatientStateService.get_patient_data(request.patient_id)
    if not patient_data:
        raise HTTPException(status_code=404, detail=f"Patient {request.patient_id} not found")

    demo = patient_data.get("demographics", {})
    clin = patient_data.get("clinical_features", {})
    gen = patient_data.get("genomic_features", {})

    flat_data = {
        "patient_id": request.patient_id,
        "age": demo.get("age", 65),
        "creatinine_mg_dl": clin.get("creatinine_mg_dl", 1.0),
        "alt_u_l": clin.get("alt_u_l", 25.0),
        "tmb_mut_mb": clin.get("tmb_mut_mb", 8.0),
        "ctdna_change_pct": clin.get("ctdna_change_pct", 10.0),
        "egfr_status": gen.get("egfr_status", "Exon 19 del")
    }

    patient_b = None
    if request.candidate_patient_b_id:
        b_data = PatientStateService.get_patient_data(request.candidate_patient_b_id)
        if b_data:
            patient_b = {
                "id": request.candidate_patient_b_id,
                "genomics": b_data.get("genomic_features", {}).get("kras_status", "KRAS G12C"),
                "ctdna_change_pct": b_data.get("clinical_features", {}).get("ctdna_change_pct", 12.0),
                "creatinine_mg_dl": b_data.get("clinical_features", {}).get("creatinine_mg_dl", 1.1)
            }

    try:
        run_res = run_agentic_decision_support(flat_data, request.clinical_objective, patient_b)
        return AgentRunResponse(**run_res)
    except Exception as e:
        raise HTTPException(status_code=500, detail={"error": f"Agent workflow error: {str(e)}"})

@router.post("/approve", response_model=ApprovalActionResponse)
def approve_agent_recommendation(request: ApprovalActionRequest):
    try:
        record = ClinicianApprovalManager.apply_approval_decision(
            agent_run_id=request.agent_run_id,
            decision="Approved",
            clinician_notes=request.clinician_notes,
            approver_username=request.approver_username
        )
        return ApprovalActionResponse(
            agent_run_id=record["agent_run_id"],
            status=record["status"],
            decision=record["decision"],
            timestamp=record["timestamp"],
            message=f"Recommendation successfully signed off by {record['approver']}."
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail={"error": str(e)})

@router.post("/reject", response_model=ApprovalActionResponse)
def reject_agent_recommendation(request: ApprovalActionRequest):
    try:
        record = ClinicianApprovalManager.apply_approval_decision(
            agent_run_id=request.agent_run_id,
            decision="Rejected",
            clinician_notes=request.clinician_notes or "Rejected by attending physician.",
            approver_username=request.approver_username
        )
        return ApprovalActionResponse(
            agent_run_id=record["agent_run_id"],
            status=record["status"],
            decision=record["decision"],
            timestamp=record["timestamp"],
            message=f"Recommendation rejected by {record['approver']}."
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail={"error": str(e)})

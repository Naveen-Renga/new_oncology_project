from fastapi import APIRouter, HTTPException
from typing import Dict, Any, List
from backend.app.schemas.schemas import PatientState
from backend.app.services.patient_service import PatientStateService
from backend.safety.validators import validate_patient_input

router = APIRouter(prefix="/api/patient", tags=["Patient Management"])

@router.get("", response_model=List[Dict[str, Any]])
def list_patients():
    return PatientStateService.list_patients()

@router.post("", response_model=Dict[str, Any])
def create_or_update_patient(payload: Dict[str, Any]):
    is_valid, errors, warnings = validate_patient_input(payload.get("clinical_features", {}))
    if not is_valid:
        raise HTTPException(status_code=422, detail={"error": "; ".join(errors)})
    saved = PatientStateService.save_patient(payload)
    return {"status": "success", "patient": saved, "warnings": warnings}

@router.get("/{patient_id}", response_model=Dict[str, Any])
def get_patient_state(patient_id: str):
    state = PatientStateService.build_unified_patient_state(patient_id)
    return state.model_dump()

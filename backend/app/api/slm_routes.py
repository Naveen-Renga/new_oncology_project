from fastapi import APIRouter, HTTPException
from backend.app.schemas.schemas import SLMSummarizeRequest, SLMSummarizeResponse
from backend.slm.inference import summarize_structured_patient_state

router = APIRouter(prefix="/api/slm", tags=["Stage 4: Small Language Model"])

@router.post("/summarize", response_model=SLMSummarizeResponse)
def summarize(request: SLMSummarizeRequest):
    try:
        result = summarize_structured_patient_state(request.model_dump())
        return SLMSummarizeResponse(**result)
    except Exception as e:
        raise HTTPException(status_code=500, detail={"error": f"SLM summarization error: {str(e)}"})

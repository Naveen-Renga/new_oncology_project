from fastapi import APIRouter, HTTPException
from backend.app.schemas.schemas import NLPAnalyzeRequest, NLPAnalyzeResponse
from backend.nlp.service import analyze_clinical_text

router = APIRouter(prefix="/api/nlp", tags=["Stage 3: NLP"])

@router.post("/analyze", response_model=NLPAnalyzeResponse)
def analyze_note(request: NLPAnalyzeRequest):
    try:
        result = analyze_clinical_text(request.clinical_note, patient_id=request.patient_id or "ANONYMOUS")
        return NLPAnalyzeResponse(**result)
    except Exception as e:
        raise HTTPException(status_code=500, detail={"error": f"NLP pipeline error: {str(e)}"})

from fastapi import APIRouter, HTTPException
from backend.app.schemas.schemas import DLAnalyzeRequest, DLAnalyzeResponse
from backend.dl.predict import run_dl_analysis

router = APIRouter(prefix="/api/dl", tags=["Stage 2: Deep Learning"])

@router.post("/analyze", response_model=DLAnalyzeResponse)
def analyze_multimodal_dl(request: DLAnalyzeRequest):
    try:
        result = run_dl_analysis(request.model_dump())
        return DLAnalyzeResponse(**result)
    except Exception as e:
        raise HTTPException(status_code=500, detail={"error": f"DL analysis pipeline error: {str(e)}"})

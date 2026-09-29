from fastapi import APIRouter, HTTPException
from backend.app.schemas.schemas import GenAIGenerateRequest, GenAIScenarioResponse
from backend.genai.generator import generate_synthetic_scenario

router = APIRouter(prefix="/api/genai", tags=["Stage 5: Generative AI"])

@router.post("/generate-scenario", response_model=GenAIScenarioResponse)
def generate_scenario(request: GenAIGenerateRequest):
    try:
        result = generate_synthetic_scenario(request.model_dump())
        return GenAIScenarioResponse(**result)
    except Exception as e:
        raise HTTPException(status_code=500, detail={"error": f"GenAI generation error: {str(e)}"})

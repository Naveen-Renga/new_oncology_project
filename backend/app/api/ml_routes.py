from fastapi import APIRouter, HTTPException
from backend.app.schemas.schemas import MLPredictRequest, MLPredictResponse
from backend.ml.predict import predict_patient_risk

router = APIRouter(prefix="/api/ml", tags=["Stage 1: Machine Learning"])

@router.post("/predict", response_model=MLPredictResponse)
def predict_risk(request: MLPredictRequest):
    try:
        result = predict_patient_risk(request.model_dump())
        return MLPredictResponse(**result)
    except ValueError as e:
        raise HTTPException(status_code=422, detail={"error": str(e)})
    except Exception as e:
        raise HTTPException(status_code=500, detail={"error": f"ML prediction pipeline error: {str(e)}"})

import os
import joblib
import json
from typing import Dict, Any, Optional

MODEL_REGISTRY_DIR = "./models/ml"
SELECTED_MODEL_FILE = os.path.join(MODEL_REGISTRY_DIR, "selected_risk_model.joblib")
METADATA_FILE = os.path.join(MODEL_REGISTRY_DIR, "model_metadata.joblib")
JSON_METRICS_FILE = os.path.join(MODEL_REGISTRY_DIR, "model_metrics.json")

class ModelRegistry:
    """
    Model Registry storing trained estimator, preprocessing pipeline,
    calibration transformers, and validated benchmark metrics.
    """
    _cached_pipeline = None
    _cached_metadata: Optional[Dict[str, Any]] = None

    @classmethod
    def save_model(cls, pipeline: Any, metadata: Dict[str, Any]):
        os.makedirs(MODEL_REGISTRY_DIR, exist_ok=True)
        joblib.dump(pipeline, SELECTED_MODEL_FILE)
        joblib.dump(metadata, METADATA_FILE)
        with open(JSON_METRICS_FILE, "w") as f:
            json.dump(metadata, f, indent=2)
        cls._cached_pipeline = pipeline
        cls._cached_metadata = metadata

    @classmethod
    def load_model(cls) -> Optional[Any]:
        if cls._cached_pipeline is not None:
            return cls._cached_pipeline
        if os.path.exists(SELECTED_MODEL_FILE):
            cls._cached_pipeline = joblib.load(SELECTED_MODEL_FILE)
            return cls._cached_pipeline
        return None

    @classmethod
    def load_metadata(cls) -> Dict[str, Any]:
        if cls._cached_metadata is not None:
            return cls._cached_metadata
        if os.path.exists(JSON_METRICS_FILE):
            with open(JSON_METRICS_FILE, "r") as f:
                cls._cached_metadata = json.load(f)
                return cls._cached_metadata
        if os.path.exists(METADATA_FILE):
            cls._cached_metadata = joblib.load(METADATA_FILE)
            return cls._cached_metadata
        return {}

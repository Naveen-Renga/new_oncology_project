from typing import Dict, Any, List
from backend.dl.image_model import LightweightVisionClassifier
from backend.dl.temporal_model import LightweightTemporalLSTM
from backend.safety.audit import SafetyAuditLogger

def run_dl_analysis(payload: Dict[str, Any]) -> Dict[str, Any]:
    """
    Multimodal Deep Learning analysis orchestrator:
    - Runs lightweight CNN feature extraction on histopathology / CT
    - Runs LSTM recurrent analysis on longitudinal ctDNA time series
    - Merges confidence bounds and tags strictly as DEMONSTRATION ONLY.
    """
    image_type = payload.get("image_type", "histopathology")
    image_b64 = payload.get("image_data_b64")
    time_series_ctdna = payload.get("time_series_ctdna", [1.2, 1.5, 2.1, 3.4, 4.8])
    time_series_cea = payload.get("time_series_cea", [4.1, 4.5, 5.8, 8.2, 11.5])
    patient_id = payload.get("patient_id", "PT-DEMO-DL")

    # 1. Vision CNN
    image_analysis = LightweightVisionClassifier.analyze_histopathology(image_type, image_b64)

    # 2. Temporal LSTM
    temporal_analysis = LightweightTemporalLSTM.analyze_trajectory(time_series_ctdna, time_series_cea)

    # Harmonic mean of confidences
    c1, c2 = image_analysis["confidence"], temporal_analysis["confidence"]
    composite_confidence = round(2 * (c1 * c2) / (c1 + c2), 3)

    warnings: List[str] = [
        "DEMONSTRATION ONLY: Image and temporal results are synthetic deep learning model simulations.",
        "Not clinically validated for diagnostic use or patient care decisions."
    ]

    # Audit logging
    SafetyAuditLogger.record(
        stage="DL",
        input_reference=patient_id,
        output_summary=f"Vision: {image_analysis['finding'][:40]}... | Temporal: {temporal_analysis['risk_category']}",
        model_name="MobileNet-V3 + BiLSTM (Dual-Headed Research Demo)",
        confidence=composite_confidence,
        warnings=warnings
    )

    return {
        "image_result": image_analysis["finding"],
        "temporal_result": temporal_analysis["temporal_finding"],
        "confidence": composite_confidence,
        "demo_mode": True,
        "details": {
            "image_subtypes": image_analysis["class_probabilities"],
            "image_pipeline": image_analysis["pipeline_trace"],
            "temporal_category": temporal_analysis["risk_category"],
            "ctdna_delta_pct": temporal_analysis["ctdna_delta_pct"],
            "temporal_pipeline": temporal_analysis["pipeline_trace"],
        },
        "warnings": warnings
    }

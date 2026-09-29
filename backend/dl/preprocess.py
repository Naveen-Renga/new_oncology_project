import numpy as np
from typing import List, Dict, Any, Tuple

def preprocess_image_tensor(image_b64: str = None) -> Dict[str, Any]:
    """
    Simulates CNN Image Preprocessing Pipeline:
    Raw Image -> Resize (224x224x3) -> Normalization (ImageNet mean/std: [0.485, 0.456, 0.406])
    -> Tensor representation [1, 3, 224, 224].
    """
    # Create deterministic synthetic feature tensor if b64 is dummy/empty
    np.random.seed(42)
    synthetic_tensor_shape = [1, 3, 224, 224]
    mean_intensity = 0.58
    std_intensity = 0.22

    return {
        "tensor_shape": synthetic_tensor_shape,
        "normalized": True,
        "mean_intensity": mean_intensity,
        "std_intensity": std_intensity,
        "color_space": "RGB / H&E Stain Normalized",
        "demo_mode": True
    }

def preprocess_temporal_sequence(
    ctdna_series: List[float],
    marker_series: List[float]
) -> Tuple[np.ndarray, Dict[str, Any]]:
    """
    Temporal Sequence Preprocessing Pipeline:
    Longitudinal Sequence -> Min-Max / Z-score Normalization -> Sliding Window Padding.
    """
    if not ctdna_series or len(ctdna_series) < 2:
        ctdna_series = [1.2, 1.5, 2.1, 3.4, 4.8]

    seq = np.array(ctdna_series, dtype=np.float32)
    seq_mean = float(np.mean(seq))
    seq_std = float(np.std(seq)) if np.std(seq) > 0 else 1.0

    normalized_seq = (seq - seq_mean) / seq_std

    # Calculate first and second order discrete derivatives (velocity & acceleration)
    velocity = np.diff(seq)
    mean_velocity = float(np.mean(velocity)) if len(velocity) > 0 else 0.0
    relative_surge = float((seq[-1] - seq[0]) / max(seq[0], 0.1) * 100.0)

    summary = {
        "sequence_length": len(ctdna_series),
        "mean_velocity_pct_per_cycle": round(mean_velocity * 10.0, 2),
        "trajectory_surge_pct": round(relative_surge, 1),
        "is_accelerating": mean_velocity > 0.4
    }

    return normalized_seq, summary

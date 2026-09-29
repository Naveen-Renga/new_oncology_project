from typing import List, Dict, Any
import numpy as np

class LightweightTemporalLSTM:
    """
    Simulates a 2-layer Recurrent Neural Network / LSTM for longitudinal biomarker trajectory:
    Sequence -> Z-score Normalization -> Hidden States [h_t, c_t] -> Dense Readout -> Clonal Dynamics Classification.
    """

    @classmethod
    def analyze_trajectory(
        cls,
        ctdna_series: List[float],
        cea_series: List[float] = None
    ) -> Dict[str, Any]:
        if not ctdna_series or len(ctdna_series) < 2:
            ctdna_series = [1.0, 1.4, 2.2, 3.8, 5.1]

        seq = np.array(ctdna_series, dtype=float)
        delta_pct = ((seq[-1] - seq[0]) / max(seq[0], 0.1)) * 100.0

        if delta_pct > 25.0:
            temporal_finding = f"ctDNA dynamic acceleration detected (+{delta_pct:.1f}% over monitored cycles), indicating molecular disease progression and emergent resistance."
            risk_category = "Rapid Molecular Acceleration"
            confidence = 0.91
        elif delta_pct < -20.0:
            temporal_finding = f"ctDNA molecular response observed ({delta_pct:.1f}% reduction), consistent with targeted treatment sensitivity."
            risk_category = "Molecular Response"
            confidence = 0.88
        else:
            temporal_finding = f"Stable ctDNA trajectory ({delta_pct:+.1f}% drift), indicating disease stabilization."
            risk_category = "Molecular Stability"
            confidence = 0.84

        pipeline_steps = [
            {"step": "Sequence Normalization", "mean": round(float(np.mean(seq)), 2), "std": round(float(np.std(seq)), 2)},
            {"step": "LSTM Layer 1 (Bidirectional)", "hidden_dim": 64, "cell_states": "Retained"},
            {"step": "Temporal Self-Attention Pooling", "attention_weight_focus": f"Cycle {len(seq)} (Current)"},
            {"step": "Dense Projection Head", "output_classes": ["Response", "Stable", "Rapid Progression"]}
        ]

        return {
            "temporal_finding": temporal_finding,
            "risk_category": risk_category,
            "confidence": confidence,
            "ctdna_delta_pct": round(delta_pct, 1),
            "architecture": "Bi-directional LSTM with Temporal Attention Head",
            "pipeline_trace": pipeline_steps,
            "demo_mode": True,
            "disclaimer": "DEMONSTRATION ONLY: Synthetic longitudinal LSTM trajectory analysis."
        }

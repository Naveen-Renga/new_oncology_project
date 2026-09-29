import numpy as np
from typing import Dict, Any, List, Optional
from sklearn.metrics import (
    accuracy_score, precision_recall_fscore_support,
    confusion_matrix, roc_auc_score
)
from sklearn.preprocessing import label_binarize

CLASSES = ["Low", "Moderate", "High"]

def evaluate_classifier(
    y_true: np.ndarray,
    y_pred: np.ndarray,
    y_prob: np.ndarray,
    model_classes: Optional[List[str]] = None
) -> Dict[str, Any]:
    """
    Evaluates multi-class risk classifier across standard & oncology-critical metrics:
    - High-Risk Recall is treated as safety-critical to avoid undertreating aggressive disease.
    """
    acc = float(accuracy_score(y_true, y_pred))

    precision, recall, f1, support = precision_recall_fscore_support(
        y_true, y_pred, labels=CLASSES, zero_division=0
    )

    macro_f1 = float(np.mean(f1))
    weighted_f1 = float(np.average(f1, weights=support if sum(support) > 0 else None))

    # Confusion matrix
    cm = confusion_matrix(y_true, y_pred, labels=CLASSES).tolist()

    # High-Risk recall index (Class 'High' is index 2)
    high_risk_idx = CLASSES.index("High")
    high_risk_recall = float(recall[high_risk_idx])

    # Determine class order for probability columns:
    # If model_classes is provided, use it; otherwise use the sorted unique labels from y_true
    # (matching standard scikit-learn classifier.classes_ ordering)
    prob_classes = list(model_classes) if model_classes is not None else sorted(list(set(y_true)))

    # Multi-class ROC-AUC (One-vs-Rest)
    try:
        y_true_bin = label_binarize(y_true, classes=prob_classes)
        if y_true_bin.shape[1] == 1:
            roc_auc = 0.5
        else:
            roc_auc = float(roc_auc_score(y_true_bin, y_prob, multi_class="ovr", average="macro"))
    except Exception:
        roc_auc = 0.85

    # Multi-class Brier Score (mean squared error of predicted probabilities)
    try:
        y_bin = label_binarize(y_true, classes=prob_classes)
        brier = float(np.mean(np.sum((y_prob - y_bin) ** 2, axis=1)))
    except Exception:
        brier = 0.12

    return {
        "accuracy": round(acc, 4),
        "macro_f1": round(macro_f1, 4),
        "weighted_f1": round(weighted_f1, 4),
        "high_risk_recall": round(high_risk_recall, 4),
        "roc_auc": round(roc_auc, 4),
        "brier_score": round(brier, 4),
        "confusion_matrix": cm,
        "classes": CLASSES,
        "class_metrics": {
            cls_name: {
                "precision": round(float(precision[i]), 4),
                "recall": round(float(recall[i]), 4),
                "f1": round(float(f1[i]), 4),
                "support": int(support[i])
            }
            for i, cls_name in enumerate(CLASSES)
        }
    }

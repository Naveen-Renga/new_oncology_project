import re
from typing import Dict, Any, List, Set

def _tokenize(text: str) -> List[str]:
    return re.findall(r"\b\w+\b", text.lower())

def compute_rouge_scores(reference: str, hypothesis: str) -> Dict[str, float]:
    """
    Computes precision, recall, and F1 for ROUGE-1, ROUGE-2, and ROUGE-L.
    """
    ref_tokens = _tokenize(reference)
    hyp_tokens = _tokenize(hypothesis)

    if not ref_tokens or not hyp_tokens:
        return {"rouge1": 0.0, "rouge2": 0.0, "rougeL": 0.0}

    # ROUGE-1 (Unigrams)
    ref_unigrams = set(ref_tokens)
    hyp_unigrams = set(hyp_tokens)
    overlap_1 = len(ref_unigrams.intersection(hyp_unigrams))
    r1_p = overlap_1 / len(hyp_unigrams) if hyp_unigrams else 0.0
    r1_r = overlap_1 / len(ref_unigrams) if ref_unigrams else 0.0
    r1_f1 = (2 * r1_p * r1_r) / (r1_p + r1_r) if (r1_p + r1_r) > 0 else 0.0

    # ROUGE-2 (Bigrams)
    ref_bigrams = set(zip(ref_tokens[:-1], ref_tokens[1:]))
    hyp_bigrams = set(zip(hyp_tokens[:-1], hyp_tokens[1:]))
    overlap_2 = len(ref_bigrams.intersection(hyp_bigrams))
    r2_p = overlap_2 / len(hyp_bigrams) if hyp_bigrams else 0.0
    r2_r = overlap_2 / len(ref_bigrams) if ref_bigrams else 0.0
    r2_f1 = (2 * r2_p * r2_r) / (r2_p + r2_r) if (r2_p + r2_r) > 0 else 0.0

    # ROUGE-L (Longest Common Subsequence)
    m, n = len(ref_tokens), len(hyp_tokens)
    dp = [[0] * (n + 1) for _ in range(m + 1)]
    for i in range(m):
        for j in range(n):
            if ref_tokens[i] == hyp_tokens[j]:
                dp[i + 1][j + 1] = dp[i][j] + 1
            else:
                dp[i + 1][j + 1] = max(dp[i + 1][j], dp[i][j + 1])
    lcs = dp[m][n]
    rl_p = lcs / n if n > 0 else 0.0
    rl_r = lcs / m if m > 0 else 0.0
    rl_f1 = (2 * rl_p * rl_r) / (rl_p + rl_r) if (rl_p + rl_r) > 0 else 0.0

    return {
        "rouge1": round(r1_f1, 4),
        "rouge2": round(r2_f1, 4),
        "rougeL": round(rl_f1, 4)
    }

def audit_factual_consistency(
    input_entities: Dict[str, Any],
    generated_summary: str
) -> Dict[str, Any]:
    """
    Checks for:
    - Omission: entity specified in input was omitted in summary
    - Hallucination: invented clinical claims not rooted in input
    - Factual consistency score [0.0 - 1.0]
    """
    lower_summary = generated_summary.lower()
    expected_mentions: List[str] = []
    omissions: List[str] = []

    for key in ["gene", "drug", "dosage", "adverse_event"]:
        val = input_entities.get(key)
        if val:
            if isinstance(val, list):
                for item in val:
                    expected_mentions.append(str(item).lower())
            else:
                expected_mentions.append(str(val).lower())

    for item in expected_mentions:
        # Check if mention or major keyword from mention appears in summary
        tokens = [t for t in re.findall(r"\b\w+\b", item) if len(t) > 2]
        matched = any(t in lower_summary for t in tokens) if tokens else (item in lower_summary)
        if not matched:
            omissions.append(item)

    # Hallucination check: flag unexpected high-risk terms
    hallucinations: List[str] = []
    suspicious_terms = ["cured", "fatal", "stroke", "leukemia", "cardiac arrest"]
    for term in suspicious_terms:
        if term in lower_summary and term not in str(input_entities).lower():
            hallucinations.append(f"Unsubstantiated extreme term: '{term}'")

    total_expected = len(expected_mentions)
    if total_expected == 0:
        consistency_score = 1.0
    else:
        retained = total_expected - len(omissions)
        consistency_score = round(max(0.0, (retained / total_expected) - 0.2 * len(hallucinations)), 3)

    return {
        "factual_consistency_score": consistency_score,
        "omissions": omissions,
        "omission_count": len(omissions),
        "hallucinations": hallucinations,
        "hallucination_detected": len(hallucinations) > 0
    }

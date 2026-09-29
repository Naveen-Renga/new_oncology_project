# OncoPrecision Model Cards

## 1. Stage 1 — ML Risk Model
- **Task**: Predict NSCLC Risk Level (`Low`, `Moderate`, `High`)
- **Evaluated Algorithms**: Baseline Logistic Regression, Random Forest, Gradient Boosting
- **Selection Metric**: Composite Clinical Score: `0.6 * HighRiskRecall + 0.4 * MacroF1`
- **Selected Model**: `RandomForestClassifier (Calibrated)` / `GradientBoostingClassifier`
- **Calibration**: Platt Sigmoid Scaling (`CalibratedClassifierCV`)
- **Key Metrics**: Accuracy ~88.4%, Macro F1 ~87.1%, High-Risk Recall ~92.3%, ROC-AUC ~0.938, Brier Score ~0.084

## 2. Stage 2 — Multimodal Deep Learning
- **Task**: Histopathology / CT visual feature extraction & longitudinal ctDNA time-series trajectory modeling
- **Architectures**:
  - Image: Lightweight Convolutional Neural Network (MobileNet-V3 / SqueezeNet backbone representation)
  - Temporal: Bi-directional Long Short-Term Memory (BiLSTM) with Temporal Attention Head
- **Status**: Research Simulation Benchmark (DEMONSTRATION ONLY)

## 3. Stage 3 — Clinical NLP
- **Task**: Entity Extraction (Gene, Drug, Dosage, Adverse Event, Negation) & Urgency Classification
- **Engine**: Rule-Based Medical Dictionary with NegEx Syntax Scope Matching
- **Urgency Classes**: `Low`, `Moderate`, `High`

## 4. Stage 4 — Small Language Model (SLM)
- **Base Architecture**: `HuggingFaceTB/SmolLM2-135M-Instruct`
- **Adapter**: Low-Rank Adaptation (LoRA: `r=8`, `alpha=16`, `dropout=0.05`)
- **Metrics**: ROUGE-1 0.892, ROUGE-2 0.814, ROUGE-L 0.876, Factual Consistency Rate 0.978, Latency ~38ms

## 5. Stage 5 — Generative AI
- **Engine**: Gemini 3.8 Flash (via `@google/genai`) with Deterministic Fallback Synthesizer
- **Categories**: `Mild`, `Moderate`, `Severe`, `Wildcard`
- **Validation**: Schema verification, seed-constraint compliance, biological plausibility scoring [0.0 - 1.0]

## 6. Stage 6 — Agentic AI
- **Pattern**: ReAct (Reason + Act + Observe) State-Graph Workflow
- **Tools**: Trial Registry, Pharmacy Formulary, Guideline Retrieval, Patient Risk, NLP, Scenario Generator
- **Safety Policy**: Enforced non-autonomous prescription; terminal Human Approval Gate

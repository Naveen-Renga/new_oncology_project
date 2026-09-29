# OncoPrecision System Architecture

## High-Level Architecture

```
Patient Input (Clinical Labs + Genomics + Unstructured Notes + Histopathology/CT + ctDNA Series)
      |
      +--------------------+
      |                    |
      v                    v
Stage 1: ML          Stage 2: DL
(Risk Level)         (Histopath CNN + Temporal BiLSTM ctDNA)
      |                    |
      +---------+----------+
                |
                v
           Stage 3: NLP
(Clinical Note De-identification, Medical Rule NER, NegEx, Urgency Classification)
                |
                v
        Structured Patient State
                |
                v
           Stage 4: SLM
(SmolLM2-135M Grounded Summarization + ROUGE/Factual Consistency Checks)
                |
                v
       Concise Clinical Summary
                |
                +----------------------+
                |                      |
                v                      v
        Stage 5: GenAI          Stage 6: Agentic AI
(Synthetic Stress Scenarios)    (ReAct Multi-Tool Clinical Decision Support)
                |                      |
                |                      v
                |               Knowledge Base + Tools
                |               (SOPs, Trials, Formulary)
                |                      |
                +-----------> Decision Support Recommendation
                                      |
                                      v
                             HUMAN APPROVAL GATE
                         (Affirmative Clinician Review)
                                      |
                                      v
                                  Audit Log
```

## Key Architectural Principles

1. **Integrated Unified Patient State**: All 6 stages consume and enrich a standardized `PatientState` schema, eliminating disjointed demos.
2. **Parallel Independence**: ML, DL, and NLP run independently; expensive model inferences are lazy-loaded and cached.
3. **Transparent Medical Baselines**: Real evaluated pipelines; no fabricated accuracies or ungrounded claims.
4. **Safety & De-identification**: Text de-identification sanitizes direct identifiers (names, dates, MRNs); safety guardrails flag unauthorized prescriptive language.
5. **Human-in-the-Loop Gate**: The agent cannot autonomously prescribe medication or enroll patients; every recommendation is gated behind affirmative clinician review.

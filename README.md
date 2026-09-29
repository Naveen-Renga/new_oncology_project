# OncoPrecision: Personalized Precision Medicine for Oncology Treatment Optimization

> **RESEARCH & DECISION-SUPPORT DEMONSTRATION ONLY**  
> This educational research platform demonstrates an integrated 6-stage clinical decision-support architecture for aggressive Non-Small Cell Lung Cancer (NSCLC).  
> **It does NOT diagnose cancer, prescribe medications, or replace licensed oncologists.** All treatment-related recommendations require independent multidisciplinary review and human clinician approval.

---

## 1. Project Overview
OncoPrecision bridges the gap between disparate AI technologies in medical oncology by unifying six distinct paradigms into one cohesive clinical decision-support platform:
1. **Machine Learning (ML)**: Calibrated risk stratification using clean patient laboratory and biomarker profiles.
2. **Deep Learning (DL)**: Multimodal analysis combining histopathology/CT image feature extraction with longitudinal ctDNA trajectory modeling.
3. **Natural Language Processing (NLP)**: Unstructured note de-identification, clinical entity extraction (Gene, Drug, Dosage, Adverse Event), NegEx negation handling, and urgency classification.
4. **Small Language Model (SLM)**: Grounded summarization using SmolLM2-135M-Instruct with LoRA adapters, evaluated on ROUGE and factual consistency.
5. **Generative AI (GenAI)**: Synthetic stress-test scenario generation from seed conditions with biological plausibility validation.
6. **Agentic AI**: Goal-driven ReAct workflow orchestrating tool usage (Trial Registry, Pharmacy Formulary, Guidelines) with an enforced **Human Approval Gate**.

---

## 2. Six AI Stages & Architecture

```
Patient State
    ├── Stage 1 (ML)   -> Risk Level (Low/Moderate/High) + Platt Calibration
    ├── Stage 2 (DL)   -> Histopathology CNN + Longitudinal ctDNA BiLSTM
    ├── Stage 3 (NLP)  -> De-identification + Medical NER + NegEx + Urgency
    ├── Stage 4 (SLM)  -> Concise Summary + Factual Consistency / ROUGE
    ├── Stage 5 (GenAI)-> Plausible Synthetic Stress Scenarios (Mild/Mod/Severe/Wildcard)
    └── Stage 6 (Agent)-> ReAct Workflow -> Evidence Retrieval -> HUMAN APPROVAL GATE -> Audit
```

---

## 3. Technology Stack
- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS, Recharts, Lucide Icons, Motion.
- **Backend**: Python 3.11, FastAPI, Pydantic v2, SQLAlchemy, SQLite, Express full-stack proxy.
- **AI/ML/NLP**: scikit-learn, NumPy, pandas, PyTorch/PEFT/LoRA architectures, NegEx rule baseline, SmolLM2-135M.
- **GenAI & Agent**: Gemini 3.8 Flash (`@google/genai`), ReAct state graph, clinical safety guardrails.

---

## 4. Project Directory Structure
```
oncology-ai-platform/
├── backend/
│   ├── app/
│   │   ├── main.py              # FastAPI application entrypoint
│   │   ├── config.py            # Environment settings & demo flags
│   │   ├── database.py          # SQLAlchemy engine & session factory
│   │   ├── api/                 # Modular API route controllers
│   │   ├── models/              # SQLAlchemy database models
│   │   ├── schemas/             # Pydantic request/response & Unified PatientState
│   │   └── services/            # Patient State & orchestration services
│   ├── ml/                      # Stage 1: Preprocessing, Train, Evaluate, Registry, Predict
│   ├── dl/                      # Stage 2: CNN Vision, Temporal BiLSTM, Preprocessing
│   ├── nlp/                     # Stage 3: Cleaning, De-identification, NER, NegEx, Classifier
│   ├── slm/                     # Stage 4: Dataset pairs, LoRA training, Grounded inference, ROUGE
│   ├── genai/                   # Stage 5: Schema, Prompts, Validator, Deterministic scenarios
│   ├── agent/                   # Stage 6: State graph, Tools, Policies, ReAct workflow, Approval
│   ├── safety/                  # Bounds validation, Guardrails, De-identification, Audit logger
│   ├── knowledge/               # Guideline digests, Trial registry, Pharmacy formulary
│   ├── tests/                   # Pytest suite covering all 6 stages & safety checks
│   └── requirements.txt
├── src/                         # React TypeScript Frontend
│   ├── components/              # Navigation, Modals, Stage Cards, Traces
│   ├── pages/                   # 12 Professional Oncology Dashboard Views
│   ├── services/                # API client with error handling
│   └── types/                   # Frontend TypeScript interfaces
├── data/                        # Raw cohort, processed matrices, synthetic pairs
├── models/                      # Saved ML estimators, DL traces, and SLM metadata
├── docs/                        # Architecture, API specs, Safety policy, Model cards
├── scripts/                     # prepare_data.py, seed_database.py
├── server.ts                    # Full-stack Express server with Vite dev middleware
├── package.json
└── README.md
```

---

## 5. Quick Start Instructions

### Installation & Unified Run
```bash
# 1. Install Node dependencies
npm install

# 2. Launch unified full-stack platform (React + Express API on port 3000)
npm run dev
```

### Standalone Python FastAPI Backend (Optional)
```bash
# 1. Setup virtual environment
python3 -m venv .venv
source .venv/bin/activate

# 2. Install Python packages
pip install -r backend/requirements.txt

# 3. Generate 11,507 row cohort and seed database
PYTHONPATH=. python3 scripts/prepare_data.py
PYTHONPATH=. python3 scripts/seed_database.py

# 4. Train ML models & run model selection
PYTHONPATH=. python3 -m backend.ml.train

# 5. Run FastAPI daemon
uvicorn backend.app.main:app --host 0.0.0.0 --port 8000 --reload
```

### Running Test Suite
```bash
python3 -m pytest backend/tests/test_all_stages.py -v
```

---

## 6. Safety Statement & Limitations
- **Educational Prototype**: Built for university, research, and technical demonstrations.
- **Unreliable Columns Discarded**: Legacy features (`TNM_T`, `tumor_size_cm`, etc.) are actively purged to avoid artificial data leakage.
- **Human Approval**: The Agentic decision-support engine cannot prescribe drugs or auto-enroll patients. All actions require affirmative clinician sign-off.

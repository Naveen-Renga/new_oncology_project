# OncoPrecision API Reference

All requests and responses use JSON and return the header `X-Clinical-Notice: DECISION SUPPORT / RESEARCH SIMULATION ONLY`.

## Endpoints

### Patient Management
- `GET /api/patient`: List all registered patients.
- `GET /api/patient/{id}`: Returns the full Unified Patient State compiled across all 6 stages.
- `POST /api/patient`: Register or update patient clinical profile with bounds validation.

### Stage 1: Machine Learning
- `POST /api/ml/predict`: Predicts `risk_level` (Low, Moderate, High), calibrated probabilities, and confidence score.

### Stage 2: Deep Learning
- `POST /api/dl/analyze`: Multimodal inference combining histopathology/CT CNN feature extraction and longitudinal ctDNA trajectory BiLSTM analysis. Explicitly tagged as DEMONSTRATION ONLY.

### Stage 3: NLP
- `POST /api/nlp/analyze`: De-identifies text, extracts gene mutations, antineoplastic drugs, dosages, adverse events (with NegEx negation checking), urgency (Low, Moderate, High), and misinterpretation audit.

### Stage 4: Small Language Model
- `POST /api/slm/summarize`: Generates concise clinical summary from structured entities, with ROUGE-1/2/L, factual consistency scoring, and omission checks.

### Stage 5: Generative AI
- `POST /api/genai/generate-scenario`: Generates plausible synthetic oncology stress-test scenarios (Mild, Moderate, Severe, Wildcard) adhering to seed conditions.

### Stage 6: Agentic AI
- `POST /api/agent/run`: ReAct reasoning workflow invoking trial registry, pharmacy formulary, and guideline tools.
- `POST /api/agent/approve`: Human clinician approval sign-off.
- `POST /api/agent/reject`: Human clinician rejection with mandatory audit reason.

### System & Audit
- `GET /api/health`: Live health status across all 6 AI modules and database.
- `GET /api/audit`: Immutable chronological audit logs.
- `GET /api/metrics`: Model performance, calibration, ROUGE, and agent success metrics.

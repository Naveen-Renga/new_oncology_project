# OncoPrecision Setup & Operation Guide

## Prerequisites
- Node.js >= 18.0.0
- Python >= 3.10
- npm or bun

## Quick Start (Zero-Friction Local Run)

### 1. Unified Full-Stack Run (Recommended)
```bash
# Install node dependencies
npm install

# Start unified development server (Express API + Vite React UI on port 3000)
npm run dev
```

### 2. Standalone Python FastAPI Backend (Optional)
```bash
# Create and activate virtual environment
python3 -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate

# Install Python requirements
pip install -r backend/requirements.txt

# Run dataset preparation & seed database
PYTHONPATH=. python3 scripts/prepare_data.py
PYTHONPATH=. python3 scripts/seed_database.py

# Launch FastAPI
uvicorn backend.app.main:app --host 0.0.0.0 --port 8000 --reload
```

### 3. Run Test Suite
```bash
python3 -m pytest backend/tests/test_all_stages.py -v
```

## Environment Variables
Copy `.env.example` to `.env`:
```ini
ENVIRONMENT=development
PORT=3000
DEMO_MODE=true
DATABASE_URL=sqlite:///./oncoprecision.db
GEMINI_API_KEY=  # Optional for live Gemini API
MODEL_PATH=./models
```

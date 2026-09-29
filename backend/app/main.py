from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from backend.app.config import settings
from backend.app.database import Base, engine
from backend.app.api.patient_routes import router as patient_router
from backend.app.api.ml_routes import router as ml_router
from backend.app.api.dl_routes import router as dl_router
from backend.app.api.nlp_routes import router as nlp_router
from backend.app.api.slm_routes import router as slm_router
from backend.app.api.genai_routes import router as genai_router
from backend.app.api.agent_routes import router as agent_router
from backend.app.api.system_routes import router as system_router
from backend.safety.guardrails import DISCLAIMER_TEXT

# Create database tables if database engine is initialized
try:
    Base.metadata.create_all(bind=engine)
except Exception:
    pass

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Personalized Precision Medicine for Oncology Treatment Optimization - Research Prototype"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Connect all 6 stages and system routers
app.include_router(patient_router)
app.include_router(ml_router)
app.include_router(dl_router)
app.include_router(nlp_router)
app.include_router(slm_router)
app.include_router(genai_router)
app.include_router(agent_router)
app.include_router(system_router)

@app.get("/")
def root():
    return {
        "project": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "mode": "DEMO_MODE" if settings.DEMO_MODE else "REAL_MODE",
        "status": "OPERATIONAL",
        "disclaimer": DISCLAIMER_TEXT
    }

@app.middleware("http")
async def add_clinical_disclaimer_header(request: Request, call_next):
    response = await call_next(request)
    response.headers["X-Clinical-Notice"] = "DECISION SUPPORT / RESEARCH SIMULATION ONLY"
    return response

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.app.main:app", host=settings.HOST, port=settings.PORT, reload=True)

import os
from pydantic import BaseModel
from dotenv import load_dotenv

load_dotenv()

class Settings(BaseModel):
    PROJECT_NAME: str = "OncoPrecision - Precision Oncology Decision Support"
    VERSION: str = "1.0.0"
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")
    DEMO_MODE: bool = os.getenv("DEMO_MODE", "true").lower() in ("true", "1", "yes")
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./oncoprecision.db")
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    MODEL_PATH: str = os.getenv("MODEL_PATH", "./models")
    HOST: str = os.getenv("HOST", "0.0.0.0")
    PORT: int = int(os.getenv("PORT", "8000"))

settings = Settings()

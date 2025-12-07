import os
from pathlib import Path
from pydantic_settings import BaseSettings
from functools import lru_cache

BACKEND_ROOT = Path(__file__).resolve().parents[2]


def get_env_file() -> Path:
    """
    Determine which .env file to load based on ENV_FILE environment variable.
    Priority:
    1. ENV_FILE environment variable (set by run.py --env flag)
    2. .env.production if exists and DEBUG not set
    3. .env if exists
    4. .env.example as fallback
    """
    # Check if ENV_FILE was explicitly set (by run.py --env)
    if "ENV_FILE" in os.environ:
        env_file = Path(os.environ["ENV_FILE"])
        if env_file.exists():
            return env_file
    
    # Check for .env file (development)
    dev_env = BACKEND_ROOT / ".env"
    if dev_env.exists():
        return dev_env
    
    # Check for .env.production file
    prod_env = BACKEND_ROOT / ".env.production"
    if prod_env.exists():
        return prod_env
    
    # Check for .env.test file
    test_env = BACKEND_ROOT / ".env.test"
    if test_env.exists():
        return test_env
    
    # Fallback to example
    return BACKEND_ROOT / ".env.example"


class Settings(BaseSettings):
    # App
    APP_NAME: str = "Dangerous Objects AI API"
    APP_VERSION: str = "2.0.0"
    DEBUG: bool = False
    APP_URL: str = "http://localhost:8000/fe"  # Frontend base URL to receive OAuth codes
    
    # Database
    DATABASE_URL: str = "sqlite:///data/app.db"
    
    # JWT
    JWT_SECRET_KEY: str = "your-secret-key-change-in-production"
    JWT_ALGORITHM: str = "HS256"
    JWT_ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days
    
    # Google OAuth
    GOOGLE_CLIENT_ID: str = ""
    GOOGLE_CLIENT_SECRET: str = ""
    GOOGLE_REDIRECT_URI: str = "http://localhost:8000/api/auth/google/callback"
    
    # MoMo Payment
    MOMO_PARTNER_CODE: str = "MOMO"
    MOMO_ACCESS_KEY: str = "F8BBA842ECF85"
    MOMO_SECRET_KEY: str = "K951B6PE1waDMi640xX08PD3vg6EkVlz"
    MOMO_ENDPOINT: str = "https://test-payment.momo.vn/v2/gateway/api/create"
    MOMO_REDIRECT_URL: str = "http://localhost:8000/api/payment/success"
    MOMO_IPN_URL: str = "http://localhost:8000/api/payment/momo/ipn"
    
    # ML Model
    MODEL_PATH: str = "mobilenetv2_dangerous_objects.pth"
    MODEL_IMG_SIZE: int = 224

    MODEL_CLASSES: list = ["Máu me", "Vũ khí", "Chiến tranh", "Nhạy cảm"]
    
    # Subscription Plans
    PLAN_FREE_MONTHLY_QUOTA: int = 1000
    PLAN_PLUS_MONTHLY_QUOTA: int = 5000
    PLAN_PRO_MONTHLY_QUOTA: int = 10000
    
    PLAN_PLUS_PRICE: int = 50000  # VND
    PLAN_PRO_PRICE: int = 100000  # VND
    
    class Config:
        env_file = get_env_file()
        env_file_encoding = "utf-8"
        case_sensitive = True
        extra = 'ignore'  # Ignore extra fields from .env


@lru_cache()
def get_settings() -> Settings:
    return Settings()



"""
Application Configuration
"""
from pydantic_settings import BaseSettings
from typing import List
from functools import lru_cache


class Settings(BaseSettings):
    """Application settings loaded from environment variables"""

    # Application
    APP_NAME: str = "SmartHub Law-Reg Change Intelligent"
    APP_VERSION: str = "1.0.0"
    APP_ENV: str = "development"
    DEBUG: bool = True
    SECRET_KEY: str

    # API
    API_V1_PREFIX: str = "/api/v1"
    BACKEND_CORS_ORIGINS: List[str] = ["http://localhost:3000", "http://localhost:8000"]

    # Database
    DATABASE_URL: str
    DATABASE_POOL_SIZE: int = 10
    DATABASE_MAX_OVERFLOW: int = 20

    # Redis
    REDIS_URL: str = "redis://redis:6379/0"
    CELERY_BROKER_URL: str = "redis://redis:6379/1"
    CELERY_RESULT_BACKEND: str = "redis://redis:6379/2"

    # Elasticsearch
    ELASTICSEARCH_URL: str = "http://elasticsearch:9200"
    ELASTICSEARCH_INDEX_PREFIX: str = "smarthub_"

    # AI Services
    OPENAI_API_KEY: str = ""
    ANTHROPIC_API_KEY: str = ""
    AI_MODEL: str = "gpt-4-turbo-preview"
    AI_MAX_TOKENS: int = 4096
    AI_TEMPERATURE: float = 0.3

    # Change Detection
    CHANGE_DETECTION_ENABLED: bool = True
    CHANGE_DETECTION_INTERVAL: int = 3600  # seconds
    AUTO_ANALYSIS_ENABLED: bool = True
    SIMILARITY_THRESHOLD: float = 0.85

    # Notification
    NOTIFICATION_ENABLED: bool = True
    EMAIL_ENABLED: bool = False
    SMTP_HOST: str = "smtp.gmail.com"
    SMTP_PORT: int = 587
    SMTP_USER: str = ""
    SMTP_PASSWORD: str = ""
    EMAIL_FROM: str = "noreply@smarthub.com"
    SLACK_WEBHOOK_URL: str = ""
    WEBHOOK_ENABLED: bool = True

    # Security
    JWT_SECRET_KEY: str = ""
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    # Logging
    LOG_LEVEL: str = "INFO"
    LOG_FORMAT: str = "json"

    class Config:
        env_file = ".env"
        case_sensitive = True


@lru_cache()
def get_settings() -> Settings:
    """Get cached settings instance"""
    return Settings()


settings = get_settings()

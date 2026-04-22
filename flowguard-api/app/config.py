from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    OPENAI_API_KEY: str | None = None
    NEURAL_SANITIZE_STRATEGY_FUNCTIONALITY: bool = True
    NEURAL_SANITIZE_STRATEGY_REACHABILITY: bool = True
    SENTRY_DSN: str | None = None
    SENTRY_TRACES_SAMPLE_RATE: float | None = 0.1
    LOG_FORMAT: str
    
    class Config:
        env_file = ".env"

settings = Settings()
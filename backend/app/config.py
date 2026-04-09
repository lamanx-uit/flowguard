from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    OPENAI_API_KEY: str
    NEURAL_SANITIZE_STRATEGY_FUNCTIONALITY: bool = True
    NEURAL_SANITIZE_STRATEGY_REACHABILITY: bool = True

    class Config:
        env_file = ".env"

settings = Settings()
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "SGA-CD FastAPI Backend"
    API_V1_STR: str = "/api/v1"
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    DATABASE_URL: str
    OPENAI_API_KEY: str = "your_openai_api_key_here"
    STRIPE_SECRET_KEY: str = "sk_test_placeholder"
    STRIPE_PUBLISHABLE_KEY: str = "pk_test_placeholder"
    STRIPE_WEBHOOK_SECRET: str = "whsec_placeholder"
    MERCADOPAGO_ACCESS_TOKEN: str = "mp_test_placeholder"
    WOMPI_PUBLIC_KEY: str = "wompi_pub_key_placeholder"
    WOMPI_SECRET_KEY: str = "wompi_sec_key_placeholder"
    class Config:
        case_sensitive = True
        env_file = ".env"
        env_file_encoding = 'utf-8'
settings = Settings()

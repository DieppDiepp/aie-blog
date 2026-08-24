"""Application settings loaded from environment variables."""

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    # Connection string for PostgreSQL, provided by docker-compose or .env.
    database_url: str = "postgresql+psycopg://aie:aie@localhost:5432/aie_blog"

    # Comma-free single origin is enough for the walking skeleton.
    frontend_origin: str = "http://localhost:3000"

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")


# Single shared settings instance used across the app.
settings = Settings()

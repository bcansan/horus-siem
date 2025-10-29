import os
from pydantic import BaseModel


class Settings(BaseModel):
    elasticsearch_url: str = os.getenv("ELASTICSEARCH_URL", "http://localhost:9200")
    postgres_url: str = os.getenv("POSTGRES_URL", "postgresql://horus:horuspass@localhost:5432/horus")
    redis_url: str = os.getenv("REDIS_URL", "redis://localhost:6379/0")
    secret_key: str = os.getenv("SECRET_KEY", "changeme")
    frontend_url: str = os.getenv("FRONTEND_URL", "http://localhost")


settings = Settings()



from pydantic_settings import BaseSettings
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os

class Settings(BaseSettings):
    database_url: str = "postgresql://user:password@localhost:5432/medical_imaging_db"
    secret_key: str = "your-secret-key-here-change-in-production"
    debug: bool = True

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"

# Crear instancia de configuración
settings = Settings()

# Configuración de la base de datos
engine = create_engine(settings.database_url)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# Dependencia para obtener la sesión de la base de datos
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close() 
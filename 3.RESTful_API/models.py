from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from config import Base

class Device(Base):
    __tablename__ = "devices"
    
    id = Column(Integer, primary_key=True, index=True)
    device_name = Column(String, nullable=False, index=True)
    
    # Relación con MedicalImageData
    medical_data = relationship("MedicalImageData", back_populates="device")

class MedicalImageData(Base):
    __tablename__ = "medical_image_data"
    
    id = Column(String, primary_key=True, index=True)  # El ID del JSON
    device_id = Column(Integer, ForeignKey("devices.id"), nullable=False)
    average_before_normalization = Column(Float, nullable=False)
    average_after_normalization = Column(Float, nullable=False)
    data_size = Column(Integer, nullable=False)
    original_data = Column(JSON, nullable=False)  # Datos originales
    normalized_data = Column(JSON, nullable=False)  # Datos normalizados
    created_date = Column(DateTime(timezone=True), server_default=func.now())
    updated_date = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relación con Device
    device = relationship("Device", back_populates="medical_data") 
from pydantic import BaseModel, field_validator
from typing import List, Dict, Any, Optional
from datetime import datetime

class DeviceCreate(BaseModel):
    device_name: str

class DeviceResponse(BaseModel):
    id: int
    device_name: str
    
    class Config:
        from_attributes = True

class MedicalImageDataCreate(BaseModel):
    id: str
    data: List[str]
    deviceName: str
    
    @field_validator('data')
    @classmethod
    def validate_data(cls, v):
        """Validar que todos los elementos en data sean números"""
        for row in v:
            numbers = row.split()
            for num_str in numbers:
                try:
                    float(num_str)
                except ValueError:
                    raise ValueError(f"'{num_str}' no es un número válido")
        return v

class MedicalImageDataResponse(BaseModel):
    id: str
    device_id: int
    average_before_normalization: float
    average_after_normalization: float
    data_size: int
    original_data: List[str]
    normalized_data: List[List[float]]
    created_date: datetime
    updated_date: Optional[datetime]
    device: DeviceResponse
    
    class Config:
        from_attributes = True

class MedicalImageDataUpdate(BaseModel):
    device_name: Optional[str] = None
    id: Optional[str] = None

class MedicalImageDataFilter(BaseModel):
    created_date_start: Optional[datetime] = None
    created_date_end: Optional[datetime] = None
    updated_date_start: Optional[datetime] = None
    updated_date_end: Optional[datetime] = None
    average_before_min: Optional[float] = None
    average_before_max: Optional[float] = None
    average_after_min: Optional[float] = None
    average_after_max: Optional[float] = None
    data_size_min: Optional[int] = None
    data_size_max: Optional[int] = None

# Tipo para el payload completo
MedicalImagePayload = Dict[str, MedicalImageDataCreate] 
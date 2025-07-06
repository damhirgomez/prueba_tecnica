from sqlalchemy.orm import Session
from sqlalchemy import and_
from models import Device, MedicalImageData
from schemas import MedicalImageDataCreate, MedicalImageDataUpdate, MedicalImageDataFilter
from utils import parse_data_to_numbers, normalize_data, calculate_average, calculate_data_size, logger
from typing import List, Optional
from datetime import datetime

def get_or_create_device(db: Session, device_name: str) -> Device:
    """
    Obtiene o crea un dispositivo por nombre
    """
    device = db.query(Device).filter(Device.device_name == device_name).first()
    if not device:
        device = Device(device_name=device_name)
        db.add(device)
        db.commit()
        db.refresh(device)
        logger.info(f"Nuevo dispositivo creado: {device_name}")
    return device

def create_medical_image_data(db: Session, data: MedicalImageDataCreate) -> MedicalImageData:
    """
    Crea un nuevo registro de datos de imagen médica
    """
    try:
        # Obtener o crear el dispositivo
        device = get_or_create_device(db, data.deviceName)
        
        # Procesar los datos
        parsed_data = parse_data_to_numbers(data.data)
        normalized_data, max_value = normalize_data(parsed_data)
        
        # Calcular estadísticas
        avg_before = calculate_average(parsed_data)
        avg_after = calculate_average(normalized_data)
        data_size = calculate_data_size(parsed_data)
        
        # Crear el registro
        db_data = MedicalImageData(
            id=data.id,
            device_id=device.id,
            average_before_normalization=avg_before,
            average_after_normalization=avg_after,
            data_size=data_size,
            original_data=data.data,
            normalized_data=normalized_data
        )
        
        db.add(db_data)
        db.commit()
        db.refresh(db_data)
        
        logger.info(f"Datos médicos creados con ID: {data.id}")
        return db_data
        
    except Exception as e:
        logger.error(f"Error creando datos médicos: {e}")
        db.rollback()
        raise

def get_medical_image_data(db: Session, data_id: str) -> Optional[MedicalImageData]:
    """
    Obtiene un registro específico por ID
    """
    return db.query(MedicalImageData).filter(MedicalImageData.id == data_id).first()

def get_medical_image_data_list(db: Session, filters: MedicalImageDataFilter, skip: int = 0, limit: int = 100) -> List[MedicalImageData]:
    """
    Obtiene una lista de registros con filtros opcionales
    """
    query = db.query(MedicalImageData)
    
    # Aplicar filtros
    if filters.created_date_start:
        query = query.filter(MedicalImageData.created_date >= filters.created_date_start)
    if filters.created_date_end:
        query = query.filter(MedicalImageData.created_date <= filters.created_date_end)
    if filters.updated_date_start:
        query = query.filter(MedicalImageData.updated_date >= filters.updated_date_start)
    if filters.updated_date_end:
        query = query.filter(MedicalImageData.updated_date <= filters.updated_date_end)
    if filters.average_before_min:
        query = query.filter(MedicalImageData.average_before_normalization >= filters.average_before_min)
    if filters.average_before_max:
        query = query.filter(MedicalImageData.average_before_normalization <= filters.average_before_max)
    if filters.average_after_min:
        query = query.filter(MedicalImageData.average_after_normalization >= filters.average_after_min)
    if filters.average_after_max:
        query = query.filter(MedicalImageData.average_after_normalization <= filters.average_after_max)
    if filters.data_size_min:
        query = query.filter(MedicalImageData.data_size >= filters.data_size_min)
    if filters.data_size_max:
        query = query.filter(MedicalImageData.data_size <= filters.data_size_max)
    
    return query.offset(skip).limit(limit).all()

def update_medical_image_data(db: Session, data_id: str, update_data: MedicalImageDataUpdate) -> Optional[MedicalImageData]:
    """
    Actualiza un registro existente
    """
    try:
        db_data = db.query(MedicalImageData).filter(MedicalImageData.id == data_id).first()
        if not db_data:
            return None
        
        # Actualizar device_name si se proporciona
        if update_data.device_name:
            device = get_or_create_device(db, update_data.device_name)
            db_data.device_id = device.id
        
        # Actualizar ID si se proporciona
        if update_data.id:
            db_data.id = update_data.id
        
        db_data.updated_date = datetime.now()
        db.commit()
        db.refresh(db_data)
        
        logger.info(f"Datos médicos actualizados: {data_id}")
        return db_data
        
    except Exception as e:
        logger.error(f"Error actualizando datos médicos: {e}")
        db.rollback()
        raise

def delete_medical_image_data(db: Session, data_id: str) -> bool:
    """
    Elimina un registro por ID
    """
    try:
        db_data = db.query(MedicalImageData).filter(MedicalImageData.id == data_id).first()
        if not db_data:
            return False
        
        db.delete(db_data)
        db.commit()
        
        logger.info(f"Datos médicos eliminados: {data_id}")
        return True
        
    except Exception as e:
        logger.error(f"Error eliminando datos médicos: {e}")
        db.rollback()
        raise 
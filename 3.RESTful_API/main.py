from fastapi import FastAPI, HTTPException, Depends, Query, Request
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from typing import List, Optional, Dict, Any
from datetime import datetime
import time

from config import get_db, engine
from models import Base
from schemas import (
    MedicalImageDataCreate, 
    MedicalImageDataResponse, 
    MedicalImageDataUpdate,
    MedicalImageDataFilter
)
from crud import (
    create_medical_image_data,
    get_medical_image_data,
    get_medical_image_data_list,
    update_medical_image_data,
    delete_medical_image_data
)
from utils import logger

# Crear las tablas
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Medical Image Processing API",
    description="API REST para manejo de resultados de procesamiento de imágenes médicas",
    version="1.0.0"
)

# Middleware para logging
@app.middleware("http")
async def log_requests(request: Request, call_next):
    start_time = time.time()
    
    # Log de la petición
    logger.info(f"REQUEST: {request.method} {request.url}")
    
    response = await call_next(request)
    
    # Log de la respuesta
    process_time = time.time() - start_time
    logger.info(f"RESPONSE: {response.status_code} - {process_time:.3f}s")
    
    return response

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"ERROR: {str(exc)} - URL: {request.url}")
    return JSONResponse(
        status_code=500,
        content={"detail": "Error interno del servidor"}
    )

@app.get("/")
async def root():
    return {"message": "Medical Image Processing API - Funcionando correctamente"}

@app.post("/api/elements/", response_model=List[MedicalImageDataResponse])
async def create_elements(
    payload: Dict[str, Any],
    db: Session = Depends(get_db)
):
    """
    Crea nuevos elementos a partir del payload JSON
    """
    try:
        results = []
        
        for key, value in payload.items():
            try:
                # Validar y crear el elemento
                element_data = MedicalImageDataCreate(**value)
                db_element = create_medical_image_data(db, element_data)
                results.append(db_element)
                
            except Exception as e:
                logger.error(f"Error procesando elemento {key}: {e}")
                raise HTTPException(
                    status_code=400,
                    detail=f"Error procesando elemento {key}: {str(e)}"
                )
        
        logger.info(f"Elementos creados exitosamente: {len(results)}")
        return results
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error creando elementos: {e}")
        raise HTTPException(status_code=500, detail="Error interno del servidor")

@app.get("/api/elements/", response_model=List[MedicalImageDataResponse])
async def get_elements(
    skip: int = Query(0, ge=0, description="Número de elementos a saltar"),
    limit: int = Query(100, ge=1, le=1000, description="Límite de elementos a devolver"),
    # Filtros de fecha
    created_date_start: Optional[datetime] = Query(None, description="Fecha de creación desde"),
    created_date_end: Optional[datetime] = Query(None, description="Fecha de creación hasta"),
    updated_date_start: Optional[datetime] = Query(None, description="Fecha de actualización desde"),
    updated_date_end: Optional[datetime] = Query(None, description="Fecha de actualización hasta"),
    # Filtros de promedios
    average_before_min: Optional[float] = Query(None, description="Promedio antes mínimo"),
    average_before_max: Optional[float] = Query(None, description="Promedio antes máximo"),
    average_after_min: Optional[float] = Query(None, description="Promedio después mínimo"),
    average_after_max: Optional[float] = Query(None, description="Promedio después máximo"),
    # Filtros de tamaño
    data_size_min: Optional[int] = Query(None, description="Tamaño de datos mínimo"),
    data_size_max: Optional[int] = Query(None, description="Tamaño de datos máximo"),
    db: Session = Depends(get_db)
):
    """
    Obtiene todos los elementos con filtros opcionales
    """
    try:
        filters = MedicalImageDataFilter(
            created_date_start=created_date_start,
            created_date_end=created_date_end,
            updated_date_start=updated_date_start,
            updated_date_end=updated_date_end,
            average_before_min=average_before_min,
            average_before_max=average_before_max,
            average_after_min=average_after_min,
            average_after_max=average_after_max,
            data_size_min=data_size_min,
            data_size_max=data_size_max
        )
        
        elements = get_medical_image_data_list(db, filters, skip, limit)
        logger.info(f"Elementos obtenidos: {len(elements)}")
        return elements
        
    except Exception as e:
        logger.error(f"Error obteniendo elementos: {e}")
        raise HTTPException(status_code=500, detail="Error interno del servidor")

@app.get("/api/elements/{element_id}", response_model=MedicalImageDataResponse)
async def get_element(element_id: str, db: Session = Depends(get_db)):
    """
    Obtiene un elemento específico por ID
    """
    try:
        element = get_medical_image_data(db, element_id)
        if not element:
            raise HTTPException(
                status_code=404,
                detail=f"Elemento con ID {element_id} no encontrado"
            )
        
        logger.info(f"Elemento obtenido: {element_id}")
        return element
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error obteniendo elemento {element_id}: {e}")
        raise HTTPException(status_code=500, detail="Error interno del servidor")

@app.put("/api/elements/{element_id}", response_model=MedicalImageDataResponse)
async def update_element(
    element_id: str,
    update_data: MedicalImageDataUpdate,
    db: Session = Depends(get_db)
):
    """
    Actualiza un elemento existente
    """
    try:
        element = update_medical_image_data(db, element_id, update_data)
        if not element:
            raise HTTPException(
                status_code=404,
                detail=f"Elemento con ID {element_id} no encontrado"
            )
        
        logger.info(f"Elemento actualizado: {element_id}")
        return element
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error actualizando elemento {element_id}: {e}")
        raise HTTPException(status_code=500, detail="Error interno del servidor")


@app.delete("/api/elements/{element_id}")
async def delete_element(element_id: str, db: Session = Depends(get_db)):
    """
    Elimina un elemento por ID
    """
    try:
        deleted = delete_medical_image_data(db, element_id)
        if not deleted:
            raise HTTPException(
                status_code=404,
                detail=f"Elemento con ID {element_id} no encontrado"
            )
        
        logger.info(f"Elemento eliminado: {element_id}")
        return {"message": f"Elemento {element_id} eliminado exitosamente"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error eliminando elemento {element_id}: {e}")
        raise HTTPException(status_code=500, detail="Error interno del servidor")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 
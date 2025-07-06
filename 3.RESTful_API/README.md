# API REST - Procesamiento de Imágenes Médicas

API REST que realiza operaciones CRUD para manejo de resultados de procesamiento de imágenes médicas con validación, normalización y almacenamiento en PostgreSQL.

## Inicio Rápido

### Con Docker (Recomendado)
```bash
docker-compose up -d
curl http://localhost:8000/
python3 run_demo.py
```

### Manual
```bash
pip install -r requirements.txt
uvicorn main:app --reload
```

## Endpoints

- `POST /api/elements/` - Crear elementos
- `GET /api/elements/` - Obtener todos con filtros
- `GET /api/elements/{id}` - Obtener elemento específico
- `PUT /api/elements/{id}` - Actualizar elemento
- `DELETE /api/elements/{id}` - Eliminar elemento

## Ejemplo de Uso

### Crear elementos
```bash
curl -X POST "http://localhost:8000/api/elements/" \
  -H "Content-Type: application/json" \
  -d @sample_data.json
```

### Obtener elementos
```bash
curl "http://localhost:8000/api/elements/"
```

### Filtros
```bash
curl "http://localhost:8000/api/elements/?average_before_min=50&average_before_max=70"
```


## Estructura de Datos

### Entrada
```json
{
  "1": {
    "id": "aabbcc1",
    "data": ["78 83 21 68 96", "58 75 71 69 33"],
    "deviceName": "CT SCAN"
  }
}
```

### Respuesta
```json
{
  "id": "aabbcc1",
  "average_before_normalization": 65.2,
  "average_after_normalization": 0.679,
  "data_size": 10,
  "normalized_data": [[0.812, 0.864, 0.219, 0.708, 1.0], [0.604, 0.781, 0.740, 0.719, 0.344]],
  "device": {"id": 1, "device_name": "CT SCAN"}
}
```

## Pruebas

```bash
# Pruebas automáticas
python3 test_api.py
```

## Documentación
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

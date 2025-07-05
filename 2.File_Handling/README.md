# FileProcessor - Procesador de Archivos CSV y DICOM

## Descripción

`FileProcessor` es una clase Python diseñada para procesar y analizar archivos CSV y DICOM con logging automático de errores. Esta herramienta permite extraer información, generar reportes y procesar imágenes médicas de manera eficiente.

## Características Principales

- Análisis de archivos CSV: Estadísticas descriptivas de columnas numéricas y no numéricas
- Procesamiento de archivos DICOM: Extracción de metadatos e imágenes médicas
- Listado de directorios: Exploración de contenido con detalles de archivos
- Generación de reportes: Creación automática de reportes de análisis
- Logging automático: Registro de errores y operaciones en archivos de log
- Extracción de imágenes**: Conversión de imágenes DICOM a formato PNG

## Instalación de Dependencias

Antes de usar el script, necesitas instalar las dependencias requeridas:

```bash
# Instalar dependencias principales
pip3 install --user --break-system-packages pandas numpy pydicom pillow

# Alternativamente, si tienes permisos de administrador:
pip3 install pandas numpy pydicom pillow
```

### Dependencias Requeridas

- **pandas**: Procesamiento y análisis de datos CSV
- **numpy**: Operaciones matemáticas y arrays
- **pydicom**: Lectura y procesamiento de archivos DICOM
- **pillow**: Procesamiento y conversión de imágenes

## Uso Básico

### Ejecución del Script de Ejemplo

```bash
# Navegar al directorio del proyecto
cd prueba_tecnica/2.File_Handling
# Ejecutar el script con ejemplos predefinidos
python3 file_processor.py
```

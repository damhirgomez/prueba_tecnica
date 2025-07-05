import os
import logging
import csv
from datetime import datetime
from typing import List, Tuple, Optional
import pandas as pd
import numpy as np
import pydicom
from PIL import Image
from pathlib import Path

class FileProcessor:
    """
    Clase para procesar archivos CSV y DICOM con logging de errores.
    Esta clase permite analizar archivos, listar contenido de carpetas y extraer información.
    """
    
    def __init__(self, base_path: str, log_file: str = "file_processor.log"):
        """
        Inicializa el procesador de archivos.
        
        Args:
            base_path (str): Ruta base donde están los archivos
            log_file (str): Nombre del archivo donde se guardarán los logs
        """
        # Guardamos la ruta base donde están nuestros archivos
        self.base_path = Path(base_path)
        
        # Configuramos el sistema de logging para registrar errores
        logging.basicConfig(
            level=logging.INFO,
            format='%(asctime)s - %(levelname)s - %(message)s',
            handlers=[
                logging.FileHandler(log_file),
                logging.StreamHandler()  # También muestra en consola
            ]
        )
        self.logger = logging.getLogger(__name__)
        
        # Creamos la carpeta base si no existe
        self.base_path.mkdir(parents=True, exist_ok=True)
        
        print(f"FileProcessor iniciado con ruta base: {self.base_path}")
        
    def list_folder_contents(self, folder_name: str, details: bool = False) -> None:
      """
      Lista el contenido de una carpeta específica.
      
      Args:
          folder_name (str): Nombre de la carpeta a listar
          details (bool): Si True, muestra detalles adicionales como tamaño y fecha
      """
      try:
        # Construimos la ruta completa de la carpeta
        folder_path = self.base_path / folder_name
        
        # Verificamos si la carpeta existe
        if not folder_path.exists():
          error_msg = f"La carpeta '{folder_path}' no existe"
          self.logger.error(error_msg)
          print(f"ERROR: {error_msg}")
          return
        
        # Obtenemos todos los elementos en la carpeta
        items = list(folder_path.iterdir())
        
        # Separamos archivos y carpetas
        files = [item for item in items if item.is_file()]
        folders = [item for item in items if item.is_dir()]
        
        # Mostramos el resumen
        print(f"\nCarpeta: {folder_path}")
        print(f"Número de elementos: {len(items)}")
        
        # Mostramos archivos
        if files:
          print("Archivos:")
          for file in files:
            if details:
              # Obtenemos el tamaño en MB
              size_mb = file.stat().st_size / (1024 * 1024)
              # Obtenemos la fecha de modificación
              mod_time = datetime.fromtimestamp(file.stat().st_mtime)
              print(f" - {file.name} ({size_mb:.2f} MB, Modificado: {mod_time.strftime('%Y-%m-%d %H:%M:%S')})")
            else:
              print(f" - {file.name}")
        
        # Mostramos carpetas
        if folders:
          print("Carpetas:")
          for folder in folders:
            if details:
              mod_time = datetime.fromtimestamp(folder.stat().st_mtime)
              print(f" - {folder.name} (Modificado: {mod_time.strftime('%Y-%m-%d %H:%M:%S')})")
            else:
              print(f" - {folder.name}")         
      except Exception as e:
        error_msg = f"Error al listar contenido de carpeta: {str(e)}"
        self.logger.error(error_msg)
        print(f"ERROR: {error_msg}")
    
    def read_csv(self, filename: str, report_path: Optional[str] = None, summary: bool = False) -> None:
        """
        Lee y analiza un archivo CSV.
        
        Args:
            filename (str): Nombre del archivo CSV
            report_path (str, optional): Ruta donde guardar el reporte
            summary (bool): Si True, muestra resumen de columnas no numéricas
        """
        try:
            # Construimos la ruta completa del archivo
            file_path = self.base_path / filename
            
            # Verificamos si el archivo existe
            if not file_path.exists():
                error_msg = f"El archivo '{file_path}' no existe"
                self.logger.error(error_msg)
                print(f"ERROR: {error_msg}")
                return
            
            # Verificamos que sea un archivo CSV
            if not file_path.suffix.lower() == '.csv':
                error_msg = f"El archivo '{filename}' no es un archivo CSV válido"
                self.logger.error(error_msg)
                print(f"ERROR: {error_msg}")
                return
            
            # Leemos el archivo CSV usando pandas
            df = pd.read_csv(file_path)
            
            print(f"\nAnálisis CSV: {filename}")
            print(f"Columnas: {list(df.columns)}")
            print(f"Filas: {len(df)}")
            
            # Analizamos columnas numéricas
            numeric_cols = df.select_dtypes(include=[np.number]).columns
            if len(numeric_cols) > 0:
                print("Columnas Numéricas:")
                analysis_data = {}
                
                for col in numeric_cols:
                    avg = df[col].mean()
                    std = df[col].std()
                    print(f" - {col}: Promedio = {avg:.2f}, Desviación Estándar = {std:.2f}")
                    analysis_data[col] = {'average': avg, 'std_dev': std}
                
                # Guardamos el reporte si se especifica una ruta
                if report_path:
                    report_dir = Path(report_path)
                    report_dir.mkdir(parents=True, exist_ok=True)
                    
                    report_file = report_dir / f"{filename}_analysis.txt"
                    with open(report_file, 'w', encoding='utf-8') as f:
                        f.write(f"Análisis de {filename}\n")
                        f.write("=" * 50 + "\n")
                        f.write(f"Filas: {len(df)}\n")
                        f.write(f"Columnas: {len(df.columns)}\n\n")
                        f.write("Análisis de Columnas Numéricas:\n")
                        for col, data in analysis_data.items():
                            f.write(f"{col}: Promedio = {data['average']:.2f}, Desviación Estándar = {data['std_dev']:.2f}\n")
                    
                    print(f"Reporte guardado en: {report_file}")
            
            # Mostramos resumen de columnas no numéricas si se solicita
            if summary:
                non_numeric_cols = df.select_dtypes(exclude=[np.number]).columns
                if len(non_numeric_cols) > 0:
                    print("Resumen de Columnas No Numéricas:")
                    for col in non_numeric_cols:
                        unique_values = df[col].nunique()
                        value_counts = df[col].value_counts()
                        print(f" - {col}: Valores únicos = {unique_values}")
                        print(f"   Frecuencias: {dict(value_counts.head(5))}")  # Mostramos los 5 más frecuentes
                        
        except Exception as e:
            error_msg = f"Error al leer archivo CSV: {str(e)}"
            self.logger.error(error_msg)
            print(f"ERROR: {error_msg}")
    
    def read_dicom(self, filename: str, tags: Optional[List[Tuple[int, int]]] = None, extract_image: bool = False) -> None:
        """
        Lee y analiza un archivo DICOM.
        
        Args:
            filename (str): Nombre del archivo DICOM
            tags (List[Tuple[int, int]], optional): Lista de tags DICOM a extraer
            extract_image (bool): Si True, extrae y guarda la imagen como PNG
        """
        try:
            
            # Construimos la ruta completa del archivo
            file_path = self.base_path / filename
            
            # Verificamos si el archivo existe
            if not file_path.exists():
                error_msg = f"El archivo '{file_path}' no existe"
                self.logger.error(error_msg)
                print(f"ERROR: {error_msg}")
                return
            
            # Leemos el archivo DICOM
            ds = pydicom.dcmread(file_path)
            
            print(f"\nAnálisis DICOM: {filename}")
            
            # Mostramos información básica del paciente
            try:
                patient_name = ds.PatientName if hasattr(ds, 'PatientName') else "No disponible"
                print(f"Nombre del Paciente: {patient_name}")
            except:
                print("Nombre del Paciente: No disponible")
            
            try:
                study_date = ds.StudyDate if hasattr(ds, 'StudyDate') else "No disponible"
                print(f"Fecha del Estudio: {study_date}")
            except:
                print("Fecha del Estudio: No disponible")
            
            try:
                modality = ds.Modality if hasattr(ds, 'Modality') else "No disponible"
                print(f"Modalidad: {modality}")
            except:
                print("Modalidad: No disponible")
            
            # Mostramos tags específicos si se proporcionan
            if tags:
                print("Tags específicos:")
                for tag in tags:
                    try:
                        tag_value = ds[tag].value
                        print(f"Tag {hex(tag[0])}, {hex(tag[1])}: {tag_value}")
                    except KeyError:
                        print(f"Tag {hex(tag[0])}, {hex(tag[1])}: No encontrado")
                    except Exception as e:
                        print(f"Tag {hex(tag[0])}, {hex(tag[1])}: Error al leer - {str(e)}")
            
            # Extraemos la imagen si se solicita
            if extract_image:
                try:
                    # Verificamos si el archivo tiene datos de imagen
                    if hasattr(ds, 'pixel_array'):
                        pixel_array = ds.pixel_array
                        
                        # Manejamos diferentes tipos de arrays de píxeles
                        if len(pixel_array.shape) > 2:
                            # Si es un array 3D, tomamos el primer slice
                            pixel_array = pixel_array[0] if pixel_array.shape[0] == 1 else pixel_array[:, :, 0]
                        
                        # Normalizamos la imagen para guardar como PNG
                        if pixel_array.dtype != np.uint8:
                            # Convertimos a rango 0-255
                            pixel_array = ((pixel_array - pixel_array.min()) / 
                                         (pixel_array.max() - pixel_array.min()) * 255).astype(np.uint8)
                        
                        # Creamos la imagen
                        image = Image.fromarray(pixel_array)
                        
                        # Guardamos la imagen
                        image_path = self.base_path / f"{filename.rsplit('.', 1)[0]}.png"
                        image.save(image_path)
                        print(f"Imagen extraída y guardada en: {image_path}")
                    else:
                        print("El archivo DICOM no contiene datos de imagen")
                        
                except Exception as e:
                    error_msg = f"Error al extraer imagen: {str(e)}"
                    self.logger.error(error_msg)
                    print(f"ERROR: {error_msg}")
                    
        except Exception as e:
            error_msg = f"Error al leer archivo DICOM: {str(e)}"
            self.logger.error(error_msg)
            print(f"ERROR: {error_msg}")

# Ejemplo de uso de la clase
if __name__ == "__main__":
    # Creamos una instancia del procesador
    processor = FileProcessor(base_path=".", log_file="file_processor.log")
    
    print("=== EJEMPLO DE USO DE FileProcessor ===")
    
    # Ejemplo 1: Listamos el contenido de la carpeta actual
    print("\n1. Listando contenido de la carpeta actual:")
    processor.list_folder_contents(".", details=True)
    
    # Ejemplo 2: Analizamos el archivo CSV
    print("\n2. Analizando archivo CSV:")
    processor.read_csv("sample-02-csv.csv", report_path="reports", summary=True)
    
    # Ejemplo 3: Analizamos el archivo DICOM
    print("\n3. Analizando archivo DICOM:")
    processor.read_dicom(
        "sample-02-dicom-2.dcm",
        tags=[(0x0010, 0x0010)],  # PatientName, Modality
        extract_image=True
    )
    
    print("\n=== FIN DEL EJEMPLO ===") 
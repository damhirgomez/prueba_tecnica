from typing import List, Tuple
import logging

# Configurar logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('api.log'),
        logging.StreamHandler()
    ]
)

logger = logging.getLogger(__name__)

def parse_data_to_numbers(data: List[str]) -> List[List[float]]:
    """
    Convierte los strings de datos a listas de números
    """
    try:
        result = []
        for row in data:
            numbers = [float(num) for num in row.split()]
            result.append(numbers)
        return result
    except Exception as e:
        logger.error(f"Error parsing data: {e}")
        raise ValueError(f"Error al parsear los datos: {e}")

def normalize_data(data: List[List[float]]) -> Tuple[List[List[float]], float]:
    """
    Normaliza los datos de 0 a 1 usando el valor máximo
    Retorna los datos normalizados y el valor de normalización
    """
    try:
        # Encontrar el valor máximo en todos los datos
        max_value = 0
        for row in data:
            for value in row:
                max_value = max(max_value, value)
        
        if max_value == 0:
            logger.warning("El valor máximo es 0, no se puede normalizar")
            return data, 0
        
        # Normalizar todos los valores
        normalized_data = []
        for row in data:
            normalized_row = [value / max_value for value in row]
            normalized_data.append(normalized_row)
        
        return normalized_data, max_value
    except Exception as e:
        logger.error(f"Error normalizing data: {e}")
        raise ValueError(f"Error al normalizar los datos: {e}")

def calculate_average(data: List[List[float]]) -> float:
    """
    Calcula el promedio de todos los valores en los datos
    """
    try:
        total_sum = 0
        total_count = 0
        
        for row in data:
            for value in row:
                total_sum += value
                total_count += 1
        
        if total_count == 0:
            return 0
        
        return total_sum / total_count
    except Exception as e:
        logger.error(f"Error calculating average: {e}")
        raise ValueError(f"Error al calcular el promedio: {e}")

def calculate_data_size(data: List[List[float]]) -> int:
    """
    Calcula el tamaño total de los datos
    """
    try:
        total_size = 0
        for row in data:
            total_size += len(row)
        return total_size
    except Exception as e:
        logger.error(f"Error calculating data size: {e}")
        raise ValueError(f"Error al calcular el tamaño de los datos: {e}") 
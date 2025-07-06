#!/usr/bin/env python3
"""
Script para probar la API REST de procesamiento de imágenes médicas
"""

import requests
import json
import time
from datetime import datetime

# Configuración
API_BASE_URL = "http://localhost:8000"
SAMPLE_DATA_FILE = "sample_data.json"

def load_sample_data():
    """Carga los datos de ejemplo"""
    try:
        with open(SAMPLE_DATA_FILE, 'r') as f:
            return json.load(f)
    except FileNotFoundError:
        print(f"❌ Error: No se encontró el archivo {SAMPLE_DATA_FILE}")
        return None

def test_api_health():
    """Prueba si la API está funcionando"""
    try:
        response = requests.get(f"{API_BASE_URL}/")
        if response.status_code == 200:
            print("✅ API funcionando correctamente")
            return True
        else:
            print(f"❌ API no responde correctamente: {response.status_code}")
            return False
    except requests.exceptions.ConnectionError:
        print("❌ Error: No se puede conectar a la API. ¿Está ejecutándose?")
        return False

def test_create_elements():
    """Prueba crear elementos"""
    print("\n🔄 Probando creación de elementos...")
    
    sample_data = load_sample_data()
    if not sample_data:
        return False
    
    try:
        response = requests.post(
            f"{API_BASE_URL}/api/elements/",
            json=sample_data,
            headers={"Content-Type": "application/json"}
        )
        
        if response.status_code == 200:
            print("✅ Elementos creados exitosamente")
            data = response.json()
            print(f"   - Se crearon {len(data)} elementos")
            for item in data:
                print(f"   - ID: {item['id']}, Dispositivo: {item['device']['device_name']}")
            return True
        else:
            print(f"❌ Error creando elementos: {response.status_code}")
            print(f"   Respuesta: {response.text}")
            return False
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def test_get_elements():
    """Prueba obtener todos los elementos"""
    print("\n🔄 Probando obtención de elementos...")
    
    try:
        response = requests.get(f"{API_BASE_URL}/api/elements/")
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Se obtuvieron {len(data)} elementos")
            for item in data:
                print(f"   - ID: {item['id']}, Promedio antes: {item['average_before_normalization']:.2f}, Promedio después: {item['average_after_normalization']:.2f}")
            return True
        else:
            print(f"❌ Error obteniendo elementos: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def test_get_single_element():
    """Prueba obtener un elemento específico"""
    print("\n🔄 Probando obtención de elemento específico...")
    
    element_id = "aabbcc1"
    
    try:
        response = requests.get(f"{API_BASE_URL}/api/elements/{element_id}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Elemento obtenido: {data['id']}")
            print(f"   - Dispositivo: {data['device']['device_name']}")
            print(f"   - Tamaño de datos: {data['data_size']}")
            print(f"   - Promedio antes: {data['average_before_normalization']:.2f}")
            print(f"   - Promedio después: {data['average_after_normalization']:.2f}")
            return True
        else:
            print(f"❌ Error obteniendo elemento {element_id}: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def test_update_element():
    """Prueba actualizar un elemento"""
    print("\n🔄 Probando actualización de elemento...")
    
    element_id = "aabbcc1"
    update_data = {
        "device_name": "CT SCAN UPDATED"
    }
    
    try:
        response = requests.put(
            f"{API_BASE_URL}/api/elements/{element_id}",
            json=update_data,
            headers={"Content-Type": "application/json"}
        )
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Elemento actualizado: {data['id']}")
            print(f"   - Nuevo nombre dispositivo: {data['device']['device_name']}")
            return True
        else:
            print(f"❌ Error actualizando elemento {element_id}: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def test_filters():
    """Prueba los filtros de la API"""
    print("\n🔄 Probando filtros...")
    
    try:
        # Filtro por promedio antes de normalización
        response = requests.get(f"{API_BASE_URL}/api/elements/?average_before_min=50&average_before_max=70")
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Filtro aplicado: {len(data)} elementos con promedio entre 50 y 70")
            return True
        else:
            print(f"❌ Error aplicando filtros: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def test_delete_element():
    """Prueba eliminar un elemento"""
    print("\n🔄 Probando eliminación de elemento...")
    
    element_id = "aabbcc2"
    
    try:
        response = requests.delete(f"{API_BASE_URL}/api/elements/{element_id}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Elemento eliminado: {element_id}")
            print(f"   - Mensaje: {data['message']}")
            return True
        else:
            print(f"❌ Error eliminando elemento {element_id}: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def main():
    """Función principal para ejecutar todas las pruebas"""
    print("🧪 Iniciando pruebas de la API REST de Procesamiento de Imágenes Médicas")
    print("=" * 70)
    
    # Verificar que la API esté funcionando
    if not test_api_health():
        print("\n❌ La API no está funcionando. Asegúrate de que esté ejecutándose en localhost:8000")
        return
    
    # Ejecutar pruebas
    tests = [
        test_create_elements,
        test_get_elements,
        test_get_single_element,
        test_update_element,
        test_filters,
        test_delete_element
    ]
    
    passed = 0
    total = len(tests)
    
    for test in tests:
        if test():
            passed += 1
        time.sleep(0.5)  # Pequeña pausa entre pruebas
    
    print("\n" + "=" * 70)
    print(f"🏁 Pruebas completadas: {passed}/{total} exitosas")
    
    if passed == total:
        print("🎉 ¡Todas las pruebas pasaron! La API está funcionando correctamente.")
    else:
        print("⚠️  Algunas pruebas fallaron. Revisa los errores anteriores.")

if __name__ == "__main__":
    main() 
#!/usr/bin/env python3
"""
Script de configuración inicial para la API REST de Procesamiento de Imágenes Médicas
"""

import os
import subprocess
import sys

def create_env_file():
    """Crea el archivo .env si no existe"""
    env_content = """DATABASE_URL=postgresql://user:password@localhost:5432/medical_imaging_db
SECRET_KEY=your-secret-key-here-change-in-production
DEBUG=True
"""
    
    if not os.path.exists('.env'):
        with open('.env', 'w') as f:
            f.write(env_content)
        print("✅ Archivo .env creado")
    else:
        print("ℹ️  El archivo .env ya existe")

def install_dependencies():
    """Instala las dependencias de Python"""
    print("📦 Instalando dependencias...")
    try:
        subprocess.run([sys.executable, "-m", "pip", "install", "-r", "requirements.txt"], 
                      check=True, capture_output=True, text=True)
        print("✅ Dependencias instaladas correctamente")
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ Error instalando dependencias: {e}")
        return False

def check_docker():
    """Verifica si Docker está disponible"""
    try:
        result = subprocess.run(["docker", "--version"], 
                              capture_output=True, text=True, check=True)
        print(f"✅ Docker disponible: {result.stdout.strip()}")
        return True
    except (subprocess.CalledProcessError, FileNotFoundError):
        print("⚠️  Docker no está disponible")
        return False

def check_postgres():
    """Verifica la conectividad a PostgreSQL"""
    try:
        import psycopg2
        from dotenv import load_dotenv
        
        load_dotenv()
        
        # Intentar conectar a PostgreSQL
        conn = psycopg2.connect(
            host="localhost",
            database="medical_imaging_db",
            user="user",
            password="password"
        )
        conn.close()
        print("✅ Conexión a PostgreSQL exitosa")
        return True
    except Exception as e:
        print(f"⚠️  No se pudo conectar a PostgreSQL: {e}")
        print("   Usa Docker Compose para levantar la base de datos")
        return False

def main():
    """Función principal de configuración"""
    print("🔧 Configurando API REST de Procesamiento de Imágenes Médicas")
    print("=" * 60)
    
    # Crear archivo .env
    create_env_file()
    
    # Instalar dependencias
    if not install_dependencies():
        print("❌ Error en la instalación. Abortando.")
        return
    
    # Verificar Docker
    docker_available = check_docker()
    
    # Verificar PostgreSQL
    postgres_available = check_postgres()
    
    print("\n" + "=" * 60)
    print("🚀 Opciones para ejecutar la API:")
    
    if docker_available:
        print("\n📦 Opción 1: Con Docker (Recomendado)")
        print("   docker-compose up -d")
        print("   python test_api.py")
    
    if postgres_available:
        print("\n🐍 Opción 2: Con instalación local")
        print("   uvicorn main:app --host 0.0.0.0 --port 8000 --reload")
        print("   python test_api.py")
    
    print("\n📖 Documentación:")
    print("   - Swagger UI: http://localhost:8000/docs")
    print("   - ReDoc: http://localhost:8000/redoc")
    print("   - Archivo README.md para más detalles")
    
    print("\n🎯 ¡Configuración completada!")

if __name__ == "__main__":
    main() 
# Calculadora de Área de Manchas

Una aplicación web Angular que calcula el área de manchas en imágenes binarias utilizando el método Monte Carlo.

## 🎯 ¿Qué hace la aplicación?

Esta aplicación te permite:
- **Subir una imagen binaria** (con píxeles blancos representando la mancha y píxeles negros el fondo)
- **Calcular automáticamente el área** de la mancha usando el método Monte Carlo
- **Visualizar el proceso** con puntos aleatorios superpuestos en la imagen
- **Consultar un historial** de todos los cálculos realizados
- **Aprender sobre la metodología** paso a paso

### Método Monte Carlo
El algoritmo genera puntos aleatorios sobre la imagen y cuenta cuántos caen dentro de la mancha (píxeles blancos). La fórmula es:

```
Área de la Mancha = (Área Total de la Imagen) × (puntos_dentro / puntos_totales)
```

## 🚀 Cómo poner a funcionar la aplicación

### Requisitos previos
- **Node.js** versión 18 o superior
- **npm** (se instala con Node.js)

### Instalación paso a paso

1. **Navega al directorio del proyecto:**
```bash
cd prueba_tecnica/4.Angular_App
```

2. **Instala las dependencias:**
```bash
npm install --legacy-peer-deps
```
> **Nota:** Se usa `--legacy-peer-deps` para resolver conflictos de versiones entre RxJS y PrimeNG

3. **Ejecuta la aplicación:**
```bash
npm start
```
> **Alternativa:** `npx ng serve`

4. **Abre tu navegador** y ve a:
```
http://localhost:4200
```

¡La aplicación debería cargar y mostrar las tres pestañas principales!

## 📱 Cómo usar la aplicación

### Pestaña "Calculadora"
1. **Subir imagen:** Haz clic en "Seleccionar Imagen" y sube una imagen binaria
2. **Configurar puntos:** Ajusta el número de puntos aleatorios (100-10,000) con el slider
3. **Calcular:** Haz clic en "Calcular Área" para obtener el resultado

### Pestaña "Resultados"
- Ve el historial completo de cálculos
- Estadísticas agregadas
- Opción para eliminar resultados

### Pestaña "Metodología"
- Explicación paso a paso del método Monte Carlo
- Carrusel interactivo con la teoría

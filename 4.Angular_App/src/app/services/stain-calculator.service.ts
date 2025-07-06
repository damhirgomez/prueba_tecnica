import { Injectable, signal, computed } from "@angular/core";
import { BehaviorSubject, Observable } from "rxjs";
import {
  Point,
  CalculationResult,
  ImageData,
} from "../interfaces/calculation.interface";

@Injectable({
  providedIn: "root",
})
export class StainCalculatorService {
  // Signals para el estado reactivo
  private _currentImage = signal<ImageData | null>(null);
  private _randomPointsCount = signal<number>(1000);
  private _isCalculating = signal<boolean>(false);
  private _calculationResults = signal<CalculationResult[]>([]);

  // Observables para compatibilidad
  private _calculationResults$ = new BehaviorSubject<CalculationResult[]>([]);

  // Getters públicos para los signals
  readonly currentImage = this._currentImage.asReadonly();
  readonly randomPointsCount = this._randomPointsCount.asReadonly();
  readonly isCalculating = this._isCalculating.asReadonly();
  readonly calculationResults = this._calculationResults.asReadonly();

  // Computed signals
  readonly hasImage = computed(() => this._currentImage() !== null);
  readonly canCalculate = computed(
    () => this.hasImage() && !this.isCalculating()
  );

  // Observable para compatibilidad
  readonly calculationResults$ = this._calculationResults$.asObservable();

  constructor() {
    // Cargar resultados guardados del localStorage
    this.loadSavedResults();
  }

  /**
   * Procesa una imagen subida y extrae sus dimensiones
   */
  async processImage(file: File): Promise<ImageData> {
    return new Promise((resolve, reject) => {
      if (!file.type.startsWith("image/")) {
        reject(new Error("El archivo debe ser una imagen"));
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const imageData: ImageData = {
            file,
            url: e.target?.result as string,
            width: img.width,
            height: img.height,
          };

          this._currentImage.set(imageData);
          resolve(imageData);
        };
        img.onerror = () => reject(new Error("Error al cargar la imagen"));
        img.src = e.target?.result as string;
      };
      reader.onerror = () => reject(new Error("Error al leer el archivo"));
      reader.readAsDataURL(file);
    });
  }

  /**
   * Actualiza el número de puntos aleatorios
   */
  setRandomPointsCount(count: number): void {
    this._randomPointsCount.set(count);
  }

  /**
   * Genera puntos aleatorios dentro de las dimensiones de la imagen
   */
  generateRandomPoints(width: number, height: number, count: number): Point[] {
    const points: Point[] = [];
    for (let i = 0; i < count; i++) {
      points.push({
        x: Math.random() * width,
        y: Math.random() * height,
      });
    }
    return points;
  }

  /**
   * Determina si un punto está dentro de la mancha (píxel blanco)
   */
  isPointInsideStain(canvas: HTMLCanvasElement, point: Point): boolean {
    const ctx = canvas.getContext("2d");
    if (!ctx) return false;

    const imageData = ctx.getImageData(point.x, point.y, 1, 1);
    const [r, g, b] = imageData.data;

    // Considera que un píxel es blanco si sus valores RGB son altos
    const threshold = 128;
    return r > threshold && g > threshold && b > threshold;
  }

  /**
   * Calcula el área de la mancha usando el método Monte Carlo
   */
  async calculateStainArea(
    canvas: HTMLCanvasElement
  ): Promise<CalculationResult> {
    const image = this._currentImage();
    if (!image) {
      throw new Error("No hay imagen cargada");
    }

    this._isCalculating.set(true);

    try {
      // Generar puntos aleatorios
      const randomPoints = this.generateRandomPoints(
        image.width,
        image.height,
        this._randomPointsCount()
      );

      // Determinar qué puntos están dentro de la mancha
      const pointsInsideStain: Point[] = [];

      for (const point of randomPoints) {
        if (this.isPointInsideStain(canvas, point)) {
          pointsInsideStain.push(point);
        }
      }

      // Calcular el área estimada
      const totalImageArea = image.width * image.height;
      const pointsInsideCount = pointsInsideStain.length;
      const estimatedStainArea =
        totalImageArea * (pointsInsideCount / randomPoints.length);

      // Crear resultado
      const result: CalculationResult = {
        id: this.generateId(),
        imageName: image.file.name,
        imageWidth: image.width,
        imageHeight: image.height,
        totalImageArea,
        totalRandomPoints: randomPoints.length,
        pointsInsideStain: pointsInsideCount,
        estimatedStainArea,
        calculationDate: new Date(),
        randomPoints,
        pointsInsideStainList: pointsInsideStain,
      };

      // Agregar resultado a la lista
      this.addCalculationResult(result);

      return result;
    } finally {
      this._isCalculating.set(false);
    }
  }

  /**
   * Agrega un resultado de cálculo a la lista
   */
  private addCalculationResult(result: CalculationResult): void {
    const currentResults = this._calculationResults();
    const updatedResults = [result, ...currentResults];
    this._calculationResults.set(updatedResults);
    this._calculationResults$.next(updatedResults);
    this.saveResults();
  }

  /**
   * Elimina un resultado de cálculo
   */
  removeCalculationResult(id: string): void {
    const currentResults = this._calculationResults();
    const updatedResults = currentResults.filter((result) => result.id !== id);
    this._calculationResults.set(updatedResults);
    this._calculationResults$.next(updatedResults);
    this.saveResults();
  }

  /**
   * Limpia todos los resultados
   */
  clearAllResults(): void {
    this._calculationResults.set([]);
    this._calculationResults$.next([]);
    this.saveResults();
  }

  /**
   * Guarda los resultados en localStorage
   */
  private saveResults(): void {
    try {
      const results = this._calculationResults().map((result) => ({
        ...result,
        // No guardamos los puntos para ahorrar espacio
        randomPoints: [],
        pointsInsideStainList: [],
      }));
      localStorage.setItem(
        "stain-calculation-results",
        JSON.stringify(results)
      );
    } catch (error) {
      console.error("Error al guardar resultados:", error);
    }
  }

  /**
   * Carga los resultados guardados
   */
  private loadSavedResults(): void {
    try {
      const saved = localStorage.getItem("stain-calculation-results");
      if (saved) {
        const results = JSON.parse(saved).map((result: any) => ({
          ...result,
          calculationDate: new Date(result.calculationDate),
        }));
        this._calculationResults.set(results);
        this._calculationResults$.next(results);
      }
    } catch (error) {
      console.error("Error al cargar resultados:", error);
    }
  }

  /**
   * Genera un ID único
   */
  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  /**
   * Resetea la imagen actual
   */
  resetImage(): void {
    this._currentImage.set(null);
  }
}

import { Injectable, signal } from "@angular/core";
import { MethodologyStep } from "../interfaces/calculation.interface";

@Injectable({
  providedIn: "root",
})
export class MethodologyService {
  private _steps = signal<MethodologyStep[]>([
    {
      id: 1,
      title: "Subir Imagen Binaria",
      description:
        "Sube una imagen binaria donde los píxeles blancos representan la mancha y los píxeles negros representan el fondo. La imagen debe estar en formato PNG, JPG o similar.",
      icon: "pi pi-upload",
    },
    {
      id: 2,
      title: "Generar Puntos Aleatorios",
      description:
        "El sistema genera n puntos aleatorios dentro de las dimensiones de la imagen. Puedes ajustar la cantidad de puntos usando el control deslizante para mayor precisión.",
      icon: "pi pi-scatter-chart",
    },
    {
      id: 3,
      title: "Contar Puntos en la Mancha",
      description:
        'Se cuenta cuántos de los puntos aleatorios caen dentro de la mancha (píxeles blancos). Estos puntos se identifican como "ni".',
      icon: "pi pi-calculator",
    },
    {
      id: 4,
      title: "Calcular Área Estimada",
      description:
        "Se estima el área de la mancha usando la fórmula: Área = (Área Total de la Imagen) × (ni/n), donde ni es el número de puntos dentro de la mancha y n es el total de puntos.",
      icon: "pi pi-chart-pie",
    },
  ]);

  private _currentStep = signal<number>(0);

  readonly steps = this._steps.asReadonly();
  readonly currentStep = this._currentStep.asReadonly();

  constructor() {}

  /**
   * Avanza al siguiente paso
   */
  nextStep(): void {
    const current = this._currentStep();
    const maxStep = this._steps().length - 1;
    if (current < maxStep) {
      this._currentStep.set(current + 1);
    }
  }

  /**
   * Retrocede al paso anterior
   */
  previousStep(): void {
    const current = this._currentStep();
    if (current > 0) {
      this._currentStep.set(current - 1);
    }
  }

  /**
   * Va a un paso específico
   */
  goToStep(step: number): void {
    const maxStep = this._steps().length - 1;
    if (step >= 0 && step <= maxStep) {
      this._currentStep.set(step);
    }
  }

  /**
   * Resetea al primer paso
   */
  resetSteps(): void {
    this._currentStep.set(0);
  }

  /**
   * Obtiene un paso específico
   */
  getStep(index: number): MethodologyStep | null {
    const steps = this._steps();
    return steps[index] || null;
  }

  /**
   * Obtiene el paso actual
   */
  getCurrentStepData(): MethodologyStep | null {
    return this.getStep(this._currentStep());
  }

  /**
   * Verifica si es el primer paso
   */
  isFirstStep(): boolean {
    return this._currentStep() === 0;
  }

  /**
   * Verifica si es el último paso
   */
  isLastStep(): boolean {
    return this._currentStep() === this._steps().length - 1;
  }

  /**
   * Obtiene el progreso actual como porcentaje
   */
  getProgress(): number {
    const current = this._currentStep();
    const total = this._steps().length;
    return ((current + 1) / total) * 100;
  }
}

import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { CardModule } from "primeng/card";
import { ButtonModule } from "primeng/button";
import { CarouselModule } from "primeng/carousel";
import { StepsModule } from "primeng/steps";
import { MenuItem } from "primeng/api";
import { MethodologyService } from "../../services/methodology.service";

@Component({
  selector: "app-methodology",
  standalone: true,
  imports: [
    CommonModule,
    CardModule,
    ButtonModule,
    CarouselModule,
    StepsModule,
  ],
  template: `
    <div class="methodology-container">
      <!-- Introducción -->
      <p-card styleClass="intro-card">
        <ng-template pTemplate="header">
          <div class="intro-header">
            <h1><i class="pi pi-info-circle"></i> Metodología Monte Carlo</h1>
            <p>
              Aprende cómo funciona el cálculo de área de manchas paso a paso
            </p>
          </div>
        </ng-template>

        <div class="intro-content">
          <p>
            La metodología Monte Carlo es una técnica estadística que utiliza la
            generación de números aleatorios para resolver problemas que pueden
            ser expresados en términos de probabilidad. En nuestro caso, la
            utilizamos para estimar el área de una mancha en una imagen binaria.
          </p>

          <div class="formula-section">
            <h3>Fórmula Principal</h3>
            <div class="formula">
              <span class="formula-text"
                >Área Estimada = (Área Total de la Imagen) × (ni / n)</span
              >
            </div>
            <div class="formula-explanation">
              <p><strong>Donde:</strong></p>
              <ul>
                <li>
                  <strong>Área Total de la Imagen:</strong> Ancho × Alto en
                  píxeles
                </li>
                <li>
                  <strong>ni:</strong> Número de puntos aleatorios que caen
                  dentro de la mancha
                </li>
                <li>
                  <strong>n:</strong> Número total de puntos aleatorios
                  generados
                </li>
              </ul>
            </div>
          </div>
        </div>
      </p-card>

      <!-- Indicador de pasos -->
      <p-card styleClass="steps-card">
        <ng-template pTemplate="header">
          <h2><i class="pi pi-list"></i> Pasos del Proceso</h2>
        </ng-template>

        <p-steps
          [model]="stepItems"
          [activeIndex]="methodologyService.currentStep()"
          (activeIndexChange)="onStepChange($event)"
          styleClass="custom-steps"
        >
        </p-steps>
      </p-card>

      <!-- Carrusel de metodología -->
      <p-card styleClass="carousel-card">
        <p-carousel
          [value]="methodologyService.steps()"
          [numVisible]="1"
          [numScroll]="1"
          [circular]="true"
          [autoplayInterval]="0"
          [page]="methodologyService.currentStep()"
          (onPage)="onCarouselPage($event)"
          styleClass="custom-carousel"
        >
          <ng-template pTemplate="item" let-step>
            <div class="step-card">
              <div class="step-header">
                <div class="step-number">{{ step.id }}</div>
                <div class="step-icon">
                  <i [class]="step.icon"></i>
                </div>
              </div>

              <div class="step-content">
                <h3>{{ step.title }}</h3>
                <p>{{ step.description }}</p>

                <!-- Contenido específico por paso -->
                <div class="step-details">
                  <div *ngIf="step.id === 1" class="step-detail">
                    <h4>Requisitos de la Imagen:</h4>
                    <ul>
                      <li>Formato: PNG, JPG, GIF o similar</li>
                      <li>Tipo: Imagen binaria (blanco y negro)</li>
                      <li>Tamaño máximo: 5MB</li>
                      <li>Píxeles blancos = mancha</li>
                      <li>Píxeles negros = fondo</li>
                    </ul>
                  </div>

                  <div *ngIf="step.id === 2" class="step-detail">
                    <h4>Configuración de Puntos:</h4>
                    <ul>
                      <li>Rango: 100 - 10,000 puntos</li>
                      <li>Distribución: Completamente aleatoria</li>
                      <li>Cobertura: Toda la imagen</li>
                      <li>Precisión: Más puntos = mayor precisión</li>
                      <li>Rendimiento: Considerar tiempo de cálculo</li>
                    </ul>
                  </div>

                  <div *ngIf="step.id === 3" class="step-detail">
                    <h4>Proceso de Conteo:</h4>
                    <ul>
                      <li>Análisis píxel por píxel</li>
                      <li>Umbral de detección: RGB > 128</li>
                      <li>Clasificación: Dentro vs. Fuera</li>
                      <li>Conteo automático</li>
                      <li>Visualización en tiempo real</li>
                    </ul>
                  </div>

                  <div *ngIf="step.id === 4" class="step-detail">
                    <h4>Cálculo Final:</h4>
                    <ul>
                      <li>Aplicación de fórmula Monte Carlo</li>
                      <li>Estimación estadística</li>
                      <li>Resultado en píxeles²</li>
                      <li>Porcentaje de cobertura</li>
                      <li>Almacenamiento del resultado</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </ng-template>
        </p-carousel>

        <!-- Controles de navegación -->
        <div class="carousel-controls">
          <p-button
            icon="pi pi-angle-left"
            (onClick)="previousStep()"
            [disabled]="methodologyService.isFirstStep()"
            styleClass="p-button-outlined"
          >
          </p-button>

          <span class="step-indicator">
            {{ methodologyService.currentStep() + 1 }} /
            {{ methodologyService.steps().length }}
          </span>

          <p-button
            icon="pi pi-angle-right"
            (onClick)="nextStep()"
            [disabled]="methodologyService.isLastStep()"
            styleClass="p-button-outlined"
          >
          </p-button>
        </div>
      </p-card>

      <!-- Información adicional -->
      <p-card styleClass="additional-info-card">
        <ng-template pTemplate="header">
          <h2><i class="pi pi-lightbulb"></i> Información Adicional</h2>
        </ng-template>

        <div class="info-grid">
          <div class="info-item">
            <div class="info-icon">
              <i class="pi pi-chart-line"></i>
            </div>
            <div class="info-content">
              <h4>Precisión</h4>
              <p>
                La precisión del método Monte Carlo aumenta con el número de
                puntos aleatorios. Para mayor precisión, use entre 5,000 y
                10,000 puntos.
              </p>
            </div>
          </div>

          <div class="info-item">
            <div class="info-icon">
              <i class="pi pi-clock"></i>
            </div>
            <div class="info-content">
              <h4>Rendimiento</h4>
              <p>
                El tiempo de cálculo es proporcional al número de puntos. Para
                imágenes grandes, considere usar menos puntos para mayor
                velocidad.
              </p>
            </div>
          </div>

          <div class="info-item">
            <div class="info-icon">
              <i class="pi pi-image"></i>
            </div>
            <div class="info-content">
              <h4>Calidad de Imagen</h4>
              <p>
                Para mejores resultados, use imágenes con buen contraste entre
                la mancha (blanco) y el fondo (negro).
              </p>
            </div>
          </div>

          <div class="info-item">
            <div class="info-icon">
              <i class="pi pi-save"></i>
            </div>
            <div class="info-content">
              <h4>Almacenamiento</h4>
              <p>
                Los resultados se guardan automáticamente en el navegador. Puede
                ver el historial en la pestaña "Resultados".
              </p>
            </div>
          </div>
        </div>
      </p-card>
    </div>
  `,
  styles: [
    `
      .methodology-container {
        padding: 20px;
      }

      .intro-card {
        margin-bottom: 30px;
      }

      .intro-header {
        text-align: center;
        padding: 20px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        border-radius: 8px 8px 0 0;
      }

      .intro-header h1 {
        font-size: 2.5rem;
        margin-bottom: 10px;
        font-weight: 300;
      }

      .intro-header i {
        margin-right: 15px;
      }

      .intro-header p {
        font-size: 1.1rem;
        margin: 0;
        opacity: 0.9;
      }

      .intro-content {
        padding: 20px;
        line-height: 1.6;
      }

      .intro-content p {
        font-size: 1.1rem;
        color: #495057;
        margin-bottom: 25px;
      }

      .formula-section {
        background: #f8f9fa;
        padding: 20px;
        border-radius: 8px;
        border-left: 4px solid #007bff;
      }

      .formula-section h3 {
        color: #007bff;
        margin-bottom: 15px;
      }

      .formula {
        background: white;
        padding: 15px;
        border-radius: 6px;
        text-align: center;
        margin-bottom: 15px;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      }

      .formula-text {
        font-size: 1.3rem;
        font-weight: 600;
        color: #007bff;
        font-family: "Courier New", monospace;
      }

      .formula-explanation {
        color: #6c757d;
      }

      .formula-explanation ul {
        padding-left: 20px;
      }

      .formula-explanation li {
        margin-bottom: 8px;
      }

      .steps-card {
        margin-bottom: 30px;
      }

      .steps-card h2 {
        color: #495057;
        margin: 0;
      }

      .steps-card i {
        margin-right: 10px;
        color: #007bff;
      }

      .carousel-card {
        margin-bottom: 30px;
      }

      .step-card {
        background: white;
        border-radius: 12px;
        padding: 30px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        margin: 0 10px;
        min-height: 500px;
      }

      .step-header {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 20px;
        margin-bottom: 25px;
      }

      .step-number {
        width: 60px;
        height: 60px;
        border-radius: 50%;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1.8rem;
        font-weight: bold;
      }

      .step-icon {
        width: 60px;
        height: 60px;
        border-radius: 50%;
        background: #f8f9fa;
        display: flex;
        align-items: center;
        justify-content: center;
        border: 2px solid #dee2e6;
      }

      .step-icon i {
        font-size: 1.5rem;
        color: #007bff;
      }

      .step-content {
        text-align: center;
      }

      .step-content h3 {
        color: #495057;
        font-size: 1.8rem;
        margin-bottom: 15px;
      }

      .step-content p {
        color: #6c757d;
        font-size: 1.1rem;
        line-height: 1.6;
        margin-bottom: 25px;
      }

      .step-details {
        text-align: left;
        background: #f8f9fa;
        padding: 20px;
        border-radius: 8px;
        border-left: 4px solid #007bff;
      }

      .step-detail h4 {
        color: #007bff;
        margin-bottom: 15px;
      }

      .step-detail ul {
        padding-left: 20px;
      }

      .step-detail li {
        margin-bottom: 8px;
        color: #495057;
      }

      .carousel-controls {
        display: flex;
        justify-content: center;
        align-items: center;
        gap: 20px;
        margin-top: 20px;
      }

      .step-indicator {
        font-weight: 600;
        color: #495057;
        font-size: 1.1rem;
      }

      .additional-info-card {
        margin-bottom: 30px;
      }

      .additional-info-card h2 {
        color: #495057;
        margin: 0;
      }

      .additional-info-card i {
        margin-right: 10px;
        color: #007bff;
      }

      .info-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
        gap: 20px;
        padding: 20px;
      }

      .info-item {
        display: flex;
        align-items: flex-start;
        gap: 15px;
        padding: 20px;
        background: #f8f9fa;
        border-radius: 8px;
        border-left: 4px solid #007bff;
      }

      .info-icon {
        width: 50px;
        height: 50px;
        border-radius: 50%;
        background: white;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
      }

      .info-icon i {
        font-size: 1.3rem;
        color: #007bff;
      }

      .info-content h4 {
        color: #495057;
        margin-bottom: 10px;
      }

      .info-content p {
        color: #6c757d;
        line-height: 1.6;
        margin: 0;
      }

      :host
        ::ng-deep
        .custom-steps
        .p-steps-item.p-steps-current
        .p-steps-number {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
      }

      :host
        ::ng-deep
        .custom-steps
        .p-steps-item.p-steps-current
        .p-steps-title {
        color: #007bff;
        font-weight: 600;
      }

      :host ::ng-deep .custom-carousel .p-carousel-content {
        background: transparent;
      }

      :host ::ng-deep .custom-carousel .p-carousel-indicators {
        display: none;
      }

      @media (max-width: 768px) {
        .methodology-container {
          padding: 10px;
        }

        .intro-header h1 {
          font-size: 2rem;
        }

        .step-card {
          padding: 20px;
          margin: 0 5px;
          min-height: 400px;
        }

        .step-header {
          flex-direction: column;
          gap: 15px;
        }

        .step-number,
        .step-icon {
          width: 50px;
          height: 50px;
        }

        .step-number {
          font-size: 1.5rem;
        }

        .step-icon i {
          font-size: 1.2rem;
        }

        .step-content h3 {
          font-size: 1.5rem;
        }

        .step-content p {
          font-size: 1rem;
        }

        .info-grid {
          grid-template-columns: 1fr;
          gap: 15px;
          padding: 15px;
        }

        .info-item {
          flex-direction: column;
          text-align: center;
        }

        .carousel-controls {
          flex-wrap: wrap;
          gap: 15px;
        }
      }
    `,
  ],
})
export class MethodologyComponent implements OnInit {
  stepItems: MenuItem[] = [];

  constructor(public methodologyService: MethodologyService) {}

  ngOnInit() {
    this.initializeStepItems();
  }

  private initializeStepItems(): void {
    this.stepItems = this.methodologyService.steps().map((step) => ({
      label: step.title,
      icon: step.icon,
      command: () => this.methodologyService.goToStep(step.id - 1),
    }));
  }

  onStepChange(index: number): void {
    this.methodologyService.goToStep(index);
  }

  onCarouselPage(event: any): void {
    this.methodologyService.goToStep(event.page);
  }

  nextStep(): void {
    this.methodologyService.nextStep();
  }

  previousStep(): void {
    this.methodologyService.previousStep();
  }
}

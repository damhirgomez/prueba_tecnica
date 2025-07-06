import {
  Component,
  ViewChild,
  ElementRef,
  OnInit,
  signal,
  computed,
  effect,
} from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { CardModule } from "primeng/card";
import { ButtonModule } from "primeng/button";
import { FileUploadModule } from "primeng/fileupload";
import { SliderModule } from "primeng/slider";
import { ProgressBarModule } from "primeng/progressbar";
import { MessagesModule } from "primeng/messages";
import { MessageModule } from "primeng/message";
import { ToastModule } from "primeng/toast";
import { MessageService } from "primeng/api";
import { PanelModule } from "primeng/panel";
import { DividerModule } from "primeng/divider";
import { TagModule } from "primeng/tag";
import { StainCalculatorService } from "../../services/stain-calculator.service";
import {
  CalculationResult,
  Point,
} from "../../interfaces/calculation.interface";

@Component({
  selector: "app-calculator",
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CardModule,
    ButtonModule,
    FileUploadModule,
    SliderModule,
    ProgressBarModule,
    MessagesModule,
    MessageModule,
    ToastModule,
    PanelModule,
    DividerModule,
    TagModule,
  ],
  providers: [MessageService],
  template: `
    <div class="calculator-container">
      <p-toast></p-toast>

      <!-- Paso 1: Subir imagen -->
      <p-card
        header="Paso 1: Subir Imagen Binaria"
        [style]="{ 'margin-bottom': '20px' }"
      >
        <div class="upload-section">
          <p-fileUpload
            mode="basic"
            name="imageFile"
            accept="image/*"
            [maxFileSize]="5000000"
            (onSelect)="onFileSelect($event)"
            [auto]="true"
            chooseLabel="Seleccionar Imagen"
            class="custom-file-upload"
          >
          </p-fileUpload>

          <div class="upload-info">
            <p>
              <i class="pi pi-info-circle"></i> Sube una imagen binaria (PNG,
              JPG, etc.) donde los píxeles blancos representen la mancha.
            </p>
          </div>
        </div>

        <!-- Vista previa de la imagen -->
        <div *ngIf="calculatorService.hasImage()" class="image-preview-section">
          <h4>Vista Previa de la Imagen</h4>
          <div class="image-container">
            <div class="canvas-container">
              <canvas
                #imageCanvas
                [width]="calculatorService.currentImage()?.width || 0"
                [height]="calculatorService.currentImage()?.height || 0"
                class="image-canvas"
              >
              </canvas>
              <div class="image-overlay">
                <div
                  *ngFor="let point of visualizationPoints"
                  class="random-point"
                  [class.inside]="point.inside"
                  [class.outside]="!point.inside"
                  [style.left.px]="point.x"
                  [style.top.px]="point.y"
                ></div>
              </div>
            </div>
            <div class="image-info">
              <p>
                <strong>Archivo:</strong>
                {{ calculatorService.currentImage()?.file?.name }}
              </p>
              <p>
                <strong>Dimensiones:</strong>
                {{ calculatorService.currentImage()?.width }} ×
                {{ calculatorService.currentImage()?.height }} píxeles
              </p>
              <p>
                <strong>Área Total:</strong>
                {{
                  (calculatorService.currentImage()?.width || 0) *
                    (calculatorService.currentImage()?.height || 0) | number
                }}
                píxeles²
              </p>
            </div>
          </div>
        </div>
      </p-card>

      <!-- Paso 2: Configurar puntos aleatorios -->
      <p-card
        header="Paso 2: Configurar Puntos Aleatorios"
        [style]="{ 'margin-bottom': '20px' }"
      >
        <div class="slider-section">
          <label for="pointsSlider"
            >Número de puntos aleatorios:
            <strong>{{ calculatorService.randomPointsCount() }}</strong></label
          >
          <p-slider
            id="pointsSlider"
            [(ngModel)]="pointsCount"
            [min]="100"
            [max]="10000"
            [step]="100"
            (onChange)="onPointsChange($event)"
            [disabled]="!calculatorService.hasImage()"
          >
          </p-slider>
          <div class="slider-info">
            <span>100</span>
            <span>Mayor número de puntos = Mayor precisión</span>
            <span>10,000</span>
          </div>
        </div>
      </p-card>

      <!-- Paso 3: Calcular área -->
      <p-card
        header="Paso 3: Calcular Área de la Mancha"
        [style]="{ 'margin-bottom': '20px' }"
      >
        <div class="calculate-section">
          <p-button
            label="Calcular Área"
            icon="pi pi-calculator"
            (onClick)="calculateArea()"
            [disabled]="!calculatorService.canCalculate()"
            [loading]="calculatorService.isCalculating()"
            styleClass="p-button-lg p-button-primary"
          >
          </p-button>

          <div
            *ngIf="calculatorService.isCalculating()"
            class="calculation-progress"
          >
            <p-progressBar mode="indeterminate"></p-progressBar>
            <p>Calculando área... Por favor espera</p>
          </div>
        </div>
      </p-card>

      <!-- Resultados -->
      <p-card
        *ngIf="lastResult"
        header="Resultados del Cálculo"
        styleClass="result-card"
      >
        <div class="result-display">
          <div class="result-main">
            <h3>Área Estimada de la Mancha</h3>
            <div class="area-value">
              {{ lastResult.estimatedStainArea | number : "1.2-2" }}
            </div>
            <div class="area-unit">píxeles²</div>
          </div>

          <p-divider></p-divider>

          <div class="result-details">
            <div class="detail-item">
              <span class="label">Área Total de la Imagen:</span>
              <span class="value"
                >{{ lastResult.totalImageArea | number }} píxeles²</span
              >
            </div>

            <div class="detail-item">
              <span class="label">Puntos Aleatorios Generados:</span>
              <span class="value">{{
                lastResult.totalRandomPoints | number
              }}</span>
            </div>

            <div class="detail-item">
              <span class="label">Puntos Dentro de la Mancha:</span>
              <span class="value">{{
                lastResult.pointsInsideStain | number
              }}</span>
            </div>

            <div class="detail-item">
              <span class="label">Porcentaje de Cobertura:</span>
              <span class="value"
                >{{
                  (lastResult.pointsInsideStain /
                    lastResult.totalRandomPoints) *
                    100 | number : "1.2-2"
                }}%</span
              >
            </div>

            <div class="detail-item">
              <span class="label">Fecha de Cálculo:</span>
              <span class="value">{{
                lastResult.calculationDate | date : "medium"
              }}</span>
            </div>
          </div>
        </div>
      </p-card>

      <!-- Botón para reset -->
      <div class="actions-section" *ngIf="calculatorService.hasImage()">
        <p-button
          label="Nueva Imagen"
          icon="pi pi-refresh"
          (onClick)="resetCalculator()"
          styleClass="p-button-outlined"
        >
        </p-button>
      </div>
    </div>
  `,
  styles: [
    `
      .calculator-container {
        padding: 20px;
      }

      .upload-section {
        text-align: center;
      }

      .upload-info {
        margin-top: 15px;
        padding: 15px;
        background: #f8f9fa;
        border-radius: 6px;
        color: #6c757d;
      }

      .upload-info i {
        margin-right: 8px;
        color: #17a2b8;
      }

      .image-preview-section {
        margin-top: 20px;
        text-align: center;
      }

      .image-container {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 15px;
      }

      .canvas-container {
        position: relative;
        display: inline-block;
        border: 2px solid #dee2e6;
        border-radius: 8px;
        overflow: hidden;
      }

      .image-canvas {
        max-width: 100%;
        max-height: 400px;
        display: block;
      }

      .image-overlay {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
      }

      .random-point {
        position: absolute;
        width: 3px;
        height: 3px;
        border-radius: 50%;
        transform: translate(-50%, -50%);
      }

      .random-point.inside {
        background: #28a745;
        box-shadow: 0 0 3px rgba(40, 167, 69, 0.6);
      }

      .random-point.outside {
        background: #dc3545;
        box-shadow: 0 0 3px rgba(220, 53, 69, 0.6);
      }

      .image-info {
        background: #f8f9fa;
        padding: 15px;
        border-radius: 6px;
        text-align: left;
      }

      .image-info p {
        margin: 5px 0;
        color: #6c757d;
      }

      .slider-section {
        text-align: center;
      }

      .slider-section label {
        display: block;
        margin-bottom: 20px;
        font-size: 1.1rem;
        color: #495057;
      }

      .slider-info {
        display: flex;
        justify-content: space-between;
        margin-top: 10px;
        font-size: 0.9rem;
        color: #6c757d;
      }

      .calculate-section {
        text-align: center;
      }

      .calculation-progress {
        margin-top: 20px;
      }

      .calculation-progress p {
        margin-top: 10px;
        color: #6c757d;
      }

      .result-display {
        text-align: center;
      }

      .result-main {
        margin-bottom: 20px;
      }

      .result-main h3 {
        color: #495057;
        margin-bottom: 15px;
      }

      .area-value {
        font-size: 3rem;
        font-weight: bold;
        color: #007bff;
        margin-bottom: 5px;
      }

      .area-unit {
        font-size: 1.2rem;
        color: #6c757d;
      }

      .result-details {
        text-align: left;
        max-width: 600px;
        margin: 0 auto;
      }

      .detail-item {
        display: flex;
        justify-content: space-between;
        padding: 10px 0;
        border-bottom: 1px solid #dee2e6;
      }

      .detail-item:last-child {
        border-bottom: none;
      }

      .detail-item .label {
        color: #6c757d;
        font-weight: 500;
      }

      .detail-item .value {
        color: #495057;
        font-weight: 600;
      }

      .actions-section {
        text-align: center;
        margin-top: 20px;
      }

      :host ::ng-deep .p-card.result-card {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
      }

      :host ::ng-deep .p-card.result-card .p-card-header {
        background: rgba(255, 255, 255, 0.1);
        color: white;
        border-bottom: 1px solid rgba(255, 255, 255, 0.2);
      }

      :host ::ng-deep .p-card.result-card .p-card-content {
        background: rgba(255, 255, 255, 0.95);
        color: #333;
        border-radius: 0 0 6px 6px;
      }

      :host ::ng-deep .p-fileupload-basic .p-button {
        padding: 12px 24px;
        font-size: 1.1rem;
      }

      :host ::ng-deep .p-slider .p-slider-range {
        background: #007bff;
      }

      :host ::ng-deep .p-slider .p-slider-handle {
        background: #007bff;
        border-color: #007bff;
      }

      @media (max-width: 768px) {
        .calculator-container {
          padding: 10px;
        }

        .image-canvas {
          max-width: 100%;
          max-height: 300px;
        }

        .area-value {
          font-size: 2rem;
        }

        .result-details {
          font-size: 0.9rem;
        }
      }
    `,
  ],
})
export class CalculatorComponent implements OnInit {
  @ViewChild("imageCanvas", { static: false })
  imageCanvas!: ElementRef<HTMLCanvasElement>;

  pointsCount = 1000;
  lastResult: CalculationResult | null = null;
  visualizationPoints: Array<Point & { inside: boolean }> = [];

  constructor(
    public calculatorService: StainCalculatorService,
    private messageService: MessageService
  ) {
    // Efecto para actualizar el canvas cuando cambia la imagen
    effect(() => {
      const image = this.calculatorService.currentImage();
      if (image) {
        setTimeout(() => this.drawImageOnCanvas(image), 0);
      }
    });
  }

  ngOnInit() {
    this.pointsCount = this.calculatorService.randomPointsCount();
  }

  async onFileSelect(event: any) {
    const file = event.files[0];
    if (!file) return;

    try {
      await this.calculatorService.processImage(file);
      this.lastResult = null;
      this.visualizationPoints = [];
      this.messageService.add({
        severity: "success",
        summary: "Imagen Cargada",
        detail: "La imagen se ha cargado correctamente",
      });
    } catch (error) {
      this.messageService.add({
        severity: "error",
        summary: "Error",
        detail:
          error instanceof Error ? error.message : "Error al cargar la imagen",
      });
    }
  }

  onPointsChange(event: any) {
    this.calculatorService.setRandomPointsCount(event.value);
    this.pointsCount = event.value;
  }

  async calculateArea() {
    if (!this.imageCanvas) {
      this.messageService.add({
        severity: "error",
        summary: "Error",
        detail: "No se pudo acceder al canvas de la imagen",
      });
      return;
    }

    try {
      const result = await this.calculatorService.calculateStainArea(
        this.imageCanvas.nativeElement
      );
      this.lastResult = result;
      this.updateVisualization(result);

      this.messageService.add({
        severity: "success",
        summary: "Cálculo Completado",
        detail: `Área estimada: ${result.estimatedStainArea.toFixed(
          2
        )} píxeles²`,
      });
    } catch (error) {
      this.messageService.add({
        severity: "error",
        summary: "Error en el Cálculo",
        detail:
          error instanceof Error ? error.message : "Error al calcular el área",
      });
    }
  }

  resetCalculator() {
    this.calculatorService.resetImage();
    this.lastResult = null;
    this.visualizationPoints = [];
    this.pointsCount = 1000;
    this.calculatorService.setRandomPointsCount(1000);
  }

  private drawImageOnCanvas(imageData: any) {
    if (!this.imageCanvas) return;

    const canvas = this.imageCanvas.nativeElement;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const img = new Image();
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
    };
    img.src = imageData.url;
  }

  private updateVisualization(result: CalculationResult) {
    // Mostrar solo una muestra de puntos para evitar sobrecargar la visualización
    const maxPointsToShow = 500;
    const pointsToShow = result.randomPoints.slice(0, maxPointsToShow);

    this.visualizationPoints = pointsToShow.map((point) => ({
      ...point,
      inside: result.pointsInsideStainList.some(
        (insidePoint) => insidePoint.x === point.x && insidePoint.y === point.y
      ),
    }));
  }
}

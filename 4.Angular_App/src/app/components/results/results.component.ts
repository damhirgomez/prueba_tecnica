import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { TableModule } from "primeng/table";
import { CardModule } from "primeng/card";
import { ButtonModule } from "primeng/button";
import { ConfirmDialogModule } from "primeng/confirmdialog";
import { ToastModule } from "primeng/toast";
import { TagModule } from "primeng/tag";
import { ConfirmationService, MessageService } from "primeng/api";
import { StainCalculatorService } from "../../services/stain-calculator.service";
import { CalculationResult } from "../../interfaces/calculation.interface";

@Component({
  selector: "app-results",
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    CardModule,
    ButtonModule,
    ConfirmDialogModule,
    ToastModule,
    TagModule,
  ],
  providers: [ConfirmationService, MessageService],
  template: `
    <div class="results-container">
      <p-toast></p-toast>
      <p-confirmDialog></p-confirmDialog>

      <p-card>
        <ng-template pTemplate="header">
          <div class="card-header">
            <h2><i class="pi pi-table"></i> Historial de Cálculos</h2>
            <div class="header-actions">
              <p-button
                *ngIf="calculatorService.calculationResults().length > 0"
                label="Limpiar Todo"
                icon="pi pi-trash"
                (onClick)="confirmClearAll()"
                styleClass="p-button-outlined p-button-danger p-button-sm"
              >
              </p-button>
            </div>
          </div>
        </ng-template>

        <div class="table-container">
          <p-table
            [value]="calculatorService.calculationResults()"
            [paginator]="true"
            [rows]="10"
            [showCurrentPageReport]="true"
            currentPageReportTemplate="Mostrando {first} - {last} de {totalRecords} resultados"
            [rowsPerPageOptions]="[10, 25, 50]"
            [globalFilterFields]="['imageName', 'calculationDate']"
            styleClass="p-datatable-gridlines p-datatable-striped"
            [tableStyle]="{ 'min-width': '60rem' }"
          >
            <ng-template pTemplate="caption">
              <div class="table-caption">
                <span class="caption-text">
                  Total de cálculos realizados:
                  <strong>{{
                    calculatorService.calculationResults().length
                  }}</strong>
                </span>
              </div>
            </ng-template>

            <ng-template pTemplate="header">
              <tr>
                <th pSortableColumn="calculationDate">
                  Fecha <p-sortIcon field="calculationDate"></p-sortIcon>
                </th>
                <th pSortableColumn="imageName">
                  Imagen <p-sortIcon field="imageName"></p-sortIcon>
                </th>
                <th pSortableColumn="imageWidth">
                  Dimensiones <p-sortIcon field="imageWidth"></p-sortIcon>
                </th>
                <th pSortableColumn="totalImageArea">
                  Área Total <p-sortIcon field="totalImageArea"></p-sortIcon>
                </th>
                <th pSortableColumn="totalRandomPoints">
                  Puntos Total
                  <p-sortIcon field="totalRandomPoints"></p-sortIcon>
                </th>
                <th pSortableColumn="pointsInsideStain">
                  Puntos en Mancha
                  <p-sortIcon field="pointsInsideStain"></p-sortIcon>
                </th>
                <th pSortableColumn="estimatedStainArea">
                  Área Estimada
                  <p-sortIcon field="estimatedStainArea"></p-sortIcon>
                </th>
                <th>Cobertura</th>
                <th>Acciones</th>
              </tr>
            </ng-template>

            <ng-template pTemplate="body" let-result>
              <tr>
                <td>
                  <div class="date-cell">
                    <i class="pi pi-calendar"></i>
                    {{ result.calculationDate | date : "short" }}
                  </div>
                </td>
                <td>
                  <div class="image-cell">
                    <i class="pi pi-image"></i>
                    <span class="image-name">{{ result.imageName }}</span>
                  </div>
                </td>
                <td>
                  <p-tag
                    [value]="result.imageWidth + ' × ' + result.imageHeight"
                    severity="info"
                  >
                  </p-tag>
                </td>
                <td>
                  <span class="area-value">
                    {{ result.totalImageArea | number }} px²
                  </span>
                </td>
                <td>
                  <span class="points-value">
                    {{ result.totalRandomPoints | number }}
                  </span>
                </td>
                <td>
                  <span class="points-inside-value">
                    {{ result.pointsInsideStain | number }}
                  </span>
                </td>
                <td>
                  <span class="estimated-area-value">
                    {{ result.estimatedStainArea | number : "1.2-2" }} px²
                  </span>
                </td>
                <td>
                  <p-tag
                    [value]="
                      ((result.pointsInsideStain / result.totalRandomPoints) *
                        100 | number : '1.1-1') + '%'
                    "
                    [severity]="
                      getCoverageSeverity(
                        (result.pointsInsideStain / result.totalRandomPoints) *
                          100
                      )
                    "
                  >
                  </p-tag>
                </td>
                <td>
                  <p-button
                    icon="pi pi-trash"
                    (onClick)="confirmDelete(result)"
                    styleClass="p-button-text p-button-danger p-button-sm"
                    pTooltip="Eliminar resultado"
                  >
                  </p-button>
                </td>
              </tr>
            </ng-template>

            <ng-template pTemplate="emptymessage">
              <tr>
                <td colspan="9" class="empty-message">
                  <div class="empty-state">
                    <i class="pi pi-inbox empty-icon"></i>
                    <h3>No hay resultados</h3>
                    <p>Aún no se han realizado cálculos de área de manchas.</p>
                    <p>Ve a la pestaña "Calculadora" para comenzar.</p>
                  </div>
                </td>
              </tr>
            </ng-template>
          </p-table>
        </div>
      </p-card>

      <!-- Estadísticas -->
      <div
        *ngIf="calculatorService.calculationResults().length > 0"
        class="statistics-section"
      >
        <p-card>
          <ng-template pTemplate="header">
            <h3><i class="pi pi-chart-bar"></i> Estadísticas</h3>
          </ng-template>

          <div class="statistics-grid">
            <div class="stat-item">
              <div class="stat-value">
                {{ calculatorService.calculationResults().length }}
              </div>
              <div class="stat-label">Cálculos Realizados</div>
            </div>

            <div class="stat-item">
              <div class="stat-value">
                {{ getAverageArea() | number : "1.2-2" }}
              </div>
              <div class="stat-label">Área Promedio (px²)</div>
            </div>

            <div class="stat-item">
              <div class="stat-value">
                {{ getAverageCoverage() | number : "1.1-1" }}%
              </div>
              <div class="stat-label">Cobertura Promedio</div>
            </div>

            <div class="stat-item">
              <div class="stat-value">{{ getAveragePoints() | number }}</div>
              <div class="stat-label">Puntos Promedio</div>
            </div>
          </div>
        </p-card>
      </div>
    </div>
  `,
  styles: [
    `
      .results-container {
        padding: 20px;
      }

      .card-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 0 20px;
        background: #f8f9fa;
        border-radius: 6px 6px 0 0;
      }

      .card-header h2 {
        margin: 0;
        color: #495057;
      }

      .card-header i {
        margin-right: 10px;
        color: #007bff;
      }

      .table-container {
        overflow-x: auto;
      }

      .table-caption {
        text-align: left;
        padding: 15px;
        background: #f8f9fa;
        border-radius: 4px;
        margin-bottom: 10px;
      }

      .caption-text {
        font-size: 1.1rem;
        color: #495057;
      }

      .date-cell {
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .date-cell i {
        color: #6c757d;
      }

      .image-cell {
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .image-cell i {
        color: #6c757d;
      }

      .image-name {
        max-width: 150px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .area-value,
      .points-value,
      .points-inside-value,
      .estimated-area-value {
        font-weight: 500;
        color: #495057;
      }

      .estimated-area-value {
        color: #007bff;
        font-weight: 600;
      }

      .empty-message {
        text-align: center;
        padding: 60px 20px;
      }

      .empty-state {
        color: #6c757d;
      }

      .empty-icon {
        font-size: 4rem;
        color: #dee2e6;
        margin-bottom: 20px;
      }

      .empty-state h3 {
        color: #495057;
        margin-bottom: 15px;
      }

      .empty-state p {
        margin: 5px 0;
      }

      .statistics-section {
        margin-top: 20px;
      }

      .statistics-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 20px;
        padding: 20px;
      }

      .stat-item {
        text-align: center;
        padding: 20px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        border-radius: 8px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      }

      .stat-value {
        font-size: 2rem;
        font-weight: bold;
        margin-bottom: 10px;
      }

      .stat-label {
        font-size: 0.9rem;
        opacity: 0.9;
      }

      :host ::ng-deep .p-datatable .p-datatable-thead > tr > th {
        background: #f8f9fa;
        color: #495057;
        font-weight: 600;
        border-color: #dee2e6;
      }

      :host ::ng-deep .p-datatable .p-datatable-tbody > tr > td {
        border-color: #dee2e6;
      }

      :host ::ng-deep .p-datatable .p-datatable-tbody > tr:nth-child(even) {
        background: #f8f9fa;
      }

      :host ::ng-deep .p-datatable .p-datatable-tbody > tr:hover {
        background: #e9ecef;
      }

      :host ::ng-deep .p-paginator {
        background: #f8f9fa;
        border-color: #dee2e6;
      }

      :host ::ng-deep .p-tag {
        font-size: 0.8rem;
        padding: 4px 8px;
      }

      @media (max-width: 768px) {
        .results-container {
          padding: 10px;
        }

        .card-header {
          flex-direction: column;
          gap: 10px;
          text-align: center;
        }

        .statistics-grid {
          grid-template-columns: 1fr;
          gap: 15px;
          padding: 15px;
        }

        .stat-item {
          padding: 15px;
        }

        .stat-value {
          font-size: 1.5rem;
        }

        :host ::ng-deep .p-datatable .p-datatable-tbody > tr > td {
          padding: 0.5rem;
          font-size: 0.9rem;
        }
      }
    `,
  ],
})
export class ResultsComponent implements OnInit {
  constructor(
    public calculatorService: StainCalculatorService,
    private confirmationService: ConfirmationService,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    // El servicio ya maneja el estado a través de signals
  }

  confirmDelete(result: CalculationResult): void {
    this.confirmationService.confirm({
      message: `¿Estás seguro de que quieres eliminar el resultado para "${result.imageName}"?`,
      header: "Confirmar Eliminación",
      icon: "pi pi-exclamation-triangle",
      accept: () => {
        this.calculatorService.removeCalculationResult(result.id);
        this.messageService.add({
          severity: "success",
          summary: "Resultado Eliminado",
          detail: "El resultado ha sido eliminado correctamente",
        });
      },
    });
  }

  confirmClearAll(): void {
    this.confirmationService.confirm({
      message:
        "¿Estás seguro de que quieres eliminar todos los resultados? Esta acción no se puede deshacer.",
      header: "Confirmar Limpieza Total",
      icon: "pi pi-exclamation-triangle",
      accept: () => {
        this.calculatorService.clearAllResults();
        this.messageService.add({
          severity: "success",
          summary: "Resultados Eliminados",
          detail: "Todos los resultados han sido eliminados",
        });
      },
    });
  }

  getCoverageSeverity(
    percentage: number
  ):
    | "success"
    | "secondary"
    | "info"
    | "warning"
    | "danger"
    | "contrast"
    | undefined {
    if (percentage < 10) return "danger";
    if (percentage < 25) return "warning";
    if (percentage < 50) return "info";
    return "success";
  }

  getAverageArea(): number {
    const results = this.calculatorService.calculationResults();
    if (results.length === 0) return 0;

    const total = results.reduce(
      (sum, result) => sum + result.estimatedStainArea,
      0
    );
    return total / results.length;
  }

  getAverageCoverage(): number {
    const results = this.calculatorService.calculationResults();
    if (results.length === 0) return 0;

    const total = results.reduce(
      (sum, result) =>
        sum + (result.pointsInsideStain / result.totalRandomPoints) * 100,
      0
    );
    return total / results.length;
  }

  getAveragePoints(): number {
    const results = this.calculatorService.calculationResults();
    if (results.length === 0) return 0;

    const total = results.reduce(
      (sum, result) => sum + result.totalRandomPoints,
      0
    );
    return total / results.length;
  }
}

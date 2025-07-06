import { Component } from "@angular/core";
import { CommonModule } from "@angular/common";
import { TabViewModule } from "primeng/tabview";
import { MenubarModule } from "primeng/menubar";
import { CalculatorComponent } from "./components/calculator/calculator.component";
import { ResultsComponent } from "./components/results/results.component";
import { MethodologyComponent } from "./components/methodology/methodology.component";

@Component({
  selector: "app-root",
  standalone: true,
  imports: [
    CommonModule,
    TabViewModule,
    MenubarModule,
    CalculatorComponent,
    ResultsComponent,
    MethodologyComponent,
  ],
  template: `
    <div class="app-container">
      <div class="header">
        <h1>Calculadora de Área de Manchas</h1>
        <p>
          Calcula el área de manchas en imágenes binarias usando el método Monte
          Carlo
        </p>
      </div>

      <div class="container">
        <p-tabView (onChange)="onTabChange($event)">
          <p-tabPanel header="Calculadora" leftIcon="pi pi-calculator">
            <div class="tab-content">
              <app-calculator></app-calculator>
            </div>
          </p-tabPanel>

          <p-tabPanel header="Resultados" leftIcon="pi pi-table">
            <div class="tab-content">
              <app-results></app-results>
            </div>
          </p-tabPanel>

          <p-tabPanel header="Metodología" leftIcon="pi pi-info-circle">
            <div class="tab-content">
              <app-methodology></app-methodology>
            </div>
          </p-tabPanel>
        </p-tabView>
      </div>
    </div>
  `,
  styles: [
    `
      .app-container {
        min-height: 100vh;
        background-color: #f8f9fa;
      }

      .header {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        padding: 30px 0;
        text-align: center;
        margin-bottom: 30px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      }

      .header h1 {
        font-size: 2.5rem;
        margin-bottom: 10px;
        font-weight: 300;
      }

      .header p {
        font-size: 1.1rem;
        opacity: 0.9;
        margin: 0;
      }

      .container {
        max-width: 1200px;
        margin: 0 auto;
        padding: 0 20px;
      }

      .tab-content {
        padding: 20px 0;
      }

      :host ::ng-deep .p-tabview .p-tabview-panels {
        padding: 0;
      }

      :host ::ng-deep .p-tabview .p-tabview-nav {
        background: white;
        border-radius: 8px 8px 0 0;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      }

      :host ::ng-deep .p-tabview .p-tabview-nav li .p-tabview-nav-link {
        padding: 1.25rem 2rem;
        font-weight: 500;
        color: #6c757d;
        border: none;
        transition: all 0.3s ease;
      }

      :host ::ng-deep .p-tabview .p-tabview-nav li .p-tabview-nav-link:hover {
        background: #f8f9fa;
        color: #495057;
      }

      :host
        ::ng-deep
        .p-tabview
        .p-tabview-nav
        li.p-highlight
        .p-tabview-nav-link {
        color: #007bff;
        border-bottom: 2px solid #007bff;
        background: white;
      }

      :host ::ng-deep .p-tabview .p-tabview-panel {
        background: white;
        border-radius: 0 0 8px 8px;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        min-height: 500px;
      }

      @media (max-width: 768px) {
        .header h1 {
          font-size: 2rem;
        }

        .header p {
          font-size: 1rem;
        }

        .container {
          padding: 0 10px;
        }

        :host ::ng-deep .p-tabview .p-tabview-nav li .p-tabview-nav-link {
          padding: 1rem 1.5rem;
          font-size: 0.9rem;
        }
      }
    `,
  ],
})
export class AppComponent {
  activeTab = 0;

  onTabChange(event: any) {
    this.activeTab = event.index;
  }
}

import { TestBed } from "@angular/core/testing";
import { MethodologyService } from "./methodology.service";
import { MethodologyStep } from "../interfaces/calculation.interface";

describe("MethodologyService", () => {
  let service: MethodologyService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MethodologyService);
  });

  it("should be created", () => {
    expect(service).toBeTruthy();
  });

  describe("Initial state", () => {
    it("should have initial values", () => {
      expect(service.currentStep()).toBe(0);
      expect(service.steps().length).toBe(4);
      expect(service.isFirstStep()).toBe(true);
      expect(service.isLastStep()).toBe(false);
    });

    it("should have correct step data", () => {
      const steps = service.steps();

      expect(steps[0].id).toBe(1);
      expect(steps[0].title).toBe("Subir Imagen Binaria");
      expect(steps[0].icon).toBe("pi pi-upload");

      expect(steps[1].id).toBe(2);
      expect(steps[1].title).toBe("Generar Puntos Aleatorios");
      expect(steps[1].icon).toBe("pi pi-scatter-chart");

      expect(steps[2].id).toBe(3);
      expect(steps[2].title).toBe("Contar Puntos en la Mancha");
      expect(steps[2].icon).toBe("pi pi-calculator");

      expect(steps[3].id).toBe(4);
      expect(steps[3].title).toBe("Calcular Área Estimada");
      expect(steps[3].icon).toBe("pi pi-chart-pie");
    });
  });

  describe("nextStep", () => {
    it("should advance to next step", () => {
      expect(service.currentStep()).toBe(0);

      service.nextStep();
      expect(service.currentStep()).toBe(1);

      service.nextStep();
      expect(service.currentStep()).toBe(2);

      service.nextStep();
      expect(service.currentStep()).toBe(3);
    });

    it("should not advance beyond last step", () => {
      service.goToStep(3); // Ir al último paso
      expect(service.currentStep()).toBe(3);

      service.nextStep();
      expect(service.currentStep()).toBe(3); // Debe quedarse en el último paso
    });
  });

  describe("previousStep", () => {
    it("should go back to previous step", () => {
      service.goToStep(3); // Ir al último paso
      expect(service.currentStep()).toBe(3);

      service.previousStep();
      expect(service.currentStep()).toBe(2);

      service.previousStep();
      expect(service.currentStep()).toBe(1);

      service.previousStep();
      expect(service.currentStep()).toBe(0);
    });

    it("should not go back beyond first step", () => {
      expect(service.currentStep()).toBe(0);

      service.previousStep();
      expect(service.currentStep()).toBe(0); // Debe quedarse en el primer paso
    });
  });

  describe("goToStep", () => {
    it("should go to specific valid step", () => {
      service.goToStep(2);
      expect(service.currentStep()).toBe(2);

      service.goToStep(0);
      expect(service.currentStep()).toBe(0);

      service.goToStep(3);
      expect(service.currentStep()).toBe(3);
    });

    it("should not go to invalid step numbers", () => {
      const initialStep = service.currentStep();

      service.goToStep(-1);
      expect(service.currentStep()).toBe(initialStep);

      service.goToStep(4);
      expect(service.currentStep()).toBe(initialStep);

      service.goToStep(10);
      expect(service.currentStep()).toBe(initialStep);
    });
  });

  describe("resetSteps", () => {
    it("should reset to first step", () => {
      service.goToStep(3);
      expect(service.currentStep()).toBe(3);

      service.resetSteps();
      expect(service.currentStep()).toBe(0);
    });
  });

  describe("getStep", () => {
    it("should return correct step by index", () => {
      const step0 = service.getStep(0);
      expect(step0).toBeTruthy();
      expect(step0!.id).toBe(1);
      expect(step0!.title).toBe("Subir Imagen Binaria");

      const step2 = service.getStep(2);
      expect(step2).toBeTruthy();
      expect(step2!.id).toBe(3);
      expect(step2!.title).toBe("Contar Puntos en la Mancha");
    });

    it("should return null for invalid index", () => {
      expect(service.getStep(-1)).toBeNull();
      expect(service.getStep(4)).toBeNull();
      expect(service.getStep(10)).toBeNull();
    });
  });

  describe("getCurrentStepData", () => {
    it("should return current step data", () => {
      const currentStep = service.getCurrentStepData();
      expect(currentStep).toBeTruthy();
      expect(currentStep!.id).toBe(1);
      expect(currentStep!.title).toBe("Subir Imagen Binaria");

      service.goToStep(2);
      const newCurrentStep = service.getCurrentStepData();
      expect(newCurrentStep).toBeTruthy();
      expect(newCurrentStep!.id).toBe(3);
      expect(newCurrentStep!.title).toBe("Contar Puntos en la Mancha");
    });
  });

  describe("isFirstStep", () => {
    it("should return true when on first step", () => {
      expect(service.isFirstStep()).toBe(true);

      service.goToStep(1);
      expect(service.isFirstStep()).toBe(false);

      service.goToStep(0);
      expect(service.isFirstStep()).toBe(true);
    });
  });

  describe("isLastStep", () => {
    it("should return true when on last step", () => {
      expect(service.isLastStep()).toBe(false);

      service.goToStep(3);
      expect(service.isLastStep()).toBe(true);

      service.goToStep(2);
      expect(service.isLastStep()).toBe(false);
    });
  });

  describe("getProgress", () => {
    it("should return correct progress percentage", () => {
      expect(service.getProgress()).toBe(25); // (0 + 1) / 4 * 100

      service.goToStep(1);
      expect(service.getProgress()).toBe(50); // (1 + 1) / 4 * 100

      service.goToStep(2);
      expect(service.getProgress()).toBe(75); // (2 + 1) / 4 * 100

      service.goToStep(3);
      expect(service.getProgress()).toBe(100); // (3 + 1) / 4 * 100
    });
  });

  describe("Step navigation integration", () => {
    it("should handle complete navigation flow", () => {
      // Comenzar en el primer paso
      expect(service.currentStep()).toBe(0);
      expect(service.isFirstStep()).toBe(true);
      expect(service.isLastStep()).toBe(false);
      expect(service.getProgress()).toBe(25);

      // Avanzar al segundo paso
      service.nextStep();
      expect(service.currentStep()).toBe(1);
      expect(service.isFirstStep()).toBe(false);
      expect(service.isLastStep()).toBe(false);
      expect(service.getProgress()).toBe(50);

      // Ir directamente al último paso
      service.goToStep(3);
      expect(service.currentStep()).toBe(3);
      expect(service.isFirstStep()).toBe(false);
      expect(service.isLastStep()).toBe(true);
      expect(service.getProgress()).toBe(100);

      // Volver al primer paso
      service.resetSteps();
      expect(service.currentStep()).toBe(0);
      expect(service.isFirstStep()).toBe(true);
      expect(service.isLastStep()).toBe(false);
      expect(service.getProgress()).toBe(25);
    });
  });
});

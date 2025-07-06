import { TestBed } from "@angular/core/testing";
import { StainCalculatorService } from "./stain-calculator.service";
import { Point, ImageData } from "../interfaces/calculation.interface";

describe("StainCalculatorService", () => {
  let service: StainCalculatorService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(StainCalculatorService);

    // Limpiar localStorage antes de cada prueba
    localStorage.removeItem("stain-calculation-results");
  });

  afterEach(() => {
    // Limpiar localStorage después de cada prueba
    localStorage.removeItem("stain-calculation-results");
  });

  it("should be created", () => {
    expect(service).toBeTruthy();
  });

  describe("Initial state", () => {
    it("should have initial values", () => {
      expect(service.currentImage()).toBeNull();
      expect(service.randomPointsCount()).toBe(1000);
      expect(service.isCalculating()).toBe(false);
      expect(service.calculationResults()).toEqual([]);
      expect(service.hasImage()).toBe(false);
      expect(service.canCalculate()).toBe(false);
    });
  });

  describe("setRandomPointsCount", () => {
    it("should update random points count", () => {
      service.setRandomPointsCount(5000);
      expect(service.randomPointsCount()).toBe(5000);
    });
  });

  describe("generateRandomPoints", () => {
    it("should generate correct number of points", () => {
      const points = service.generateRandomPoints(100, 100, 10);
      expect(points.length).toBe(10);
    });

    it("should generate points within image bounds", () => {
      const width = 200;
      const height = 150;
      const points = service.generateRandomPoints(width, height, 50);

      points.forEach((point) => {
        expect(point.x).toBeGreaterThanOrEqual(0);
        expect(point.x).toBeLessThanOrEqual(width);
        expect(point.y).toBeGreaterThanOrEqual(0);
        expect(point.y).toBeLessThanOrEqual(height);
      });
    });

    it("should generate different points on multiple calls", () => {
      const points1 = service.generateRandomPoints(100, 100, 10);
      const points2 = service.generateRandomPoints(100, 100, 10);

      // Es muy improbable que todos los puntos sean idénticos
      let identical = true;
      for (let i = 0; i < points1.length; i++) {
        if (points1[i].x !== points2[i].x || points1[i].y !== points2[i].y) {
          identical = false;
          break;
        }
      }
      expect(identical).toBe(false);
    });
  });

  describe("processImage", () => {
    it("should reject non-image files", async () => {
      const file = new File(["test"], "test.txt", { type: "text/plain" });

      try {
        await service.processImage(file);
        fail("Should have thrown an error");
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        expect((error as Error).message).toBe("El archivo debe ser una imagen");
      }
    });

    it("should handle file reading errors", async () => {
      // Crear un archivo de imagen simulado que causará error
      const file = new File(["invalid image data"], "test.jpg", {
        type: "image/jpeg",
      });

      try {
        await service.processImage(file);
        fail("Should have thrown an error");
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
      }
    });
  });

  describe("isPointInsideStain", () => {
    let mockCanvas: HTMLCanvasElement;
    let mockContext: CanvasRenderingContext2D;

    beforeEach(() => {
      mockCanvas = document.createElement("canvas");
      mockContext = mockCanvas.getContext("2d")!;

      // Mock del método getImageData
      spyOn(mockContext, "getImageData").and.returnValue({
        data: new Uint8ClampedArray([255, 255, 255, 255]), // Píxel blanco
      } as ImageData);

      spyOn(mockCanvas, "getContext").and.returnValue(mockContext);
    });

    it("should return true for white pixels", () => {
      const point: Point = { x: 10, y: 10 };
      const result = service.isPointInsideStain(mockCanvas, point);
      expect(result).toBe(true);
    });

    it("should return false when context is null", () => {
      spyOn(mockCanvas, "getContext").and.returnValue(null);
      const point: Point = { x: 10, y: 10 };
      const result = service.isPointInsideStain(mockCanvas, point);
      expect(result).toBe(false);
    });

    it("should return false for black pixels", () => {
      (mockContext.getImageData as jasmine.Spy).and.returnValue({
        data: new Uint8ClampedArray([0, 0, 0, 255]), // Píxel negro
      } as ImageData);

      const point: Point = { x: 10, y: 10 };
      const result = service.isPointInsideStain(mockCanvas, point);
      expect(result).toBe(false);
    });
  });

  describe("resetImage", () => {
    it("should reset current image to null", () => {
      // Simular que hay una imagen cargada
      const mockImageData = {
        file: new File([""], "test.jpg", { type: "image/jpeg" }),
        url: "data:image/jpeg;base64,test",
        width: 100,
        height: 100,
      } as ImageData;

      service["_currentImage"].set(mockImageData);
      expect(service.currentImage()).not.toBeNull();

      service.resetImage();
      expect(service.currentImage()).toBeNull();
    });
  });

  describe("removeCalculationResult", () => {
    it("should remove result with matching id", () => {
      const mockResult = {
        id: "test-id",
        imageName: "test.jpg",
        imageWidth: 100,
        imageHeight: 100,
        totalImageArea: 10000,
        totalRandomPoints: 1000,
        pointsInsideStain: 500,
        estimatedStainArea: 5000,
        calculationDate: new Date(),
        randomPoints: [],
        pointsInsideStainList: [],
      };

      service["_calculationResults"].set([mockResult]);
      expect(service.calculationResults().length).toBe(1);

      service.removeCalculationResult("test-id");
      expect(service.calculationResults().length).toBe(0);
    });

    it("should not remove result with non-matching id", () => {
      const mockResult = {
        id: "test-id",
        imageName: "test.jpg",
        imageWidth: 100,
        imageHeight: 100,
        totalImageArea: 10000,
        totalRandomPoints: 1000,
        pointsInsideStain: 500,
        estimatedStainArea: 5000,
        calculationDate: new Date(),
        randomPoints: [],
        pointsInsideStainList: [],
      };

      service["_calculationResults"].set([mockResult]);
      expect(service.calculationResults().length).toBe(1);

      service.removeCalculationResult("different-id");
      expect(service.calculationResults().length).toBe(1);
    });
  });

  describe("clearAllResults", () => {
    it("should clear all calculation results", () => {
      const mockResult = {
        id: "test-id",
        imageName: "test.jpg",
        imageWidth: 100,
        imageHeight: 100,
        totalImageArea: 10000,
        totalRandomPoints: 1000,
        pointsInsideStain: 500,
        estimatedStainArea: 5000,
        calculationDate: new Date(),
        randomPoints: [],
        pointsInsideStainList: [],
      };

      service["_calculationResults"].set([mockResult]);
      expect(service.calculationResults().length).toBe(1);

      service.clearAllResults();
      expect(service.calculationResults().length).toBe(0);
    });
  });

  describe("Computed signals", () => {
    it("should update hasImage when currentImage changes", () => {
      expect(service.hasImage()).toBe(false);

      const mockImageData = {
        file: new File([""], "test.jpg", { type: "image/jpeg" }),
        url: "data:image/jpeg;base64,test",
        width: 100,
        height: 100,
      } as ImageData;

      service["_currentImage"].set(mockImageData);
      expect(service.hasImage()).toBe(true);
    });

    it("should update canCalculate based on hasImage and isCalculating", () => {
      expect(service.canCalculate()).toBe(false);

      const mockImageData = {
        file: new File([""], "test.jpg", { type: "image/jpeg" }),
        url: "data:image/jpeg;base64,test",
        width: 100,
        height: 100,
      } as ImageData;

      service["_currentImage"].set(mockImageData);
      expect(service.canCalculate()).toBe(true);

      service["_isCalculating"].set(true);
      expect(service.canCalculate()).toBe(false);
    });
  });
});

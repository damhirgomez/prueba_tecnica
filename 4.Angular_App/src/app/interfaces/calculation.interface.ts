export interface Point {
  x: number;
  y: number;
}

export interface CalculationResult {
  id: string;
  imageName: string;
  imageWidth: number;
  imageHeight: number;
  totalImageArea: number;
  totalRandomPoints: number;
  pointsInsideStain: number;
  estimatedStainArea: number;
  calculationDate: Date;
  randomPoints: Point[];
  pointsInsideStainList: Point[];
}

export interface MethodologyStep {
  id: number;
  title: string;
  description: string;
  icon: string;
}

export interface ImageData {
  file: File;
  url: string;
  width: number;
  height: number;
}

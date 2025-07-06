import { Routes } from "@angular/router";

export const routes: Routes = [
  {
    path: "",
    redirectTo: "/calculator",
    pathMatch: "full",
  },
  {
    path: "calculator",
    loadComponent: () =>
      import("./components/calculator/calculator.component").then(
        (c) => c.CalculatorComponent
      ),
  },
  {
    path: "results",
    loadComponent: () =>
      import("./components/results/results.component").then(
        (c) => c.ResultsComponent
      ),
  },
  {
    path: "methodology",
    loadComponent: () =>
      import("./components/methodology/methodology.component").then(
        (c) => c.MethodologyComponent
      ),
  },
  {
    path: "**",
    redirectTo: "/calculator",
  },
];

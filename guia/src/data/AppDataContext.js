import { createContext } from "react";
import rutinasFallback from "./rutinas.json";
import dietasFallback from "./dietas.json";

export const defaultAppData = {
  rutinasData: rutinasFallback,
  dietasData: dietasFallback,
  source: "fallback",
  error: null,
};

export const AppDataContext = createContext(defaultAppData);

import { createContext } from "react";
import rutinasFallback from "./rutinas.json";
import dietasFallback from "./dietas.json";
import { defaultSettings } from "../utils/appSettings";

export const defaultAppData = {
  rutinasData: rutinasFallback,
  dietasData: dietasFallback,
  settings: defaultSettings,
  source: "fallback",
  error: null,
  updateContent: () => {},
};

export const AppDataContext = createContext(defaultAppData);

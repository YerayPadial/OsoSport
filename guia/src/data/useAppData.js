import { useContext } from "react";
import { AppDataContext } from "./AppDataContext";

export const useAppData = () => useContext(AppDataContext);

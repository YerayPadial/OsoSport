import React, { useEffect, useMemo, useState } from "react";
import { AppDataContext, defaultAppData } from "./AppDataContext";

const API_URL = `${import.meta.env.BASE_URL}api/content.php`;

export const DataProvider = ({ children }) => {
  const [data, setData] = useState(defaultAppData);

  useEffect(() => {
    const controller = new AbortController();

    const loadContent = async () => {
      try {
        const response = await fetch(API_URL, {
          headers: { Accept: "application/json" },
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(`API ${response.status}`);
        }

        const content = await response.json();

        if (!content?.rutinas?.niveles || !content?.dietas?.planes) {
          throw new Error("Respuesta de contenido incompleta");
        }

        setData({
          rutinasData: content.rutinas,
          dietasData: content.dietas,
          source: "api",
          error: null,
        });
      } catch (error) {
        if (error.name === "AbortError") {
          return;
        }

        setData((current) => ({
          ...current,
          source: "fallback",
          error,
        }));
      }
    };

    loadContent();

    return () => controller.abort();
  }, []);

  const value = useMemo(() => data, [data]);

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>;
};

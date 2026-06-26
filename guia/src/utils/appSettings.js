export const defaultThemeColors = {
  "fondo-oscuro": "#11131B",
  "tarjeta-oscura": "#1D1F28",
  "texto-oscuro": "#E2E1ED",
  "texto-secundario-oscuro": "#C3C5D7",
  "borde-oscuro": "#434655",
  "surface-low": "#191B23",
  "surface-card": "#1D1F28",
  "surface-card-high": "#282A32",
  "surface-bright": "#373942",
  "surface-variant": "#33343D",
  "primary-vanguard": "#2D62ED",
  "primary-soft": "#B5C4FF",
  "success-vanguard": "#02B04C",
  "success-soft": "#53E076",
  "nivel-0-claro": "#8D90A1",
  "nivel-0-oscuro": "#9CA3AF",
  "nivel-1-claro": "#02B04C",
  "nivel-1-oscuro": "#02B04C",
  "nivel-1Fem-claro": "#D80458",
  "nivel-1Fem-oscuro": "#D80458",
  "nivel-2-claro": "#D35400",
  "nivel-2-oscuro": "#D35400",
  "nivel-3-claro": "#C0392B",
  "nivel-3-oscuro": "#C0392B",
  "dieta-ganar-claro": "#2D62ED",
  "dieta-ganar-oscuro": "#2D62ED",
  "dieta-perder-claro": "#D80458",
  "dieta-perder-oscuro": "#D80458",
};

export const defaultSettings = {
  navigation: {
    showDietas: true,
  },
  theme: {
    colors: defaultThemeColors,
  },
};

export const normalizeSettings = (settings = {}) => ({
  navigation: {
    ...defaultSettings.navigation,
    ...(settings.navigation ?? {}),
  },
  theme: {
    ...defaultSettings.theme,
    ...(settings.theme ?? {}),
    colors: {
      ...defaultThemeColors,
      ...(settings.theme?.colors ?? {}),
    },
  },
});

export const themeVariableName = (key) => `--color-${key}`;

export const themeStyleFromSettings = (settings) => {
  const normalized = normalizeSettings(settings);

  return Object.fromEntries(
    Object.entries(normalized.theme.colors).map(([key, value]) => [themeVariableName(key), value])
  );
};

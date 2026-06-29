export const defaultThemeColors = {
  "fondo-claro": "#F4F6FB",
  "tarjeta-clara": "#FFFFFF",
  "texto-claro": "#171923",
  "texto-secundario-claro": "#5E6474",
  "borde-claro": "#D8DCE6",
  "surface-low-claro": "#EEF1F6",
  "surface-card-claro": "#FFFFFF",
  "surface-card-high-claro": "#E7EBF2",
  "surface-bright-claro": "#DDE3EC",
  "surface-variant-claro": "#E5E9F0",
  "primary-soft-claro": "#244BC5",
  "success-soft-claro": "#087A34",
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
    showDietas: false,
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

export const themeStyleFromSettings = (settings, isDark = true) => {
  const normalized = normalizeSettings(settings);
  const colors = normalized.theme.colors;
  const style = Object.fromEntries(
    Object.entries(colors).map(([key, value]) => [themeVariableName(key), value])
  );
  const modeSuffix = isDark ? "" : "-claro";
  const mappedColors = ["surface-low", "surface-card", "surface-card-high", "surface-bright", "surface-variant"];

  mappedColors.forEach((key) => {
    style[themeVariableName(key)] = colors[`${key}${modeSuffix}`] ?? colors[key];
  });
  style[themeVariableName("surface")] = isDark ? colors["fondo-oscuro"] : colors["fondo-claro"];
  style[themeVariableName("on-surface")] = isDark ? colors["texto-oscuro"] : colors["texto-claro"];
  style[themeVariableName("on-surface-muted")] = isDark
    ? colors["texto-secundario-oscuro"]
    : colors["texto-secundario-claro"];
  style[themeVariableName("outline-vanguard")] = isDark ? colors["borde-oscuro"] : colors["borde-claro"];
  style[themeVariableName("primary-soft")] = isDark ? colors["primary-soft"] : colors["primary-soft-claro"];
  style[themeVariableName("success-soft")] = isDark ? colors["success-soft"] : colors["success-soft-claro"];

  return style;
};

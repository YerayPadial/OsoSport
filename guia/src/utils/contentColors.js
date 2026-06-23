export const defaultLevelColors = {
  1: "#166534",
  2: "#6b21a8",
  3: "#B45309",
  4: "#B91C1C",
  5: "#4B5563",
};

export const defaultDietColors = {
  9: "#0D9488",
  10: "#6D28D9",
};

export const getLevelColor = (level) =>
  level?.color || defaultLevelColors[level?.id] || "#166534";

export const getDietColor = (plan) =>
  plan?.color || defaultDietColors[plan?.id] || "#0D9488";

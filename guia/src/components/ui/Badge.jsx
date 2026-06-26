import React from "react";

const tones = {
  neutral: "bg-surface-variant text-texto-secundario-claro dark:text-texto-secundario-oscuro",
  primary: "bg-primary-vanguard text-white",
  success: "bg-success-vanguard text-white",
  danger: "bg-red-700 text-white",
  warning: "bg-orange-700 text-white",
};

const Badge = ({ children, tone = "neutral", className = "" }) => (
  <span
    className={`inline-flex w-max items-center rounded-md px-2 py-1 text-xs font-bold uppercase tracking-wide ${tones[tone] ?? tones.neutral} ${className}`}
  >
    {children}
  </span>
);

export default Badge;

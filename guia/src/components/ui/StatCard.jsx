import React from "react";

const StatCard = ({ label, value, icon: Icon, tone = "primary" }) => {
  const color = tone === "success" ? "text-success-soft" : "text-primary-soft";

  return (
    <article className="app-card flex flex-col items-center justify-center gap-2 p-4 text-center">
      {Icon && <Icon className={`h-6 w-6 ${color}`} />}
      <strong className={`font-numeric text-3xl ${color}`}>{value}</strong>
      <span className="text-sm font-bold text-texto-secundario-claro dark:text-texto-secundario-oscuro">
        {label}
      </span>
    </article>
  );
};

export default StatCard;

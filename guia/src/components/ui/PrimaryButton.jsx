import React from "react";

const PrimaryButton = ({
  children,
  icon: Icon,
  variant = "primary",
  className = "",
  ...props
}) => {
  const variants = {
    primary: "bg-primary-vanguard text-white hover:bg-primary-soft hover:text-on-primary",
    secondary:
      "border border-borde-claro dark:border-borde-oscuro bg-surface-card text-texto-claro dark:text-texto-oscuro hover:bg-surface-card-high",
    success: "bg-success-vanguard text-white hover:bg-success-soft hover:text-green-950",
    danger: "bg-red-700 text-white hover:bg-red-600",
  };

  return (
    <button
      className={`app-focus inline-flex min-h-touch-target items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-black transition duration-200 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 ${variants[variant] ?? variants.primary} ${className}`}
      {...props}
    >
      {Icon && <Icon className="h-5 w-5" />}
      {children}
    </button>
  );
};

export default PrimaryButton;

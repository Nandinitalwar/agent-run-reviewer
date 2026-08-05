import React from "react";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "darker" | "hoverable" | "interactive";
}

export function Card({
  children,
  variant = "default",
  className = "",
  ...props
}: CardProps) {
  const baseStyles = "rounded-xl border transition-all duration-200";
  
  const variants = {
    default: "bg-slate-900/60 border-slate-800/80 shadow-md backdrop-blur-sm",
    darker: "bg-slate-950/80 border-slate-900 shadow-inner",
    hoverable: "bg-slate-900/60 border-slate-800/80 hover:border-indigo-500/40 hover:bg-slate-900/90 shadow-md",
    interactive: "bg-slate-900/40 border-slate-800/60 hover:bg-slate-900/80 hover:border-indigo-500/50 cursor-pointer shadow"
  };

  return (
    <div
      className={`${baseStyles} ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

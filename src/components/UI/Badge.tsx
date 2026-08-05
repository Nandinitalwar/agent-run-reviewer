import React from "react";

interface BadgeProps {
  status: "approved" | "needs_review" | "blocked" | "success" | "failed" | "pending";
  children?: React.ReactNode;
  className?: string;
}

export function Badge({ status, children, className = "" }: BadgeProps) {
  const styles: Record<string, string> = {
    approved: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30",
    success: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
    
    needs_review: "bg-amber-500/10 text-amber-400 border border-amber-500/30",
    pending: "bg-amber-500/10 text-amber-400 border border-amber-500/20",
    
    blocked: "bg-rose-500/10 text-rose-400 border border-rose-500/30",
    failed: "bg-rose-500/10 text-rose-400 border border-rose-500/20",
  };

  const labels: Record<string, string> = {
    approved: "APPROVED",
    success: "SUCCESS",
    needs_review: "NEEDS REVIEW",
    pending: "PENDING",
    blocked: "BLOCKED",
    failed: "FAILED",
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${styles[status]} ${className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full bg-current ${status === 'pending' ? 'animate-pulse-ring' : ''}`} />
      {children || labels[status]}
    </span>
  );
}

import React from "react";
import { Clock, Cpu, DollarSign, BarChart2, Activity } from "lucide-react";
import { RunMetrics } from "@/lib/types";
import { Card } from "../UI/Card";

interface MetricsGridProps {
  metrics: RunMetrics;
}

export function MetricsGrid({ metrics }: MetricsGridProps) {
  const statItems = [
    {
      label: "Execution Duration",
      value: `${metrics.totalDuration.toFixed(1)}s`,
      subtext: `Avg: ${metrics.avgStepDuration}s / step`,
      icon: Clock,
      color: "text-indigo-400 bg-indigo-500/10 border-indigo-500/15"
    },
    {
      label: "Estimated Tokens",
      value: metrics.estimatedTokens.toLocaleString(),
      subtext: "Prompt + Output context",
      icon: Cpu,
      color: "text-cyan-400 bg-cyan-500/10 border-cyan-500/15"
    },
    {
      label: "Computed Audit Cost",
      value: metrics.estimatedCost < 0.0001 ? `< $0.0001` : `$${metrics.estimatedCost.toFixed(4)}`,
      subtext: "Est. Gemini pricing standard",
      icon: DollarSign,
      color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/15"
    },
    {
      label: "Workflow Accuracy",
      value: `${metrics.successRate}%`,
      subtext: `Steps: ${metrics.totalSteps} total`,
      icon: Activity,
      color: metrics.failureRate > 0
        ? "text-rose-400 bg-rose-500/10 border-rose-500/15"
        : "text-emerald-400 bg-emerald-500/10 border-emerald-500/15"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {statItems.map((item, index) => {
        const Icon = item.icon;
        return (
          <Card key={index} className="p-4 flex items-start justify-between">
            <div className="space-y-1">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                {item.label}
              </span>
              <div className="text-2xl font-black text-white tracking-tight">
                {item.value}
              </div>
              <span className="text-xs text-slate-500 font-medium block">
                {item.subtext}
              </span>
            </div>
            <div className={`p-2.5 rounded-lg border ${item.color}`}>
              <Icon className="w-5 h-5" />
            </div>
          </Card>
        );
      })}
    </div>
  );
}

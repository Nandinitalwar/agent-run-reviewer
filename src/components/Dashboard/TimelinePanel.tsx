import React from "react";
import { CheckCircle2, XCircle, PlayCircle, Clock } from "lucide-react";
import { Step } from "@/lib/types";

interface TimelinePanelProps {
  steps: Step[];
  selectedIndex: number;
  onSelectStep: (index: number) => void;
}

export function TimelinePanel({ steps, selectedIndex, onSelectStep }: TimelinePanelProps) {
  return (
    <div className="flex flex-col h-full bg-slate-900/40 border border-slate-800/80 rounded-xl overflow-hidden backdrop-blur-sm">
      <div className="px-4 py-3.5 border-b border-slate-800 bg-slate-900/60 flex items-center justify-between">
        <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
          Execution Timeline
        </h3>
        <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400">
          {steps.length} Steps
        </span>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-2 max-h-[500px]">
        {steps.map((step, idx) => {
          const isSelected = selectedIndex === idx;
          const isSuccess = step.status === "success";
          const isFailed = step.status === "failed";

          return (
            <div
              key={idx}
              onClick={() => onSelectStep(idx)}
              className={`group relative flex items-start gap-3 p-3 rounded-lg border text-left cursor-pointer transition-all duration-150 ${
                isSelected
                  ? "bg-indigo-600/10 border-indigo-500/50 shadow-md shadow-indigo-600/5"
                  : "bg-slate-950/20 border-slate-900 hover:bg-slate-900/40 hover:border-slate-800"
              }`}
            >
              {/* Vertical connector line (for items other than last) */}
              {idx < steps.length - 1 && (
                <div className="absolute left-[21px] top-11 bottom-[-16px] w-[2px] bg-slate-800 pointer-events-none group-hover:bg-slate-700" />
              )}

              {/* Step circle status indicator */}
              <div className="mt-0.5 z-10 flex-shrink-0">
                {isSuccess ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                ) : isFailed ? (
                  <XCircle className="w-5 h-5 text-rose-500" />
                ) : (
                  <PlayCircle className="w-5 h-5 text-amber-500 animate-pulse" />
                )}
              </div>

              {/* Step info block */}
              <div className="flex-1 min-w-0 space-y-1">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-mono font-bold text-indigo-400">
                    STEP {step.step}
                  </span>
                  <span className="text-xs text-slate-500 flex items-center gap-1 font-mono">
                    <Clock className="w-3 h-3" />
                    {step.duration ? `${step.duration}s` : "0s"}
                  </span>
                </div>

                <h4 className={`text-sm font-semibold truncate ${isSelected ? 'text-white' : 'text-slate-200 group-hover:text-white'}`}>
                  {step.action}
                </h4>

                {step.tool && (
                  <span className="inline-block text-[10px] font-bold font-mono px-1.5 py-0.5 rounded bg-slate-800 text-indigo-300 uppercase tracking-wide">
                    {step.tool}
                  </span>
                )}

                {isFailed && step.error && (
                  <p className="text-xs text-rose-400 font-medium line-clamp-1 mt-1 bg-rose-500/5 px-2 py-1 rounded border border-rose-500/10">
                    {step.error}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

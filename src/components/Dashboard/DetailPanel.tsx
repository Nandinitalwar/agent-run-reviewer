import React from "react";
import { Terminal, Database, ShieldAlert, Cpu, Layers } from "lucide-react";
import { Step } from "@/lib/types";
import { Badge } from "../UI/Badge";

interface DetailPanelProps {
  step: Step;
}

export function DetailPanel({ step }: { step?: Step }) {
  if (!step) {
    return (
      <div className="flex flex-col h-full bg-slate-900/40 border border-slate-800/80 rounded-xl overflow-hidden backdrop-blur-sm p-8 text-center text-slate-500 justify-center items-center min-h-[300px]">
        <Terminal className="w-8 h-8 text-slate-700 mb-2" />
        <p className="text-sm font-semibold">No Step Details Available</p>
        <p className="text-xs text-slate-600 mt-1">Select a trace step from the timeline to view details.</p>
      </div>
    );
  }

  const isFailed = step.status === "failed";

  // Pretty formats JSON inputs or raw text
  const renderPayload = (payload: any) => {
    if (!payload) return <span className="text-slate-600 italic">No data recorded</span>;
    
    if (typeof payload === "object") {
      return JSON.stringify(payload, null, 2);
    }
    
    try {
      const parsed = JSON.parse(payload);
      return JSON.stringify(parsed, null, 2);
    } catch {
      return String(payload).trim();
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-900/40 border border-slate-800/80 rounded-xl overflow-hidden backdrop-blur-sm">
      <div className="px-4 py-3 border-b border-slate-800 bg-slate-900/60 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <Terminal className="w-4 h-4 text-indigo-400 flex-shrink-0" />
          <h3 className="text-sm font-bold text-slate-100 truncate">
            Step {step.step}: {step.action}
          </h3>
        </div>
        <Badge status={step.status} />
      </div>

      <div className="flex-1 p-4 overflow-y-auto space-y-4 max-h-[500px]">
        {/* Step Metadata Bar */}
        <div className="grid grid-cols-3 gap-2 p-3 bg-slate-950/40 border border-slate-900 rounded-lg text-xs">
          <div>
            <span className="text-slate-500 block font-semibold uppercase tracking-wider mb-0.5">Latency</span>
            <span className="text-slate-200 font-mono font-medium">
              {step.latency ? `${step.latency} ms` : `${Math.round((step.duration || 1) * 1000)} ms`}
            </span>
          </div>
          <div>
            <span className="text-slate-500 block font-semibold uppercase tracking-wider mb-0.5">Integration Tool</span>
            <span className="text-slate-200 font-mono font-medium truncate block">
              {step.tool ? step.tool : "N/A"}
            </span>
          </div>
          <div>
            <span className="text-slate-500 block font-semibold uppercase tracking-wider mb-0.5">Context Tokens</span>
            <span className="text-slate-200 font-mono font-medium">
              {step.context_tokens ? step.context_tokens.toLocaleString() : "N/A"}
            </span>
          </div>
        </div>

        {/* Error Block */}
        {isFailed && step.error && (
          <div className="p-3.5 bg-rose-500/10 border border-rose-500/20 rounded-lg text-rose-400">
            <div className="flex items-center gap-2 mb-1.5">
              <ShieldAlert className="w-4 h-4" />
              <h4 className="text-xs font-bold uppercase tracking-wider">Error Details</h4>
            </div>
            <pre className="text-xs font-mono font-medium whitespace-pre-wrap leading-relaxed bg-slate-950/40 p-2 rounded border border-rose-500/10">
              {step.error}
            </pre>
          </div>
        )}

        {/* Input / Arguments */}
        <div className="space-y-1.5">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">
            <Layers className="w-3.5 h-3.5 text-slate-500" />
            Input Payload / Tool Arguments
          </div>
          <pre className="p-3 bg-slate-950 border border-slate-900 rounded-lg font-mono text-xs text-indigo-300 overflow-x-auto whitespace-pre-wrap max-h-[140px] leading-relaxed">
            {renderPayload(step.input)}
          </pre>
        </div>

        {/* Output / Result */}
        <div className="space-y-1.5">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">
            <Database className="w-3.5 h-3.5 text-slate-500" />
            Output Response / Result
          </div>
          <pre className="p-3 bg-slate-950 border border-slate-900 rounded-lg font-mono text-xs text-emerald-400 overflow-x-auto whitespace-pre-wrap max-h-[180px] leading-relaxed">
            {renderPayload(step.output)}
          </pre>
        </div>
      </div>
    </div>
  );
}

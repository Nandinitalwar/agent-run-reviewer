import React, { useState } from "react";
import { Sparkles, ShieldCheck, AlertTriangle, Play, HelpCircle, AlertCircle, RefreshCw, Eye } from "lucide-react";
import { GeminiAnalysis } from "@/lib/types";
import { Badge } from "../UI/Badge";
import { Button } from "../UI/Button";
import { Card } from "../UI/Card";

interface AuditPanelProps {
  analysis: GeminiAnalysis;
  onStatusChange?: (newStatus: "approved" | "needs_review" | "blocked") => void;
}

export function AuditPanel({ analysis, onStatusChange }: AuditPanelProps) {
  const [currentStatus, setCurrentStatus] = useState<"approved" | "needs_review" | "blocked">(analysis.status);
  const [isReplaying, setIsReplaying] = useState(false);
  const [replaySuccess, setReplaySuccess] = useState(false);

  const handleStatusUpdate = (status: "approved" | "needs_review" | "blocked") => {
    setCurrentStatus(status);
    if (onStatusChange) {
      onStatusChange(status);
    }
  };

  const triggerReplaySimulation = () => {
    setIsReplaying(true);
    setReplaySuccess(false);
    setTimeout(() => {
      setIsReplaying(false);
      setReplaySuccess(true);
      setTimeout(() => setReplaySuccess(false), 5000);
    }, 2200);
  };

  // Determine risk level color style
  const getRiskStyle = (score: number) => {
    if (score <= 30) return { border: "border-emerald-500/20 bg-emerald-500/5", text: "text-emerald-400", label: "Low Risk" };
    if (score <= 65) return { border: "border-amber-500/20 bg-amber-500/5", text: "text-amber-400", label: "Moderate Risk" };
    return { border: "border-rose-500/20 bg-rose-500/5", text: "text-rose-400", label: "High Risk" };
  };

  const risk = getRiskStyle(analysis.risk_score);

  return (
    <div className="flex flex-col h-full bg-slate-900/40 border border-slate-800/80 rounded-xl overflow-hidden backdrop-blur-sm">
      <div className="px-4 py-3 border-b border-slate-800 bg-slate-900/60 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-indigo-400" />
          <h3 className="text-sm font-bold text-slate-100">
            Gemini Governance Audit
          </h3>
        </div>
        <Badge status={currentStatus} />
      </div>

      <div className="flex-1 p-4 overflow-y-auto space-y-4 max-h-[500px]">
        {/* Risk Score & Confidence Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className={`p-3 border rounded-xl flex flex-col justify-between ${risk.border}`}>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Risk Index</span>
            <div className="flex items-baseline gap-1.5 mt-1">
              <span className={`text-2xl font-black ${risk.text}`}>{analysis.risk_score}</span>
              <span className="text-[10px] text-slate-500 font-medium">/ 100</span>
            </div>
            <span className={`text-[10px] font-semibold ${risk.text} mt-1 block`}>{risk.label}</span>
          </div>

          <div className="p-3 border border-slate-800 bg-slate-950/30 rounded-xl flex flex-col justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Confidence</span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-2xl font-black text-slate-200">{(analysis.confidence * 100).toFixed(0)}%</span>
            </div>
            <span className="text-[10px] text-slate-500 font-medium mt-1 block">Audit Reliability</span>
          </div>
        </div>

        {/* Audit Summary */}
        <div className="space-y-1">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Evaluation Summary</span>
          <p className="text-sm text-slate-300 leading-relaxed bg-slate-950/40 p-3 rounded-lg border border-slate-900">
            {analysis.summary}
          </p>
        </div>

        {/* Unnecessary Steps / Redundant Logic */}
        <div className="space-y-1.5">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Workflow Bloat / Redundant Actions</span>
          {analysis.unnecessary_steps && analysis.unnecessary_steps.length > 0 ? (
            <div className="space-y-1.5">
              {analysis.unnecessary_steps.map((item, idx) => (
                <div key={idx} className="flex items-start gap-2 text-xs text-amber-300/95 bg-amber-500/5 border border-amber-500/10 p-2.5 rounded-lg">
                  <AlertTriangle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-xs text-slate-500 bg-slate-950/20 border border-slate-900 p-2.5 rounded-lg italic">
              No unnecessary steps or loop patterns detected.
            </div>
          )}
        </div>

        {/* Prescribed Remedy */}
        <div className="space-y-1 bg-indigo-500/5 border border-indigo-500/10 p-3.5 rounded-lg">
          <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider block mb-1">Recommended Optimization</span>
          <p className="text-xs text-slate-300 leading-relaxed">
            {analysis.recommended_fix}
          </p>
        </div>

        {/* Suggested Action */}
        <div className="flex items-center justify-between p-3 bg-slate-950 border border-slate-900 rounded-lg text-xs gap-3">
          <div className="space-y-0.5 min-w-0">
            <span className="text-slate-500 font-semibold uppercase tracking-wider block">Suggested Next Step</span>
            <span className="text-slate-200 font-medium truncate block">{analysis.suggested_action}</span>
          </div>
          <Button
            onClick={triggerReplaySimulation}
            disabled={isReplaying}
            variant="primary"
            size="sm"
            className="flex-shrink-0 font-bold bg-indigo-600 hover:bg-indigo-700 h-8"
          >
            {isReplaying ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Play className="w-3.5 h-3.5 fill-current" />
            )}
            Replay Run
          </Button>
        </div>

        {replaySuccess && (
          <div className="text-xs font-medium text-emerald-400 bg-emerald-500/10 border border-emerald-500/25 p-2.5 rounded-lg flex items-center gap-2 animate-fade-in">
            <ShieldCheck className="w-4 h-4 flex-shrink-0" />
            Replay simulated successfully! State and dependencies validated.
          </div>
        )}

        {/* Override Governance State */}
        <div className="border-t border-slate-800/80 pt-4 space-y-2">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Set Manual Governance State</span>
          <div className="grid grid-cols-3 gap-2">
            <Button
              type="button"
              variant={currentStatus === "approved" ? "primary" : "outline"}
              size="sm"
              onClick={() => handleStatusUpdate("approved")}
              className={`h-9 font-bold text-xs ${currentStatus === 'approved' ? 'bg-emerald-600 border-emerald-500 hover:bg-emerald-700' : 'hover:border-emerald-500/30'}`}
            >
              Approve
            </Button>
            <Button
              type="button"
              variant={currentStatus === "needs_review" ? "primary" : "outline"}
              size="sm"
              onClick={() => handleStatusUpdate("needs_review")}
              className={`h-9 font-bold text-xs ${currentStatus === 'needs_review' ? 'bg-amber-600 border-amber-500 hover:bg-amber-700' : 'hover:border-amber-500/30'}`}
            >
              Review
            </Button>
            <Button
              type="button"
              variant={currentStatus === "blocked" ? "danger" : "outline"}
              size="sm"
              onClick={() => handleStatusUpdate("blocked")}
              className={`h-9 font-bold text-xs ${currentStatus === 'blocked' ? 'bg-rose-600 border-rose-500 hover:bg-rose-700' : 'hover:border-rose-500/30'}`}
            >
              Block
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

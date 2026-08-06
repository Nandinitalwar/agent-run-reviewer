import React from "react";
import { ListFilter, History, Clock, FileJson, ArrowRight, ShieldCheck } from "lucide-react";
import UploadForm from "@/components/UploadForm";
import { getAllRuns } from "@/lib/db";
import { Card } from "@/components/UI/Card";
import { Badge } from "@/components/UI/Badge";

export const revalidate = 0; // Disable server cache to ensure newly saved runs appear instantly

export default function Home() {
  const previousRuns = getAllRuns();

  const formatDate = (isoStr: string) => {
    try {
      const date = new Date(isoStr);
      return date.toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return isoStr;
    }
  };

  return (
    <div className="space-y-10">
      {/* Hero Welcome Intro */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-indigo-500/15 bg-indigo-500/5 text-xs text-indigo-400 font-bold tracking-wide uppercase">
          <ShieldCheck className="w-4 h-4 animate-pulse-ring" />
          Enterprise AI Governance
        </div>
        <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-none">
          Agent Run Reviewer & Auditor
        </h2>
        <p className="text-sm text-slate-400 leading-relaxed max-w-2xl mx-auto">
          Evaluate, inspect, and approve autonomous workflows. Paste agent trace logs to generate a 
          rigorous structured governance evaluation powered by Google Gemini.
        </p>
      </div>

      {/* Main Upload Box */}
      <Card className="p-6 md:p-8 max-w-4xl mx-auto border-slate-800/80">
        <UploadForm />
      </Card>

      {/* Observability Guide & Pro Tips Section */}
      <div className="max-w-4xl mx-auto space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-900 pb-3">
          <History className="w-4 h-4 text-indigo-400" />
          <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider">
            💡 Observability Best Practices: Getting the Most Out of Gemini
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-4 space-y-2 bg-slate-900/20 border-slate-900">
            <div className="text-indigo-400 font-bold text-xs uppercase flex items-center gap-1.5">
              <span>1. Enrich Trace Schemas</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Enrich your step objects with explicit <code className="text-indigo-300">tool</code>, <code className="text-indigo-300">input</code>, and <code className="text-indigo-300">output</code> properties. Gemini checks these values to identify functional loops, performance bottlenecks, and redundant logic.
            </p>
          </Card>

          <Card className="p-4 space-y-2 bg-slate-900/20 border-slate-900">
            <div className="text-cyan-400 font-bold text-xs uppercase flex items-center gap-1.5">
              <span>2. Context Snapshotting</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Log raw system prompts or active compliance rulebooks directly into step arguments. This allows Gemini to evaluate legal safety constraints, capture compliance deviations, and flag active data leaks.
            </p>
          </Card>

          <Card className="p-4 space-y-2 bg-slate-900/20 border-slate-900">
            <div className="text-emerald-400 font-bold text-xs uppercase flex items-center gap-1.5">
              <span>3. Logical Upgrades</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              For complex workflows exceeding 15 steps or involving deep state transitions, change the engine model inside <code className="text-emerald-300">gemini.ts</code> to <code className="text-emerald-300">gemini-1.5-pro</code> to leverage superior cross-document reasoning.
            </p>
          </Card>
        </div>
      </div>

      {/* Execution History Section */}
      <div className="max-w-4xl mx-auto space-y-4">
        <div className="flex items-center justify-between border-b border-slate-900 pb-3">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-slate-400" />
            <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider">
              Evaluation History
            </h3>
          </div>
          <span className="text-xs text-slate-500 font-mono">
            {previousRuns.length} Evaluated Runs
          </span>
        </div>

        {previousRuns.length > 0 ? (
          <div className="grid grid-cols-1 gap-3">
            {previousRuns.map((run) => (
              <a href={`/run/${run.id}`} key={run.id} className="block group">
                <Card
                  variant="hoverable"
                  className="p-4 flex flex-wrap sm:flex-nowrap items-center justify-between gap-4 border-slate-800/60"
                >
                  <div className="space-y-1.5 min-w-0 flex-1">
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-mono font-bold text-indigo-400">
                        RUN #{run.id}
                      </span>
                      <span className="text-xs text-slate-500">
                        {formatDate(run.createdAt)}
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-slate-200 group-hover:text-indigo-400 transition-colors truncate">
                      {run.goal}
                    </h4>

                    {/* Mini details list */}
                    <div className="flex items-center gap-4 text-xs text-slate-500 font-mono">
                      <span className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5" />
                        {run.metrics.totalDuration.toFixed(1)}s
                      </span>
                      <span>•</span>
                      <span>{run.steps.length} steps</span>
                      <span>•</span>
                      <span>{run.metrics.estimatedTokens.toLocaleString()} tokens</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 flex-shrink-0 w-full sm:w-auto justify-between sm:justify-end border-t border-slate-900/50 sm:border-t-0 pt-2 sm:pt-0">
                    <div className="flex flex-col items-end sm:text-right gap-1.5">
                      <Badge status={run.analysis.status} />
                      <span className="text-[10px] font-mono text-slate-500">
                        Risk Score: {run.analysis.risk_score}
                      </span>
                    </div>
                    <ArrowRight className="w-5 h-5 text-slate-600 group-hover:translate-x-1 transition-transform group-hover:text-slate-400 hidden sm:block" />
                  </div>
                </Card>
              </a>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-slate-900/20 border border-slate-900 rounded-xl space-y-2 p-6">
            <FileJson className="w-8 h-8 text-slate-600 mx-auto" />
            <h4 className="text-sm font-bold text-slate-400">No Audited Runs Yet</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Ready to govern your agents? Paste an execution trace above to perform your first evaluation.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

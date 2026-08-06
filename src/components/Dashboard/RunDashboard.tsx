"use client";

import React, { useState } from "react";
import { Download, ChevronLeft, Calendar, FileText, CheckCircle2, RefreshCw } from "lucide-react";
import { Run, Step } from "@/lib/types";
import { MetricsGrid } from "./MetricsGrid";
import { TimelinePanel } from "./TimelinePanel";
import { DetailPanel } from "./DetailPanel";
import { AuditPanel } from "./AuditPanel";
import { Button } from "../UI/Button";
import { Badge } from "../UI/Badge";

interface RunDashboardProps {
  initialRun: Run;
}

export function RunDashboard({ initialRun }: RunDashboardProps) {
  const [run, setRun] = useState<Run>(initialRun);
  const [selectedStepIndex, setSelectedStepIndex] = useState(0);

  const activeStep = run.steps[selectedStepIndex] || run.steps[0];

  const handleGovernanceStatusChange = (newStatus: "approved" | "needs_review" | "blocked") => {
    setRun((prev) => ({
      ...prev,
      analysis: {
        ...prev.analysis,
        status: newStatus,
      },
    }));
  };

  const handleExportJSON = () => {
    try {
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(run, null, 2));
      const downloadAnchor = document.createElement("a");
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", `agent_audit_report_${run.id}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
    } catch (err) {
      console.error("Export failed:", err);
    }
  };

  const formatDate = (isoStr: string) => {
    try {
      const date = new Date(isoStr);
      return date.toLocaleDateString(undefined, {
        month: "long",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });
    } catch {
      return isoStr;
    }
  };

  return (
    <div className="space-y-6">
      {/* Back Button & Top Action Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-900 pb-4">
        <div className="space-y-1.5 min-w-0">
          <a
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to Upload Center
          </a>
          
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Agent Execution Audit: <span className="font-mono text-indigo-400">#{run.id}</span>
            </h2>
            <Badge status={run.analysis.status} />
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
            <Calendar className="w-3.5 h-3.5" />
            <span>Analyzed on {formatDate(run.createdAt)}</span>
          </div>
        </div>

        {/* Dashboard Control Buttons */}
        <div className="flex items-center gap-2.5 flex-shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportJSON}
            className="hover:border-slate-700 hover:bg-slate-800/40 text-slate-300"
          >
            <Download className="w-4 h-4" />
            Export Audit Report
          </Button>
        </div>
      </div>

      {/* Goal Summary Header Card */}
      <div className="p-4 bg-slate-900/30 border border-slate-800/80 rounded-xl">
        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
          Target Objective / Execution Goal
        </span>
        <h3 className="text-base font-bold text-slate-100 leading-snug">
          "{run.goal}"
        </h3>
      </div>

      {/* Metrics Banner */}
      <MetricsGrid metrics={run.metrics} />

      {/* Three Panel Workspace Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        {/* Left Panel: Timeline */}
        <div className="lg:col-span-4 h-full">
          <TimelinePanel
            steps={run.steps}
            selectedIndex={selectedStepIndex}
            onSelectStep={setSelectedStepIndex}
          />
        </div>

        {/* Center Panel: Details */}
        <div className="lg:col-span-4 h-full">
          <DetailPanel step={activeStep} />
        </div>

        {/* Right Panel: Audit summary & controls */}
        <div className="lg:col-span-4 h-full">
          <AuditPanel
            analysis={run.analysis}
            onStatusChange={handleGovernanceStatusChange}
          />
        </div>
      </div>

      {/* Raw Trace Dump collapsible */}
      <details className="group border border-slate-900/60 rounded-xl overflow-hidden bg-slate-950/20">
        <summary className="px-4 py-3 text-xs font-bold text-slate-400 hover:text-slate-200 cursor-pointer select-none flex items-center justify-between">
          <span className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-slate-500" />
            View Original Raw Execution Log
          </span>
          <span className="text-[10px] font-mono border border-slate-800 px-1.5 py-0.5 rounded bg-slate-900 group-open:hidden">
            Expand Log
          </span>
          <span className="text-[10px] font-mono border border-slate-800 px-1.5 py-0.5 rounded bg-slate-900 hidden group-open:inline">
            Collapse Log
          </span>
        </summary>
        <div className="p-4 border-t border-slate-900/60 bg-slate-950">
         <pre className="text-xs font-mono text-slate-400 overflow-x-auto whitespace-pre-wrap leading-relaxed p-3 bg-[#070b13] rounded border border-slate-900">
           {run.rawLog}
         </pre>
        </div>
      </details>
    </div>
  );
}

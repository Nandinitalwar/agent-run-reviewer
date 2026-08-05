"use client";

import React, { useState, useRef } from "react";
import { Upload, FileJson, Play, Sparkles, CheckSquare, AlertCircle, FileText } from "lucide-react";
import { Button } from "./UI/Button";
import { Card } from "./UI/Card";
import { analyzeAndSaveLog } from "@/app/actions/analyze";

const SAMPLE_SUCCESS = {
  goal: "Generate sales proposal for Acme Corp",
  steps: [
    {
      step: 1,
      action: "Retrieve CRM Account details",
      status: "success",
      duration: 1.8,
      tool: "CRM_Connector",
      input: "Acme Corp (ID: 99812)",
      output: "Account name: Acme Corp, Tier: Enterprise, Owner: Sarah Jenkins"
    },
    {
      step: 2,
      action: "Retrieve Enterprise Pricing Policy",
      status: "success",
      duration: 2.1,
      tool: "PricingAPI",
      input: "Query: discount_tier_enterprise",
      output: "Discount level: 20% on licensing, Standard support included"
    },
    {
      step: 3,
      action: "Generate Custom Proposal Document",
      status: "success",
      duration: 5.4,
      tool: "DocumentService",
      input: "Template: sales_proposal_v4, Discount: 20%",
      output: "Successfully generated PDF. S3 URL: s3://proposals/acme-corp-custom.pdf"
    }
  ]
};

const SAMPLE_FAILURE = {
  goal: "Process financial transaction and sync ledger",
  steps: [
    {
      step: 1,
      action: "Authenticate API credentials",
      status: "success",
      duration: 1.2,
      tool: "AuthManager",
      input: "Client Token: token_env_prod_221a",
      output: "Auth successful. Scope: write_transactions"
    },
    {
      step: 2,
      action: "Retrieve Account Balances",
      status: "success",
      duration: 2.5,
      tool: "BankingGateway",
      input: "Account: 990112441",
      output: "Checking balance: $120,450.00, Overdraft protection: True"
    },
    {
      step: 3,
      action: "Check Compliance Limit rules",
      status: "success",
      duration: 1.4,
      tool: "ComplianceEngine",
      input: "Transaction size: $150,000.00",
      output: "Triggered alert: Single transaction exceed standard limit. Requires additional legal validation."
    },
    {
      step: 4,
      action: "Legal Transaction Validation",
      status: "failed",
      duration: 0.3,
      error: "Unsupported compliance clause detected or transaction limit exceeded without a signed digital waiver.",
      tool: "LegalScanner",
      input: "Validation: override_limit=false",
      output: "Transaction blocked."
    }
  ]
};

export default function UploadForm() {
  const [logContent, setLogContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    setError(null);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      await loadFile(file);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      await loadFile(file);
    }
  };

  const loadFile = (file: File): Promise<void> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        setLogContent(text);
        resolve();
      };
      reader.onerror = () => {
        setError("Failed to read selected file.");
        resolve();
      };
      reader.readAsText(file);
    });
  };

  const handleLoadSample = (sample: typeof SAMPLE_SUCCESS) => {
    setLogContent(JSON.stringify(sample, null, 2));
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!logContent.trim()) {
      setError("Please paste or upload execution log content first.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("logContent", logContent);
      await analyzeAndSaveLog(formData);
    } catch (err: any) {
      console.error("Analysis submission error:", err);
      setError(err?.message || "An unexpected error occurred during log evaluation.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Upload className="w-5 h-5 text-indigo-400" />
            Upload New Execution Log
          </h2>
          <p className="text-sm text-slate-400">
            Paste raw JSON, structured steps, or arbitrary plain text logs from your agents.
          </p>
        </div>

        {/* Quick Sample Selectors */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider mr-1">Load Demo:</span>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => handleLoadSample(SAMPLE_SUCCESS)}
            className="hover:border-emerald-500/30 text-slate-300"
          >
            <CheckSquare className="w-3.5 h-3.5 text-emerald-500" />
            Success Run
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => handleLoadSample(SAMPLE_FAILURE)}
            className="hover:border-rose-500/30 text-slate-300"
          >
            <AlertCircle className="w-3.5 h-3.5 text-rose-500" />
            Failure Run
          </Button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Drag & Drop/Paste Area */}
        <div
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          className={`relative group border-2 border-dashed rounded-xl transition-all duration-200 ${
            dragActive
              ? "border-indigo-500 bg-indigo-500/5"
              : logContent
              ? "border-slate-700 bg-slate-900/20"
              : "border-slate-800 bg-slate-900/40 hover:border-slate-700/80"
          }`}
        >
          <textarea
            value={logContent}
            onChange={(e) => setLogContent(e.target.value)}
            placeholder={`Paste log JSON here...\nExample format:\n{\n  "goal": "Generate sales report",\n  "steps": [\n    { "step": 1, "action": "Query CRM", "status": "success" }\n  ]\n}`}
            className="w-full min-h-[280px] p-4 bg-transparent text-slate-100 font-mono text-sm placeholder-slate-600 focus:outline-none resize-y"
            disabled={isSubmitting}
          />

          {!logContent && (
            <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center text-center p-6 space-y-2">
              <div className="p-3 bg-slate-800/40 border border-slate-700/60 rounded-xl group-hover:scale-105 transition-transform duration-200">
                <FileJson className="w-8 h-8 text-slate-400" />
              </div>
              <p className="text-sm font-medium text-slate-300">
                Drag & drop your JSON / TXT file here, or click to browse
              </p>
              <p className="text-xs text-slate-500">
                Supports standard Agent JSON schemas & text traces
              </p>
            </div>
          )}

          {/* Trigger browse on background click (only if empty) */}
          {!logContent && (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              disabled={isSubmitting}
            />
          )}
        </div>

        {/* Input file control hidden */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept=".json,.txt,.log"
          className="hidden"
        />

        {error && (
          <div className="flex items-start gap-3 p-3.5 bg-rose-500/10 border border-rose-500/25 rounded-lg text-rose-400 text-sm">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold">Analysis Failed:</span> {error}
            </div>
          </div>
        )}

        <div className="flex items-center justify-between">
          <div className="text-xs text-slate-500 flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5" />
            {logContent ? `${logContent.length} characters parsed` : "No log file loaded"}
          </div>

          <div className="flex items-center gap-3">
            {logContent && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setLogContent("")}
                disabled={isSubmitting}
              >
                Clear
              </Button>
            )}
            <Button
              type="submit"
              disabled={isSubmitting || !logContent}
              className="min-w-[150px] shadow-lg shadow-indigo-600/15"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Analyzing Trace...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Evaluate Run
                </>
              )}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}

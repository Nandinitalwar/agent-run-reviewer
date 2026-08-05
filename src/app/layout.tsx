import React from "react";
import type { Metadata } from "next";
import { ShieldCheck, Activity, Terminal } from "lucide-react";
import "./globals.css";

export const metadata: Metadata = {
  title: "Agent Run Reviewer — Enterprise Observability & AI Governance",
  description: "Understand, debug, audit, and govern autonomous AI agent runs using structured Gemini evaluations.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased selection:bg-indigo-500/30 selection:text-white">
        <div className="min-h-screen flex flex-col bg-[#0b0f19]">
          {/* Top Observability Bar */}
          <header className="sticky top-0 z-50 border-b border-slate-800 bg-[#0b0f19]/80 backdrop-blur-md px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 rounded-lg bg-indigo-500/10 border border-indigo-500/25 text-indigo-400">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-sm font-bold tracking-tight text-white uppercase">
                    Agent Run Reviewer
                  </h1>
                  <span className="text-[10px] font-extrabold font-mono px-1.5 py-0.5 rounded bg-indigo-500/15 text-indigo-300">
                    MVP
                  </span>
                </div>
                <p className="text-[10px] font-medium text-slate-500">
                  Enterprise AI Agent Governance & Observability Platform
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <a
                href="/"
                className="text-xs font-semibold text-slate-400 hover:text-white transition-colors"
              >
                Upload Center
              </a>
              <div className="h-4 w-px bg-slate-800" />
              <div className="flex items-center gap-1 text-[10px] font-mono text-slate-500">
                <Terminal className="w-3.5 h-3.5" />
                <span>v0.1.0</span>
              </div>
            </div>
          </header>

          {/* Main Workspace Frame */}
          <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
            {children}
          </main>

          {/* Footer Branding */}
          <footer className="border-t border-slate-900 bg-slate-950/20 py-4 px-6 text-center text-xs text-slate-600">
            &copy; 2026 Google AI Platform Solution Architects. All rights reserved. Built with Gemini 1.5.
          </footer>
        </div>
      </body>
    </html>
  );
}

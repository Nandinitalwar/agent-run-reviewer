import React from "react";
import { AlertCircle, ChevronLeft } from "lucide-react";
import { getRunById } from "@/lib/db";
import { RunDashboard } from "@/components/Dashboard/RunDashboard";
import { Card } from "@/components/UI/Card";
import { Button } from "@/components/UI/Button";

interface RunPageProps {
  params: {
    id: string;
  };
}

export const revalidate = 0; // Prevent Next.js from caching dynamic params

export default function RunPage({ params }: RunPageProps) {
  const run = getRunById(params.id);

  if (!run) {
    return (
      <div className="max-w-xl mx-auto space-y-6 pt-12 text-center">
        <Card className="p-8 border-rose-500/20 bg-rose-500/5 space-y-4">
          <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
          <h2 className="text-xl font-bold text-white leading-none">
            Audit Run Not Found
          </h2>
          <p className="text-sm text-slate-400">
            We couldn't find an audited execution log matching the reference ID{" "}
            <span className="font-mono font-bold text-indigo-400">"{params.id}"</span>. 
            It may have been cleared or expired.
          </p>
          <div className="pt-2">
            <a href="/">
              <Button variant="secondary" size="md" className="mx-auto">
                <ChevronLeft className="w-4 h-4" />
                Return to Upload Center
              </Button>
            </a>
          </div>
        </Card>
      </div>
    );
  }

  return <RunDashboard initialRun={run} />;
}

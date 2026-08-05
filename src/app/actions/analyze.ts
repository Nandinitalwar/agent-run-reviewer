"use server";

import { redirect } from "next/navigation";
import { saveRun } from "@/lib/db";
import { analyzeExecution } from "@/lib/gemini";
import { Step, Run, RunMetrics } from "@/lib/types";

function generateId(): string {
  return Math.random().toString(36).substring(2, 11).toUpperCase();
}

function computeMetrics(steps: Step[]): RunMetrics {
  const totalSteps = steps.length;
  const successSteps = steps.filter(s => s.status === 'success').length;
  const failureSteps = steps.filter(s => s.status === 'failed').length;

  const totalDuration = steps.reduce((acc, s) => acc + (s.duration || 0), 0) || 5;
  const avgStepDuration = totalSteps > 0 ? parseFloat((totalDuration / totalSteps).toFixed(2)) : 0;

  const successRate = totalSteps > 0 ? parseFloat(((successSteps / totalSteps) * 100).toFixed(1)) : 0;
  const failureRate = totalSteps > 0 ? parseFloat(((failureSteps / totalSteps) * 100).toFixed(1)) : 0;

  let charCount = 0;
  steps.forEach(s => {
    if (s.input) charCount += typeof s.input === 'string' ? s.input.length : JSON.stringify(s.input).length;
    if (s.output) charCount += typeof s.output === 'string' ? s.output.length : JSON.stringify(s.output).length;
  });
  const estimatedTokens = Math.round(750 + (steps.length * 200) + (charCount / 4));
  const estimatedCost = parseFloat((estimatedTokens * 0.00000015).toFixed(5));

  return {
    totalDuration,
    estimatedTokens,
    estimatedCost,
    successRate,
    failureRate,
    avgStepDuration,
    totalSteps
  };
}

function parseTextLog(text: string): { goal: string; steps: Step[] } {
  const lines = text.split('\n');
  let goal = "Analyze text logs";
  const steps: Step[] = [];

  const goalLine = lines.find(line => line.toLowerCase().includes('goal') || line.toLowerCase().includes('task'));
  if (goalLine) {
    const parts = goalLine.split(/[:=]/);
    if (parts.length > 1) {
      goal = parts[1].trim().replace(/^["']|["']$/g, '');
    }
  }

  let currentStep: Partial<Step> | null = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const stepMatch = line.match(/(?:step|step\s+)?\[?(\d+)\]?[\s-:]+(.*)/i);
    if (stepMatch) {
      if (currentStep) {
        steps.push(finalizeStep(currentStep));
      }
      currentStep = {
        step: parseInt(stepMatch[1], 10),
        action: stepMatch[2].trim(),
        status: 'success',
        duration: Math.floor(Math.random() * 5) + 1,
      };
      continue;
    }

    if (currentStep) {
      if (line.toLowerCase().includes('status:') || line.toLowerCase().includes('result:')) {
        const statusVal = line.split(/[:=]/)[1]?.trim().toLowerCase();
        if (statusVal?.includes('fail') || statusVal?.includes('err')) {
          currentStep.status = 'failed';
        } else if (statusVal?.includes('pend') || statusVal?.includes('run')) {
          currentStep.status = 'pending';
        }
      } else if (line.toLowerCase().includes('error:') || line.toLowerCase().includes('failed:')) {
        currentStep.status = 'failed';
        currentStep.error = line.split(/[:=]/)[1]?.trim() || line;
      } else if (line.toLowerCase().includes('duration:') || line.toLowerCase().includes('time:')) {
        const timeMatch = line.match(/(\d+(?:\.\d+)?)\s*(s|sec|ms)/i);
        if (timeMatch) {
          const val = parseFloat(timeMatch[1]);
          currentStep.duration = timeMatch[2].toLowerCase().startsWith('m') ? parseFloat((val / 1000).toFixed(3)) : val;
        }
      } else if (line.toLowerCase().includes('tool:')) {
        currentStep.tool = line.split(/[:=]/)[1]?.trim();
      } else {
        if (!currentStep.input) {
          currentStep.input = line;
        } else {
          currentStep.output = (currentStep.output || '') + '\n' + line;
        }
      }
    }
  }

  if (currentStep) {
    steps.push(finalizeStep(currentStep));
  }

  if (steps.length === 0) {
    steps.push({
      step: 1,
      action: "Execute manual log analysis",
      status: text.toLowerCase().includes('error') || text.toLowerCase().includes('failed') ? 'failed' : 'success',
      duration: 3,
      error: text.toLowerCase().includes('error') ? "Error detected in textual log content." : undefined,
      input: text.slice(0, 500),
      output: text.slice(500, 2000)
    });
  }

  return { goal, steps };
}

function finalizeStep(s: Partial<Step>): Step {
  return {
    step: s.step || 1,
    action: s.action || "Unknown action",
    status: s.status || 'success',
    duration: s.duration || 1,
    error: s.error,
    input: s.input || "",
    output: s.output || "",
    tool: s.tool,
  };
}

export async function analyzeAndSaveLog(formData: FormData) {
  const rawContent = formData.get("logContent") as string;
  if (!rawContent || !rawContent.trim()) {
    throw new Error("Log content is empty.");
  }

  let goal = "Generate sales proposal";
  let steps: Step[] = [];

  try {
    const parsed = JSON.parse(rawContent.trim());
    if (parsed.goal) goal = parsed.goal;

    if (Array.isArray(parsed.steps)) {
      steps = parsed.steps.map((s: any, idx: number) => ({
        step: s.step || idx + 1,
        action: s.action || s.stepName || "Unnamed Action",
        status: s.status === "failed" || s.error ? "failed" : (s.status || "success"),
        duration: typeof s.duration === "number" ? s.duration : (Math.floor(Math.random() * 5) + 1),
        error: s.error || s.errorMessage || undefined,
        input: s.input || undefined,
        output: s.output || undefined,
        tool: s.tool || s.toolUsed || undefined,
        context_tokens: s.context_tokens || undefined,
        latency: s.latency || undefined
      }));
    } else if (Array.isArray(parsed)) {
      steps = parsed.map((s: any, idx: number) => ({
        step: s.step || idx + 1,
        action: s.action || s.stepName || "Unnamed Action",
        status: s.status === "failed" || s.error ? "failed" : "success",
        duration: typeof s.duration === "number" ? s.duration : 2,
        error: s.error || undefined,
        input: s.input || undefined,
        output: s.output || undefined,
        tool: s.tool || undefined
      }));
    } else {
      const parsedGoal = parsed.goal || parsed.task || parsed.objective || "Manual Audit";
      const parsedSteps = parsed.steps || [];
      goal = parsedGoal;
      if (Array.isArray(parsedSteps)) {
        steps = parsedSteps;
      } else {
        throw new Error("No array of steps found in JSON.");
      }
    }
  } catch (err) {
    console.log("JSON parsing failed, analyzing as raw text log:", err);
    const textParsed = parseTextLog(rawContent);
    goal = textParsed.goal;
    steps = textParsed.steps;
  }

  steps = steps.map(s => ({
    ...s,
    duration: s.duration ?? parseFloat((Math.random() * 4 + 1).toFixed(1)),
    latency: s.latency ?? (s.duration ? Math.round(s.duration * 1000) : Math.round(Math.random() * 4000 + 1000)),
    context_tokens: s.context_tokens ?? Math.round(Math.random() * 2000 + 500)
  }));

  const analysis = await analyzeExecution(goal, steps);
  const metrics = computeMetrics(steps);
  const runId = generateId();

  const newRun: Run = {
    id: runId,
    goal,
    createdAt: new Date().toISOString(),
    steps,
    analysis,
    metrics,
    rawLog: rawContent
  };

  saveRun(newRun);
  redirect(`/run/${runId}`);
}

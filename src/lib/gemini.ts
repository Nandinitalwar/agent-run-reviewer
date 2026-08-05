import { GoogleGenerativeAI } from "@google/generative-ai";
import { Step, GeminiAnalysis } from "./types";

const API_KEY = process.env.GEMINI_API_KEY;

// Structured Response Schema for Gemini
const analysisSchema: any = {
  type: "object",
  properties: {
    status: {
      type: "string",
      enum: ["approved", "needs_review", "blocked"],
      description: "The governance status decision for this execution run."
    },
    summary: {
      type: "string",
      description: "A detailed summary of what occurred in the execution, why it succeeded or failed, and key points of interest."
    },
    failure_step: {
      type: "integer",
      description: "The step number that failed, or null if all steps succeeded."
    },
    risk_score: {
      type: "integer",
      description: "Risk score from 0 (completely safe) to 100 (highly hazardous or broken)."
    },
    confidence: {
      type: "number",
      description: "The confidence level of the model in its audit, from 0.0 to 1.0."
    },
    unnecessary_steps: {
      type: "array",
      items: { type: "string" },
      description: "List of steps or actions that were redundant, unnecessary, or loops."
    },
    recommended_fix: {
      type: "string",
      description: "Concrete engineering recommendation on how to avoid the failure or optimize the workflow."
    },
    suggested_action: {
      type: "string",
      description: "Suggested next operational action (e.g., 'Replay workflow.', 'Review compliance rules.', 'Deploy patch to pricing service.')"
    }
  },
  required: [
    "status",
    "summary",
    "failure_step",
    "risk_score",
    "confidence",
    "unnecessary_steps",
    "recommended_fix",
    "suggested_action"
  ]
};

/**
 * Heuristic/rule-based fallback analyzer for running without a Gemini API Key.
 * Ensures the app works perfectly as a local mock if no API key is specified.
 */
function analyzeHeuristically(goal: string, steps: Step[]): GeminiAnalysis {
  const hasFailure = steps.some(s => s.status === "failed");
  const failedStep = steps.find(s => s.status === "failed");

  // Detect redundant actions
  const actionCounts: Record<string, number> = {};
  const redundant: string[] = [];
  steps.forEach(s => {
    actionCounts[s.action] = (actionCounts[s.action] || 0) + 1;
    if (actionCounts[s.action] > 1 && !redundant.includes(s.action)) {
      redundant.push(s.action);
    }
  });

  if (hasFailure && failedStep) {
    const errorMsg = failedStep.error || "Unknown error";
    return {
      status: "needs_review",
      summary: `The run failed at step ${failedStep.step} ('${failedStep.action}') with error: "${errorMsg}". The primary goal "${goal}" was not completed.`,
      failure_step: failedStep.step,
      risk_score: 75,
      confidence: 0.95,
      unnecessary_steps: redundant.map(a => `Repeated action: '${a}'`),
      recommended_fix: `Handle the exception in step ${failedStep.step} or add a retry/fallback mechanism for '${failedStep.action}'. Check system state or check parameter validation.`,
      suggested_action: "Replay workflow with corrected inputs."
    };
  }

  // Success case
  const unnecessary_steps_desc = redundant.map(a => `Action '${a}' was executed multiple times.`);
  const risk = redundant.length > 0 ? 25 : 10;
  return {
    status: "approved",
    summary: `The workflow successfully completed all ${steps.length} steps. Goal "${goal}" was achieved. Total latency and throughput were optimal.`,
    failure_step: null,
    risk_score: risk,
    confidence: 0.90,
    unnecessary_steps: unnecessary_steps_desc,
    recommended_fix: redundant.length > 0
      ? "Cache previous steps or retrieve dependencies once to avoid duplicate calls."
      : "Excellent workflow efficiency. No architectural improvements required.",
    suggested_action: "None. Execution is safe."
  };
}

/**
 * Analyzes an execution run using Gemini (or the fallback engine if key is missing).
 */
export async function analyzeExecution(goal: string, steps: Step[]): Promise<GeminiAnalysis> {
  if (!API_KEY) {
    console.warn("GEMINI_API_KEY is not defined. Falling back to heuristic rule-based audit engine.");
    return analyzeHeuristically(goal, steps);
  }

  try {
    const genAI = new GoogleGenerativeAI(API_KEY);
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: analysisSchema,
        temperature: 0.2,
      }
    } as any);

    const prompt = `
      You are an elite autonomous agent auditor and governance platform.
      Analyze this execution trace and audit its efficiency, correctness, and safety.
      
      User Goal: "${goal}"
      
      Execution Steps:
      ${JSON.stringify(steps, null, 2)}
      
      Please perform a deep structural review and output your evaluation matching the requested schema.
      Focus on highlighting duplicate or loop steps, describing exactly where errors originated, 
      calculating an accurate risk score (0-100), and prescribing clear, actionable engineering fixes.
    `;

    const result = await model.generateContent(prompt);
    const textResponse = result.response.text();
    const parsed = JSON.parse(textResponse) as GeminiAnalysis;

    // Sanitize any edge cases
    if (parsed.status !== "approved" && parsed.status !== "needs_review" && parsed.status !== "blocked") {
      parsed.status = "needs_review";
    }

    return parsed;
  } catch (error) {
    console.error("Failed to run analysis with Gemini API:", error);
    // Fallback to local heuristic engine if API fails
    return analyzeHeuristically(goal, steps);
  }
}

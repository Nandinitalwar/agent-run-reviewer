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
      description: "The governance status decision for this execution run based on developer safety and tool reliability."
    },
    summary: {
      type: "string",
      description: "A developer-oriented trace analysis detailing what parts of the execution succeeded, where debugging friction occurred, and how much session productivity was affected."
    },
    failure_step: {
      type: "integer",
      description: "The step number that failed, or null if all steps succeeded."
    },
    risk_score: {
      type: "integer",
      description: "Friction and runtime risk score from 0 (highly performant and clean) to 100 (heavily bottlenecked, broken, or loop-locked)."
    },
    confidence: {
      type: "number",
      description: "The confidence level of the model in its developer optimization audit, from 0.0 to 1.0."
    },
    unnecessary_steps: {
      type: "array",
      items: { type: "string" },
      description: "List of steps or API calls that were redundant, causing waste of local session time or unnecessary token consumption."
    },
    recommended_fix: {
      type: "string",
      description: "Concrete developer code refactoring recommendation, mock utilities, or structural optimizations to accelerate development velocity."
    },
    suggested_action: {
      type: "string",
      description: "Suggested next engineering tool, SDK, or framework to integrate (e.g. 'Setup Mock Service Worker (MSW) to stub PricingAPI', 'Integrate Langsmith SDK for full state tracking', 'Cache CRM queries using an in-memory Redis cache')."
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
      summary: `Execution failed at step ${failedStep.step} ('${failedStep.action}') with error: "${errorMsg}". This error blocks active developer session productivity. Total trace analysis indicates an opportunity to add mock endpoints or use standard SDK exception boundaries.`,
      failure_step: failedStep.step,
      risk_score: 75,
      confidence: 0.95,
      unnecessary_steps: redundant.map(a => `Repeated redundant action: '${a}'`),
      recommended_fix: `Add a structured error boundary in your code around '${failedStep.action}'. To speed up local debugging without waiting for external API latency, use MSW (Mock Service Worker) or set up a local wiremock utility for '${failedStep.tool || "the service"}'.`,
      suggested_action: "Integrate Langsmith or Langfuse SDK to automatically snapshot runtime variable states and inspect payload boundaries."
    };
  }

  // Success case
  const unnecessary_steps_desc = redundant.map(a => `Action '${a}' was executed multiple times, creating a network/token bottleneck.`);
  const risk = redundant.length > 0 ? 25 : 10;
  return {
    status: "approved",
    summary: `Successfully achieved goal "${goal}" in ${steps.length} steps. All code-paths ran optimally. However, developer productivity can be optimized further by streamlining dependency retrievals.`,
    failure_step: null,
    risk_score: risk,
    confidence: 0.90,
    unnecessary_steps: unnecessary_steps_desc,
    recommended_fix: redundant.length > 0
      ? `To accelerate local development and reduce API latency, cache previous steps or implement a local cache (e.g. Redis/node-cache) for '${redundant[0]}'.`
      : "Excellent trace efficiency. To further isolate integration logic, consider separating your integration hooks from the core orchestrator state machine.",
    suggested_action: "Adopt a formal tool registry layout (like LangChain Tools or custom agent executors) to cleanly separate business logic from API integrations."
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
      You are an elite autonomous agent developer-experience (DX) auditor and tooling architect.
      Analyze this execution trace and audit its efficiency, correctness, and tooling opportunities.
      Your goal is to show clear, actionable improvements for developers to speed up their development lifecycle,
      improve local session productivity, reduce runtime latencies, and suggest specific developer tools,
      tracing libraries, or mocking utilities they can work on/integrate.
      
      User Goal: "${goal}"
      
      Execution Steps:
      ${JSON.stringify(steps, null, 2)}
      
      Please perform a deep developer-centric review and output your evaluation matching the requested schema.
      Focus on suggesting specific tools (like Langsmith, Langfuse, MSW, WireMock, Redis, Axios interceptors),
      identifying redundant API/tool requests, proposing modular refactoring (e.g., separating core logic from tool hooks),
      and prescribing direct, code-level optimizations that immediately 10x developer debugging productivity.
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

export interface Step {
  step: number;
  action: string;
  status: 'success' | 'failed' | 'pending';
  duration?: number; // duration in seconds
  error?: string;
  input?: string | any;
  output?: string | any;
  tool?: string;
  context_tokens?: number;
  latency?: number; // step latency in ms
}

export interface GeminiAnalysis {
  status: 'approved' | 'needs_review' | 'blocked';
  summary: string;
  failure_step: number | null;
  risk_score: number; // 0 to 100
  confidence: number; // 0.0 to 1.0
  unnecessary_steps: string[];
  recommended_fix: string;
  suggested_action: string;
}

export interface RunMetrics {
  totalDuration: number; // in seconds
  estimatedTokens: number;
  estimatedCost: number; // in USD
  successRate: number; // percentage
  failureRate: number; // percentage
  avgStepDuration: number; // in seconds
  totalSteps: number;
}

export interface Run {
  id: string;
  goal: string;
  createdAt: string;
  steps: Step[];
  analysis: GeminiAnalysis;
  metrics: RunMetrics;
  rawLog: string;
}

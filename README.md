# Agent Run Reviewer

Local review console for turning agent execution traces into structured,
inspectable audits. Paste JSON or text logs to reconstruct the trajectory,
calculate run metrics, identify failed or redundant steps, and receive a typed
review from Gemini or a deterministic offline fallback.

## Architecture

```text
JSON/text trace
  -> parser + normalized step schema
  -> deterministic metrics
  -> structured Gemini evaluator
  -> local run store
  -> timeline, risk, and remediation views
```

The evaluator returns a constrained schema containing the decision
(`approved`, `needs_review`, or `blocked`), failure location, risk score,
confidence, redundant actions, and a concrete remediation. If `GEMINI_API_KEY`
is absent or inference fails, a rule-based analyzer keeps the review workflow
usable offline.

## Input

```json
{
  "goal": "Research a company and draft a brief",
  "steps": [
    {
      "step": 1,
      "action": "Search the web",
      "status": "success",
      "duration": 1.8,
      "tool": "search",
      "input": "example query",
      "output": "three results"
    }
  ]
}
```

Plain-text logs are also accepted. The parser recognizes numbered steps,
statuses, errors, tools, and durations, then preserves the original log beside
the normalized run.

## Run locally

Requires Node.js 20+.

```bash
npm install
cp .env.example .env.local  # optional
npm run dev
```

Open `http://localhost:3080`. Set `GEMINI_API_KEY` in `.env.local` to enable
model-based review; otherwise the deterministic fallback is used.

```bash
npm run build
```

## Data boundary

Runs are stored in `data/db.json` on the local machine and are not committed.
Agent traces may contain prompts, tool arguments, or model outputs, so review
and redact them before sharing outside their original environment.

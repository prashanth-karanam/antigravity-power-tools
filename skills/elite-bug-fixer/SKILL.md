---
name: elite-bug-fixer
description: Adversarial micro-auditing and surgical root-cause debugging protocol for resolving complex code bugs, edge cases, stack traces, and logical errors using Constitutional self-critique, defensive programming, and mathematical deductive tracing.
---

# 🎯 THE ELITE BUG-FIXER PROTOCOL (Adversarial Micro-Auditor Edition)

Execute this protocol whenever investigating or resolving software bugs, runtime crashes, test failures, subtle edge cases, or logical anomalies.

---

## 1. 🔍 Empirical Log Inspection & Comfortable Cautiousness
- **No Blind Guessing:** NEVER form a diagnostic hypothesis or guess schemas/paths without reading the exact stack trace, error log, or runtime state first.
- **Rigorous Clarification:** Treat missing information or ambiguous requirements as blockers. If a bug's expected behavior on null/boundary inputs is unspecified, pause and highlight the ambiguity instead of guessing.

## 2. 🧮 Mathematical Deductive Tracing (Proof over Pattern Matching)
- Perform step-by-step state tracing along the execution path. Trace variables line-by-line: `State A -> Mutation -> State B`.
- Construct a **Boundary Matrix**: Evaluate how the code handles `null`/`undefined`, zero/negative numbers, empty arrays, async timing/concurrency, and off-by-one limits before drafting code.

## 3. 🛡️ Defensive & Adversarial Programming
- Assume code will execute in a hostile environment where inputs may be malformed and operations may fail.
- Every function patch MUST automatically include boundary validation, explicit type checks, and concurrency safeguards without relying on "happy path" assumptions.
- **Fix Root Cause, Not Symptoms:** Never resolve bugs by wrapping failing calls in silent `try/catch` blocks or adding superficial null checks (`if (x != null)`) to suppress errors. Trace and repair the upstream contract break.

## 4. 🔄 Aggressive Strategy Backtracking (Strict "Rule of Two")
- **Pass 1:** Test the most direct hypothesis derived from empirical logs and deductive tracing.
- **Pass 2 (Pivot & Reset):** If a proposed solution fails, DO NOT stack another patch on top of it. Discard the hypothesis completely, revert the workspace to a clean state, re-examine baseline assumptions, and pivot to an entirely different diagnostic angle.

## 5. ⚖️ Constitutional Self-Critique Loop
Before finalizing any code fix or presenting an answer, execute a silent critique pass asking:
- *"What hidden assumptions did I just make?"*
- *"Is this solution hacky, or is it logically pure?"*
- *"Did I actually fix the root cause, or just wrap the symptom?"*
- *"Have I guarded against all boundary edge cases?"*

## 6. ✅ Mandatory Verification Before Success
- NEVER declare a bug fixed based on static code inspection alone.
- Execute unit tests, linters, or runtime build verification commands to empirically demonstrate that the failure condition is resolved and no regressions were introduced.

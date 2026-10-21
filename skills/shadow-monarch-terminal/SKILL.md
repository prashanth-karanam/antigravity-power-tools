---
name: shadow-monarch-terminal
description: Sovereign terminal execution engine for absolute zero-hallucination command mastery, autonomous diagnostic self-healing, native polyglot scripting, and unyielding root-cause problem solving.
---

# 👑 SHADOW MONARCH TERMINAL (UNIVERSAL BOSS S-RANK)

The sovereign execution protocol for dominating the terminal environment. Eliminates mid-execution hallucinations, self-doubt loops, fragile command chains, and tool stumbling through deterministic self-healing and zero-assumption native scripting.

---

## 🏛️ The 6 Pillars of Sovereign Dominion

```
┌────────────────────────────────────────────────────────────────────────┐
│                   SHADOW MONARCH TERMINAL ARCHITECTURE                 │
├────────────────────────────────────────────────────────────────────────┤
│ 1. 👑 Sovereign Pre-Flight Probing (Zero-Assumption Tool Verification) │
│ 2. 🔮 Zero-Hallucination Reality Anchor (Anti-Self-Doubt & Falsify)    │
│ 3. ⚔️ Autonomous Diagnostic Self-Healing (Exit Code / Stderr Triage)   │
│ 4. 🧩 Native Polyglot Scripting Dominance (Zero-Bloat Automation)      │
│ 5. 🎯 Verification & State Convergence (Empirical Mathematical Proof)  │
│ 6. 🛡️ Occam's Scalpel & Anti-Rationalization (Minimal Intervention)    │
└────────────────────────────────────────────────────────────────────────┘
```

---

### 1. 👑 Sovereign Pre-Flight Probing (Zero Assumptions)
- **Principle:** Never assume a tool (`git`, `curl`, `jq`, `python`, `gcc`, `docker`) or specific privilege exists.
- **Protocol:**
  - Probe before invoking: Verify availability via `Get-Command <tool> -ErrorAction SilentlyContinue` (PowerShell) or `command -v <tool>` (POSIX).
  - If missing, immediately pivot to platform-native standard libraries:
    - Replace `curl`/`wget` with `Invoke-RestMethod` / `urllib.request`.
    - Replace `jq` with `ConvertFrom-Json` / `json.loads()`.
    - Replace `sed`/`awk` with regex stream filters or Python one-liners.

---

### 2. 🔮 Zero-Hallucination Reality Anchoring (Anti-Self-Doubt)
- **Principle:** The terminal never lies; error messages are literal clues, not accusations of incompetence.
- **Protocol:**
  - **No Phantom Self-Blame:** When a gate, permission, or command fails, do NOT assume you made a random syntax typo or that the goal is impossible.
  - **Isolate the True Gatekeeper:** Identify whether the blocker is:
    1. *Environment constraint* (missing PATH, execution policy, missing binary).
    2. *State constraint* (file locked, process running, port bound).
    3. *Access boundary* (permissions, auth headers, firewall).
  - **Single-Hypothesis Testing:** Change ONE factor per iteration. Measure output diffs explicitly.

---

### 3. ⚔️ Autonomous Diagnostic Self-Healing (Error Triage)
- **Principle:** Convert every non-zero exit code into immediate, surgical corrective action.
- **Protocol:**
  - **Standard Error Parsing:** Extract the exact line, token, and system error message from `stderr`.
  - **Anti-Loop Breaker:** If a command fails twice with the same stderr signature, abort that vector immediately. Re-evaluate assumptions and employ an alternative diagnostic path.
  - **Process Management:** Handle zombie locks and hung ports gracefully (`Get-Process`, `Stop-Process`, `netstat -ano`).

---

### 4. 🧩 Native Polyglot Scripting Dominance
- **Principle:** Complex automation must run reliably without fragile shell quoting or throwaway file bloat.
- **Protocol:**
  - **Windows PowerShell Execution Hygiene:**
    - Never nest `powershell -Command "python -c '...'"` (causes fatal quotation stripping and `SyntaxError: '(' was never closed`).
    - For inline Python on Windows, pipe a PowerShell heredoc directly into Python (`@' ... '@ | python`) or run the target module directly (`python -m <module>`).
    - **No Scratch Test Bloat:** Do NOT create throwaway `.py` test files (`verify_*.py`, `test_temp.py`) in scratch/brain folders for simple checks. Use inline heredoc execution or native framework runners (`pytest`).
  - Encapsulate non-trivial parsing into structured pipelines with defensive error traps (`try/except`) and timeouts.

---

### 5. 🎯 Verification & State Convergence
- **Principle:** A task is only complete when physical machine state confirms it.
- **Protocol:**
  - Never trust stdout alone. Verify the physical delta:
    - Does the output file exist on disk? Is the file size $> 0$?
    - Is the daemon actually listening on the target socket?
    - Did the test suite return exit code 0 with all assertions passing?
  - Deliver empirical proof of state change with concrete paths and metrics.

---

### 6. 🛡️ Occam's Scalpel & Anti-Rationalization Protocol (Minimal Intervention Invariant)
- **Principle:** Never mutate internal data models or invent complex backend conspiracies when a simple, lazy client-side gate is the true barrier.
- **Protocol:**
  - **The Law of Minimal Intervention:** Knock down only the gate immediately in front of you (e.g., the UI dialog or ad callback). Never rewire internal getters, URLs, or data serialization schemas without empirical proof that the backend actually rejects unmodified requests.
  - **Anti-Phantom-Backend Fallacy:** When a patched script, binary, or API returns unexpected output (e.g., 0-byte files, 20s snippets, or truncated streams), **interrogate your own patch first**. Never invent unverified server-side behavior ("it requires cloud database / KMS manipulation") to rationalize a failure caused by your own byte surgery.
  - **Stream & Protocol Hygiene:** Respect protocol boundaries. Video player buffers (adaptive DASH/HLS manifests or preview segments) are fundamentally distinct from direct multi-threaded file download endpoints. Never substitute one for the other without verifying transport compatibility.
  - **Verify Natural Response First:** Always sniff and record raw, untampered server responses for an operation before attempting synthetic payload injection or model rerouting.

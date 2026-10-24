const http = require('http');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const SCRIPT_PATH = path.join(__dirname, 'studio_ui.js');
const STATE_PATH = path.join(__dirname, 'state.json');
const GEMINI_MD_PATH = 'C:\\Users\\Praashu\\.gemini\\config\\GEMINI.md';
const SKILLS_DIR = 'C:\\Users\\Praashu\\.gemini\\config\\skills';
const DAEMON_HTTP_PORT = 55979;

const BASE_GEMINI_MD = `# Global Execution Guidelines

## Windows Terminal & PowerShell Execution
- **Never nest \`powershell -Command\`**: The terminal shell is already PowerShell. Stacking nested invocations strips inner quotes, causing broken tokens and \`SyntaxError: '(' was never closed\`.
- **Inline Python execution**:
  - Never generate throwaway \`.py\` test files (\`verify_*.py\`, \`temp_test.py\`) for simple one-off checks.
  - For inline execution, pipe a PowerShell heredoc into Python:
    \`\`\`powershell
    @'
    import module
    # test code
    '@ | python
    \`\`\`
  - Or run modules/test runners directly: \`python -m <module>\` or \`pytest\`.
- **Network calls**: Always include explicit timeouts and try/catch around external network requests to prevent unhandled hang or \`getaddrinfo failed\` crashes.
`;

const DOCTRINE_FILES = {
  'byte_operator': path.join(SKILLS_DIR, 'byte-operator', 'SKILL.md'),
  'shadow_monarch': path.join(SKILLS_DIR, 'shadow-monarch-terminal', 'SKILL.md'),
  'claude_planner': path.join(SKILLS_DIR, 'claude-thinking-engine', 'SKILL.md'),
  'elite_bug_fixer': path.join(SKILLS_DIR, 'elite-bug-fixer', 'SKILL.md'),
  'tdd_engineer': path.join(SKILLS_DIR, 'tdd-test-engineer', 'SKILL.md'),
  'security_auditor': path.join(SKILLS_DIR, 'security-auditor', 'SKILL.md')
};

const DOCTRINE_TITLES = {
  'byte_operator': 'BYTE_OPERATOR (Adversary Emulation & Offensive Security Engineer)',
  'shadow_monarch': 'SHADOW_MONARCH (Universal Boss S-Rank Terminal Sovereign)',
  'claude_planner': 'CLAUDE_PLANNER (Claude Thinking Engine & Fable V Multi-Perspective CoT)',
  'elite_bug_fixer': 'ELITE_BUG_FIXER (The Elite Bug-Fixer Protocol: Adversarial Micro-Auditor)',
  'tdd_engineer': 'TDD_ENGINEER (Zero-Regression Test-Driven Development Specialist)',
  'security_auditor': 'SECURITY_AUDITOR (OWASP Top 10 & Defensive Threat Modeler)'
};

// Default State
let appState = {
  activeEngine: 'stock_architect',
  zeroYapMode: false,
  destructiveGuard: false,
  pinnedScratchpad: ''
};

function loadState() {
  try {
    if (fs.existsSync(STATE_PATH)) {
      appState = Object.assign(appState, JSON.parse(fs.readFileSync(STATE_PATH, 'utf8')));
    }
  } catch (e) {}
}

function saveState() {
  try {
    fs.writeFileSync(STATE_PATH, JSON.stringify(appState, null, 2), 'utf8');
  } catch (e) {}
}

loadState();

let lastSyncedGeminiMd = '';

function syncGeminiMd() {
  try {
    let newContent = BASE_GEMINI_MD;

    // 1. Pinned Scratchpad (if present)
    if (appState.pinnedScratchpad && appState.pinnedScratchpad.trim()) {
      newContent += `\n# 📌 PINNED PROJECT CONTEXT & INVARIANTS (Active Session)\n`;
      newContent += `> The user has pinned the following project notes/invariants for this session. Maintain full consistency with these rules:\n\n`;
      newContent += `${appState.pinnedScratchpad.trim()}\n`;
    }

    // 2. Real-User Directives (Zero-Yap & Destructive Guard)
    if (appState.zeroYapMode) {
      newContent += `\n# ⚡ DIRECTIVE: ZERO-YAP / CODE-ONLY MODE ENGAGED\n`;
      newContent += `> Output ONLY code, command execution, or unified diffs. Omit all introductory pleasantries, conversational filler, and concluding recaps.\n`;
    }

    if (appState.destructiveGuard) {
      newContent += `\n# 🛡️ DIRECTIVE: DESTRUCTIVE ACTION SAFETY GUARD ENGAGED\n`;
      newContent += `> MANDATORY: Before executing any command that deletes files, wipes git history (e.g. \`git reset --hard\`, \`git clean\`), or drops databases, you MUST ask the user for confirmation.\n`;
    }

    // 3. Cognitive Engine Protocol
    const docFile = DOCTRINE_FILES[appState.activeEngine];
    const docTitle = DOCTRINE_TITLES[appState.activeEngine] || appState.activeEngine.toUpperCase();

    if (docFile && fs.existsSync(docFile)) {
      const docText = fs.readFileSync(docFile, 'utf8');
      const cleanDoc = docText.replace(/^---[\s\S]*?---\r?\n/, '').trim();
      
      newContent += `\n# ⚡ ACTIVE OPERATIONAL PROTOCOL & MANDATE: ${docTitle}\n\n`;
      newContent += `> [!IMPORTANT]\n`;
      newContent += `> **PRIORITY SYSTEM OVERRIDE**: The operational protocol below is active right now for this turn.\n`;
      newContent += `> You MUST IMMEDIATELY DISREGARD all previous personas, modes, or protocol names claimed in earlier assistant messages.\n`;
      newContent += `> If the user asks which protocol is currently active, your answer is strictly **${docTitle}**.\n\n`;
      newContent += `${cleanDoc}\n`;
    } else {
      newContent += `\n# Active Operational Doctrine: STOCK DEFAULT\n\nStandard Senior Full-Stack Architect.\n`;
    }

    if (newContent !== lastSyncedGeminiMd) {
      lastSyncedGeminiMd = newContent;
      fs.writeFileSync(GEMINI_MD_PATH, newContent, 'utf8');
      log(`SYNCHRONIZED GEMINI.md (engine: ${appState.activeEngine}, zeroYap: ${appState.zeroYapMode}, guard: ${appState.destructiveGuard})`);
    }
  } catch (err) {
    log(`syncGeminiMd error: ${err.message}`);
  }
}

// IPC HTTP Server for Frontend UI
const server = http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const parsedUrl = new URL(req.url, `http://127.0.0.1:${DAEMON_HTTP_PORT}`);

  // Route: /get-state
  if (parsedUrl.pathname === '/get-state') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(appState));
    return;
  }

  // Route: /set-engine?engine=XYZ
  if (parsedUrl.pathname === '/set-engine') {
    const engine = parsedUrl.searchParams.get('engine') || 'stock_architect';
    appState.activeEngine = engine;
    saveState();
    syncGeminiMd();
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: true, appState }));
    return;
  }

  // Route: /set-toggle?key=zeroYapMode&val=true
  if (parsedUrl.pathname === '/set-toggle') {
    const key = parsedUrl.searchParams.get('key');
    const val = parsedUrl.searchParams.get('val') === 'true';
    if (key in appState) {
      appState[key] = val;
      saveState();
      syncGeminiMd();
    }
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: true, appState }));
    return;
  }

  // Route: /set-scratchpad (POST)
  if (parsedUrl.pathname === '/set-scratchpad' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        const parsed = JSON.parse(body);
        appState.pinnedScratchpad = parsed.scratchpad || '';
      } catch (e) {
        appState.pinnedScratchpad = body;
      }
      saveState();
      syncGeminiMd();
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: true, appState }));
    });
    return;
  }

  // Route: /ports-sweep (Check active dev ports: 3000, 5000, 5173, 8000, 8080, etc.)
  if (parsedUrl.pathname === '/ports-sweep') {
    try {
      const devPorts = [3000, 3001, 4200, 5000, 5173, 8000, 8080, 8888, 9000];
      const cmd = `powershell -NoProfile -Command "Get-NetTCPConnection -State Listen -ErrorAction SilentlyContinue | Where-Object { $_.LocalPort -in @(${devPorts.join(',')}) } | Select-Object LocalPort, OwningProcess | ConvertTo-Json"`;
      let output = execSync(cmd).toString().trim();
      let connections = [];
      if (output) {
        try {
          const parsed = JSON.parse(output);
          connections = Array.isArray(parsed) ? parsed : [parsed];
        } catch(e) {}
      }
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: true, connections }));
    } catch (e) {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: false, connections: [], error: e.message }));
    }
    return;
  }

  // Route: /kill-port?port=XYZ
  if (parsedUrl.pathname === '/kill-port') {
    const port = parseInt(parsedUrl.searchParams.get('port'));
    if (port) {
      try {
        execSync(`powershell -NoProfile -Command "$conn = Get-NetTCPConnection -LocalPort ${port} -State Listen -ErrorAction SilentlyContinue; if ($conn) { Stop-Process -Id $conn.OwningProcess -Force }"`);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, killedPort: port }));
        return;
      } catch (e) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: e.message }));
        return;
      }
    }
  }

  res.writeHead(404);
  res.end();
});

server.listen(DAEMON_HTTP_PORT, '127.0.0.1', () => {
  log(`Power Daemon listening on http://127.0.0.1:${DAEMON_HTTP_PORT}`);
});

function log(msg) {
  const ts = new Date().toISOString();
  console.log(`[PowerDaemon ${ts}] ${msg}`);
}

function getCandidatePorts() {
  try {
    const raw = execSync('cmd /c "netstat -ano -p tcp | findstr LISTENING | findstr 127.0.0.1:"', { timeout: 2000 }).toString();
    const ports = [];
    const lines = raw.split(/\r?\n/);
    for (const line of lines) {
      const match = line.trim().match(/127\.0\.0\.1:(\d+)/);
      if (match) {
        const port = parseInt(match[1], 10);
        if (port >= 1024 && port !== DAEMON_HTTP_PORT && !ports.includes(port)) {
          ports.push(port);
        }
      }
    }
    return ports;
  } catch(e) {
    return [57163, 60812, 50632, 55968, 62386];
  }
}

async function findWorkingCdpPort() {
  const ports = getCandidatePorts();
  for (const port of ports) {
    const ok = await new Promise((res) => {
      const req = http.get(`http://127.0.0.1:${port}/json/version`, { timeout: 400 }, r => {
        let d = ''; r.on('data', c => d += c);
        r.on('end', () => res(d.includes('Antigravity') && d.includes('webSocketDebuggerUrl')));
      });
      req.on('error', () => res(false));
      req.on('timeout', () => { req.destroy(); res(false); });
    });
    if (ok) return port;
  }
  return null;
}

async function getPageTarget(port) {
  return new Promise((resolve) => {
    const req = http.get(`http://127.0.0.1:${port}/json`, { timeout: 1500 }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const list = JSON.parse(data);
          const page = list.find(t => t.type === 'page' && t.webSocketDebuggerUrl && (t.title.includes('Antigravity') || t.url.includes('/c/')));
          resolve(page || list.find(t => t.type === 'page' && t.webSocketDebuggerUrl) || null);
        } catch (e) {
          resolve(null);
        }
      });
    });
    req.on('error', () => resolve(null));
    req.on('timeout', () => { req.destroy(); resolve(null); });
  });
}

function extractConvId(url) {
  if (!url) return null;
  const match = url.match(/\/c\/([a-f0-9-]+)/);
  return match ? match[1] : null;
}

function getTodayTotalBurn() {
  const brainDir = 'C:\\Users\\Praashu\\.gemini\\antigravity\\brain';
  const todayStr = new Date().toISOString().slice(0, 10);
  let total = 0;
  try {
    const folders = fs.readdirSync(brainDir);
    for (const folder of folders) {
      const transPath = path.join(brainDir, folder, '.system_generated', 'logs', 'transcript.jsonl');
      if (fs.existsSync(transPath)) {
        try {
          const stat = fs.statSync(transPath);
          if (new Date(stat.mtime).toISOString().slice(0, 10) === todayStr) {
            const content = fs.readFileSync(transPath, 'utf8');
            const lines = content.trim().split('\n');
            for (let i = 0; i < lines.length; i++) {
              try {
                const s = JSON.parse(lines[i]);
                if (s.created_at && s.created_at.slice(0, 10) === todayStr) {
                  total += (s.input_tokens || 0) + (s.output_tokens || 0);
                }
              } catch(e) {}
            }
          }
        } catch(e) {}
      }
    }
  } catch(e) {}
  return total;
}

function getTokenStats(convId) {
  if (!convId) return null;
  try {
    const transcriptPath = `C:\\Users\\Praashu\\.gemini\\antigravity\\brain\\${convId}\\.system_generated\\logs\\transcript.jsonl`;
    if (!fs.existsSync(transcriptPath)) return null;

    const content = fs.readFileSync(transcriptPath, 'utf8');
    const lines = content.trim().split('\n');

    let totalInput = 0;
    let totalOutput = 0;
    let totalCacheRead = 0;
    let latestInput = 0;
    let latestOutput = 0;
    let latestCacheRead = 0;
    let stepCount = 0;
    let totalLinesConvo = 0;
    let todayTokens = 0;
    const todayStr = new Date().toISOString().slice(0, 10);

    const turns = [];
    let currentTurn = null;

    for (let i = 0; i < lines.length; i++) {
      try {
        const step = JSON.parse(lines[i]);
        stepCount++;
        const inTok = step.input_tokens || 0;
        const outTok = step.output_tokens || 0;

        if (step.input_tokens !== undefined) {
          latestInput = step.input_tokens;
          totalInput += step.input_tokens;
        }
        if (step.output_tokens !== undefined) {
          latestOutput = step.output_tokens;
          totalOutput += step.output_tokens;
        }
        if (step.cache_read_tokens !== undefined) {
          latestCacheRead = step.cache_read_tokens;
          totalCacheRead += step.cache_read_tokens;
        }

        if (step.created_at && step.created_at.slice(0, 10) === todayStr) {
          todayTokens += (inTok + outTok);
        }

        if (step.type === 'USER_INPUT') {
          const uText = step.content || '';
          const uLines = uText.split('\n').length;
          totalLinesConvo += uLines;

          const rawClean = uText.replace(/<USER_REQUEST>([\s\S]*?)<\/USER_REQUEST>[\s\S]*/, '$1')
                                .replace(/<[^>]+>/g, '')
                                .trim();

          const existingTurn = (currentTurn && currentTurn.stepIndex === step.step_index)
            ? currentTurn
            : turns.find(t => t.stepIndex === step.step_index);

          if (existingTurn) {
            existingTurn.promptSnippet = rawClean.slice(0, 45) || 'User Request';
            existingTurn.fullPrompt = rawClean;
            existingTurn.userLines = uLines;
            existingTurn.timestamp = step.created_at;
          } else {
            if (currentTurn) turns.push(currentTurn);
            currentTurn = {
              turnIndex: turns.length + 1,
              stepIndex: step.step_index,
              promptSnippet: rawClean.slice(0, 45) || 'User Request',
              fullPrompt: rawClean,
              userLines: uLines,
              timestamp: step.created_at,
              inputTokens: 0,
              cacheReadTokens: 0,
              outputTokens: 0,
              steps: 0,
              assistantLines: 0,
              engineKey: 'stock_architect'
            };
          }
        } else if (currentTurn) {
          currentTurn.steps++;
          if (step.input_tokens !== undefined) currentTurn.inputTokens = Math.max(currentTurn.inputTokens, step.input_tokens);
          if (step.cache_read_tokens !== undefined) currentTurn.cacheReadTokens = Math.max(currentTurn.cacheReadTokens, step.cache_read_tokens);
          if (step.output_tokens !== undefined) currentTurn.outputTokens += step.output_tokens;
          if (step.source === 'MODEL' && step.type === 'PLANNER_RESPONSE') {
            const txt = (step.content || '') + ' ' + (step.thinking || '');
            if (/SHADOW_MONARCH|Universal Boss/i.test(txt)) {
              currentTurn.engineKey = 'shadow_monarch';
            } else if (/BYTE_OPERATOR|Adversary Emulation/i.test(txt)) {
              currentTurn.engineKey = 'byte_operator';
            } else if (/ELITE_BUG_FIXER|Adversarial Micro-Auditor/i.test(txt)) {
              currentTurn.engineKey = 'elite_bug_fixer';
            } else if (/CLAUDE_PLANNER|Claude Thinking|Fable V/i.test(txt)) {
              currentTurn.engineKey = 'claude_planner';
            } else if (/TDD_ENGINEER|Zero-Regression/i.test(txt)) {
              currentTurn.engineKey = 'tdd_engineer';
            } else if (/SECURITY_AUDITOR|Defensive Threat/i.test(txt)) {
              currentTurn.engineKey = 'security_auditor';
            }
          }
          if (step.content) {
            const aLines = step.content.split('\n').length;
            currentTurn.assistantLines += aLines;
            totalLinesConvo += aLines;
          }
        }
      } catch (e) {}
    }
    if (currentTurn) turns.push(currentTurn);
    turns.forEach((t, i) => { t.turnIndex = i + 1; });

    const currentContext = latestInput + latestCacheRead;
    const cacheRate = currentContext > 0 ? ((latestCacheRead / currentContext) * 100).toFixed(1) : '0.0';

    // Context Health calculation
    let contextHealth = 'optimal'; // <60k
    let healthColor = '#10b981';
    let healthAdvice = 'Optimal context depth. Fast latency & zero hallucination.';
    if (currentContext >= 120000) {
      contextHealth = 'critical';
      healthColor = '#ef4444';
      healthAdvice = 'High context bloat (>120k). Agent latency is high. Consider /compact or fresh chat.';
    } else if (currentContext >= 60000) {
      contextHealth = 'elevated';
      healthColor = '#f59e0b';
      healthAdvice = 'Moderate context depth (>60k). Model is utilizing prompt cache.';
    }

    return {
      stepCount,
      totalTurns: turns.length,
      totalLinesConvo,
      todayTokens: getTodayTotalBurn(),
      convTokens: totalInput + totalOutput,
      latestInput,
      latestOutput,
      latestCacheRead,
      currentContext,
      cacheRate,
      contextHealth,
      healthColor,
      healthAdvice,
      totalInput,
      totalOutput,
      totalCacheRead,
      totalTokens: totalInput + totalOutput,
      recentTurns: turns.slice(-6).reverse(),
      allTurns: turns.map(t => ({
        turnIndex: t.turnIndex,
        stepIndex: t.stepIndex,
        promptSnippet: t.promptSnippet,
        cleanPrompt: (t.fullPrompt || t.promptSnippet).toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 40),
        engineKey: t.engineKey || 'stock_architect',
        contextTokens: (t.inputTokens || 0) + (t.cacheReadTokens || 0),
        outputTokens: t.outputTokens || 0,
        timestamp: t.timestamp
      }))
    };
  } catch (err) {
    return null;
  }
}

class CDPClient {
  constructor(wsUrl, pageUrl) {
    this.wsUrl = wsUrl;
    this.pageUrl = pageUrl;
    this.convId = extractConvId(pageUrl);
    this.ws = null;
    this.id = 1;
    this.callbacks = new Map();
    this.isAlive = false;
  }

  connect() {
    return new Promise((resolve, reject) => {
      try {
        this.ws = new WebSocket(this.wsUrl);
      } catch (err) {
        return reject(err);
      }

      this.ws.onopen = () => {
        this.isAlive = true;
        resolve();
      };

      this.ws.onerror = (err) => {
        log(`WebSocket error: ${err.message || 'unknown'}`);
      };

      this.ws.onclose = () => {
        this.isAlive = false;
        log('WebSocket connection closed');
      };

      this.ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          if (msg.id && this.callbacks.has(msg.id)) {
            const cb = this.callbacks.get(msg.id);
            this.callbacks.delete(msg.id);
            cb(msg.result, msg.error);
          } else if (msg.method) {
            this.handleEvent(msg.method, msg.params);
          }
        } catch (e) {}
      };
    });
  }

  send(method, params = {}) {
    return new Promise((resolve, reject) => {
      if (!this.isAlive || !this.ws) {
        return reject(new Error('WebSocket not connected'));
      }
      const curId = this.id++;
      this.callbacks.set(curId, (result, error) => {
        if (error) reject(error);
        else resolve(result);
      });
      this.ws.send(JSON.stringify({ id: curId, method, params }));
    });
  }

  handleEvent(method, params) {
    if (method === 'Page.loadEventFired' || method === 'Page.frameNavigated') {
      log(`Navigation event (${method}); re-injecting script & syncing stats...`);
      this.ensureInjected().catch(() => {});
      this.syncActiveState().catch(() => {});
    }
  }

  async ensureInjected() {
    if (!this.isAlive) return;
    try {
      if (!fs.existsSync(SCRIPT_PATH)) return;
      const code = fs.readFileSync(SCRIPT_PATH, 'utf8');
      await this.send('Runtime.evaluate', {
        expression: code,
        returnByValue: false
      });
      await this.send('Runtime.evaluate', {
        expression: 'if (window.__agEnsureTuneButton) window.__agEnsureTuneButton(); if (window.__agEnsureBottomControls) window.__agEnsureBottomControls(); if (window.__agEnsureChatTurnChips) window.__agEnsureChatTurnChips(); if (window.__agUpdateEngineDisplay) window.__agUpdateEngineDisplay();',
        returnByValue: false
      });
    } catch (e) {
      log(`ensureInjected error: ${e.message}`);
    }
  }

  async syncActiveState() {
    if (!this.isAlive) return;
    try {
      const res = await this.send('Runtime.evaluate', {
        expression: `(() => {
          const href = window.location.href;
          const match = href.match(/\\/c\\/([a-f0-9-]+)/);
          const convId = match ? match[1] : null;
          let chatEngines = {};
          try { chatEngines = JSON.parse(localStorage.getItem('ag_chat_engines') || '{}'); } catch(e){}
          let settings = {};
          try { settings = JSON.parse(localStorage.getItem('ag_tune_settings_v2') || '{}'); } catch(e){}
          const defaultEngine = settings.activeEngine || 'stock_architect';
          const activeEngine = (convId && chatEngines[convId]) ? chatEngines[convId] : defaultEngine;
          return { convId, activeEngine };
        })()`,
        returnByValue: true
      });

      if (res && res.result && res.result.value) {
        const { convId, activeEngine } = res.result.value;
        this.convId = convId;

        if (activeEngine && activeEngine !== appState.activeEngine) {
          appState.activeEngine = activeEngine;
          saveState();
        }
        syncGeminiMd();

        // Push transcript token stats if conversation exists
        if (convId) {
          const stats = getTokenStats(convId);
          if (stats) {
            await this.send('Runtime.evaluate', {
              expression: `if (window.__agUpdateTokens) window.__agUpdateTokens(${JSON.stringify(stats)});`,
              returnByValue: false
            });
          }
        }
      }
    } catch (e) {
      log(`syncActiveState error: ${e.message}`);
    }
  }

  async setup() {
    await this.send('Page.enable');
    await this.send('Runtime.enable');

    if (fs.existsSync(SCRIPT_PATH)) {
      const code = fs.readFileSync(SCRIPT_PATH, 'utf8');
      await this.send('Page.addScriptToEvaluateOnNewDocument', { source: code });
    }

    await this.ensureInjected();
    await this.syncActiveState();
    log('Initialized CDP session with Page.addScriptToEvaluateOnNewDocument');
  }

  async checkHealth() {
    if (!this.isAlive) return false;
    try {
      const res = await this.send('Runtime.evaluate', {
        expression: '({ tune: !!document.getElementById("antigravity-tune-btn"), token: !!document.getElementById("antigravity-token-counter") })',
        returnByValue: true
      });
      return !!(res && res.result && res.result.value && res.result.value.tune && res.result.value.token);
    } catch (e) {
      return false;
    }
  }

  close() {
    if (this.ws) {
      this.ws.close();
    }
  }
}

// Background Monitor Loop
let activeClient = null;

async function lifecycleLoop() {
  while (true) {
    try {
      if (!activeClient || !activeClient.isAlive) {
        const port = await findWorkingCdpPort();
        if (!port) {
          await new Promise(r => setTimeout(r, 2000));
          continue;
        }
        const page = await getPageTarget(port);
        if (page && page.webSocketDebuggerUrl) {
          log(`Attaching to Antigravity Electron page on port ${port}...`);
          activeClient = new CDPClient(page.webSocketDebuggerUrl, page.url);
          await activeClient.connect();
          await activeClient.setup();
          log('Attached successfully.');
        }
      } else {
        const healthy = await activeClient.checkHealth();
        if (!healthy) {
          log('Controls missing in DOM, ensuring injection...');
          await activeClient.ensureInjected();
        }
        await activeClient.syncActiveState();
      }
    } catch (err) {
      log(`Lifecycle iteration caught: ${err.message}`);
      if (activeClient) {
        activeClient.close();
        activeClient = null;
      }
    }

    await new Promise(r => setTimeout(r, 1500));
  }
}

// Initial sync on boot
syncGeminiMd();
lifecycleLoop();

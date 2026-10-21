(function() {
  window.__antigravityStudioUnifiedRunning = true;

  // Clean up any rogue fixed buttons from earlier revisions
  const rogueTune = document.getElementById('antigravity-tune-btn');
  if (rogueTune && rogueTune.style.position === 'fixed') rogueTune.remove();
  const rogueToken = document.getElementById('antigravity-token-counter');
  if (rogueToken && rogueToken.style.position === 'fixed') rogueToken.remove();

  // --- SETTINGS STATE ---
  const DEFAULT_SETTINGS = {
    theme: 'Cyberpunk',
    customAccent: '#f472b6',
    glowIntensity: 60,
    fontFamily: 'default',
    borderRadius: 'modern',
    compactMode: false,
    chatBubbleMode: false,
    minimizePrompts: true,
    stickyUserPrompts: false,
    wallpaperEnabled: false,
    wallpaperUrl: '',
    wallpaperOpacity: 15,
    wallpaperBlur: 0,
    activeEngine: 'stock_architect'
  };

  let settings = Object.assign({}, DEFAULT_SETTINGS);
  try {
    const saved = localStorage.getItem('ag_tune_settings_v2');
    if (saved) settings = Object.assign(settings, JSON.parse(saved));
  } catch(e) {}

  function saveSettings() {
    try {
      localStorage.setItem('ag_tune_settings_v2', JSON.stringify(settings));
    } catch(e) {}
    applyAll();
  }

  // --- CONVERSATION & CHAT-LOCKING HELPERS ---
  function getActiveConvId() {
    const match = window.location.href.match(/\/c\/([a-f0-9-]+)/);
    return match ? match[1] : null;
  }

  function getChatLockedEngines() {
    try {
      return JSON.parse(localStorage.getItem('ag_chat_engines') || '{}');
    } catch(e) {
      return {};
    }
  }

  function saveChatLockedEngine(convId, engineKey) {
    if (!convId) return;
    const map = getChatLockedEngines();
    map[convId] = engineKey;
    try {
      localStorage.setItem('ag_chat_engines', JSON.stringify(map));
    } catch(e) {}
  }

  function getActiveEngineForCurrentChat() {
    const convId = getActiveConvId();
    const map = getChatLockedEngines();
    if (convId && map[convId] && ENGINES[map[convId]]) {
      return map[convId];
    }
    return settings.activeEngine || 'stock_architect';
  }

  // --- THEMES & TOKENS ---
  const THEMES = {
    'Stock': {
      name: 'Stock',
      accent: '#94a3b8',
      desc: 'Default Dark',
      bg: '#101010',
      sidebar: '#151515',
      card: '#191919',
      border: '#222222',
      fg: '#cccccc'
    },
    'Cyberpunk': {
      name: 'Cyberpunk',
      accent: '#f472b6',
      desc: 'Neon Magenta',
      bg: '#120919',
      sidebar: '#180b22',
      card: '#21102f',
      border: '#3d1858',
      fg: '#fdf2f8'
    },
    'Sakura': {
      name: 'Sakura',
      accent: '#fbcfe8',
      desc: 'Pastel Lilac',
      bg: '#141018',
      sidebar: '#191420',
      card: '#221b2c',
      border: '#3a2c47',
      fg: '#fdf4f9'
    },
    'Cyan Matrix': {
      name: 'Cyan Matrix',
      accent: '#38bdf8',
      desc: 'Electric Sky',
      bg: '#080f18',
      sidebar: '#0b1522',
      card: '#0f1f32',
      border: '#16324f',
      fg: '#f0f9ff'
    },
    'Midnight': {
      name: 'Midnight',
      accent: '#818cf8',
      desc: 'Indigo Slate',
      bg: '#0b0e17',
      sidebar: '#101421',
      card: '#161c2e',
      border: '#252e4b',
      fg: '#e0e7ff'
    },
    'Emerald': {
      name: 'Emerald Matrix',
      accent: '#10b981',
      desc: 'Cyber Green',
      bg: '#06130d',
      sidebar: '#0a1a12',
      card: '#0e2419',
      border: '#163d2b',
      fg: '#ecfdf5'
    },
    'Amber': {
      name: 'Amber Sunset',
      accent: '#f59e0b',
      desc: 'Solar Gold',
      bg: '#160e06',
      sidebar: '#1e140a',
      card: '#291c0e',
      border: '#452e17',
      fg: '#fffbeb'
    }
  };

  const FONTS = {
    'default': '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    'jetbrains': '"JetBrains Mono", monospace',
    'fira': '"Fira Code", monospace',
    'jakarta': '"Plus Jakarta Sans", sans-serif',
    'inter': '"Inter", sans-serif'
  };

  const RADII = {
    'sharp': { radius: '0px' },
    'modern': { radius: '8px' },
    'soft': { radius: '14px' }
  };

  // --- ENGINES & COGNITIVE DOCTRINES ---
  const ENGINES = {
    'stock_architect': {
      id: 'stock_architect',
      name: 'Stock Default',
      title: 'Balanced System Architect',
      color: '#94a3b8',
      bg: 'rgba(148,163,184,0.15)',
      badge: 'DEFAULT',
      desc: 'Standard clean full-stack architectural engineering with balanced reasoning depth.'
    },
    'byte_operator': {
      id: 'byte_operator',
      name: 'Byte Operator',
      title: 'Byte Operator Mode (Offensive Security & RE)',
      color: '#ef4444',
      bg: 'rgba(239,68,68,0.15)',
      badge: 'RE / KERNEL',
      desc: 'Senior offensive-security doctrine, adversary emulation, binary analysis and reverse engineering.'
    },
    'shadow_monarch': {
      id: 'shadow_monarch',
      name: 'Shadow Monarch',
      title: 'Shadow Monarch Terminal (Universal S-Rank)',
      color: '#a855f7',
      bg: 'rgba(168,85,247,0.15)',
      badge: 'TERMINAL SOVEREIGN',
      desc: 'Zero-assumption tool verification, error triage from stderr signatures, autonomous diagnostic self-healing.'
    },
    'claude_planner': {
      id: 'claude_planner',
      name: 'Claude Planner',
      title: 'Claude Thinking Engine (Fable V Planner)',
      color: '#f472b6',
      bg: 'rgba(244,114,182,0.15)',
      badge: 'DEEP CoT / GoT',
      desc: 'Deconstructive first-principles, multi-perspective CoT, Graph of Thoughts DAG reasoning.'
    },
    'elite_bug_fixer': {
      id: 'elite_bug_fixer',
      name: 'Elite Bug Fixer',
      title: 'Elite Bug Fixer & Antifragile Engine',
      color: '#10b981',
      bg: 'rgba(16,185,129,0.15)',
      badge: 'SURGICAL DEBUG',
      desc: 'Adversarial micro-auditing, surgical root-cause tracing, minimal targeted diffs.'
    },
    'tdd_engineer': {
      id: 'tdd_engineer',
      name: 'TDD Test Engineer',
      title: 'TDD Test Engineer (Zero-Regression & Test-First)',
      color: '#06b6d4',
      bg: 'rgba(6,182,212,0.15)',
      badge: 'TEST-DRIVEN',
      desc: 'Test-first development, hermetic mocking, boundary assertions, and guaranteed reproduction before code changes.'
    },
    'security_auditor': {
      id: 'security_auditor',
      name: 'Security Auditor',
      title: 'Security & Vulnerability Auditor (OWASP Top 10)',
      color: '#eab308',
      bg: 'rgba(234,179,8,0.15)',
      badge: 'OWASP / THREAT',
      desc: 'Defensive threat modeling, injection prevention, token/secret leakage audits, and strict schema validation.'
    }
  };

  // --- LIVE TELEMETRY STATE ---
  let tokenStats = {
    stepCount: 0,
    totalTurns: 0,
    totalLinesConvo: 0,
    todayTokens: 0,
    resetTimerStr: '--',
    latestInput: 0,
    latestOutput: 0,
    latestCacheRead: 0,
    currentContext: 0,
    cacheRate: '0.0',
    contextHealth: 'optimal',
    healthColor: '#10b981',
    healthAdvice: 'Optimal context depth. Fast latency & zero hallucination.',
    totalInput: 0,
    totalOutput: 0,
    totalCacheRead: 0,
    totalTokens: 0,
    recentTurns: [],
    allTurns: []
  };

  let aggyQuota = {
    gemini5hRemaining: '--',
    gemini5hReset: '--',
    geminiWeeklyRemaining: '--',
    geminiWeeklyReset: '--',
    lastFetched: 0
  };

  let daemonState = {
    zeroYapMode: false,
    destructiveGuard: false,
    pinnedScratchpad: ''
  };

  async function fetchDaemonState() {
    try {
      const res = await window.fetch('http://127.0.0.1:55979/get-state', { timeout: 1000 });
      if (res.ok) {
        const data = await res.json();
        daemonState = Object.assign(daemonState, data);
        updateToolsUI();
      }
    } catch(e) {}
  }

  async function fetchAggyQuota() {
    try {
      const csrf = window.__APP_CONFIG__?.csrfToken || '';
      const url = window.location.origin + '/exa.language_server_pb.LanguageServerService/RetrieveUserQuotaSummary';
      const resp = await window.fetch(url, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'x-codeium-csrf-token': csrf
        },
        body: JSON.stringify({})
      });
      const text = await resp.text();
      const jsonMatch = text.match(/\{.*\}/s);
      if (!jsonMatch) return;
      const data = JSON.parse(jsonMatch[0]);
      const groups = data?.response?.groups || [];

      let b5h = null;
      let bWeekly = null;
      for (const g of groups) {
        for (const b of (g.buckets || [])) {
          if (b.bucketId === 'gemini-5h') b5h = b;
          if (b.bucketId === 'gemini-weekly') bWeekly = b;
        }
      }

      if (b5h) {
        const diff = Math.max(0, new Date(b5h.resetTime) - Date.now());
        const hours = Math.floor(diff / 3600000);
        const mins = Math.floor((diff % 3600000) / 60000);
        aggyQuota.gemini5hReset = `${hours}h ${mins}m`;
        aggyQuota.gemini5hRemaining = Math.round((b5h.remainingFraction || 0) * 100) + '%';
      }

      if (bWeekly) {
        const diff = Math.max(0, new Date(bWeekly.resetTime) - Date.now());
        const days = Math.floor(diff / (3600000 * 24));
        const hours = Math.floor((diff % (3600000 * 24)) / 3600000);
        aggyQuota.geminiWeeklyReset = `${days}d ${hours}h`;
        aggyQuota.geminiWeeklyRemaining = Math.round((bWeekly.remainingFraction || 0) * 100) + '%';
      }

      aggyQuota.lastFetched = Date.now();
      updateQuotaBadges();
    } catch(e) {}
  }

  function updateQuotaBadges() {
    const hud = document.getElementById('antigravity-token-hud');
    if (!hud) return;
    const resetBadge = hud.querySelector('#ag-token-reset-badge');
    if (resetBadge && aggyQuota.gemini5hReset !== '--') {
      resetBadge.textContent = `Aggy: Resets in ${aggyQuota.gemini5hReset} (${aggyQuota.gemini5hRemaining})`;
    }
    const card5h = hud.querySelector('#ag-quota-5h-val');
    if (card5h && aggyQuota.gemini5hReset !== '--') {
      card5h.textContent = `${aggyQuota.gemini5hRemaining} (${aggyQuota.gemini5hReset})`;
    }
    const cardW = hud.querySelector('#ag-quota-weekly-val');
    if (cardW && aggyQuota.geminiWeeklyReset !== '--') {
      cardW.textContent = `${aggyQuota.geminiWeeklyRemaining} (${aggyQuota.geminiWeeklyReset})`;
    }
  }

  // --- STYLING ENGINE ---
  function applyAll() {
    const currentTheme = THEMES[settings.theme] || THEMES['Stock'];
    const accent = (settings.theme === 'Custom') ? settings.customAccent : currentTheme.accent;
    const font = FONTS[settings.fontFamily] || FONTS['default'];
    const radius = RADII[settings.borderRadius]?.radius || '8px';

    let customStyle = document.getElementById('antigravity-custom-styles');
    if (!customStyle) {
      customStyle = document.createElement('style');
      customStyle.id = 'antigravity-custom-styles';
      document.head.appendChild(customStyle);
    }

    const glowOpacity = (settings.glowIntensity / 100).toFixed(2);
    const glowFilter = settings.glowIntensity > 0 ? `drop-shadow(0 0 ${Math.round(settings.glowIntensity * 0.1)}px ${accent})` : 'none';

    customStyle.textContent = `
      :root {
        --ag-accent: ${accent} !important;
        --ag-accent-glow: rgba(${hexToRgb(accent)}, ${glowOpacity}) !important;
        --ag-radius: ${radius} !important;
        --ag-font-family: ${font} !important;
      }
      body, button, input, textarea {
        font-family: var(--ag-font-family) !important;
      }
      ${settings.compactMode ? `
        .chat-bubble, .message-container {
          padding-top: 6px !important;
          padding-bottom: 6px !important;
          font-size: 13px !important;
        }
      ` : ''}
      ${settings.chatBubbleMode ? `
        [data-testid*="user-message"], .user-message-container {
          background: rgba(${hexToRgb(accent)}, 0.12) !important;
          border: 1px solid rgba(${hexToRgb(accent)}, 0.28) !important;
          border-radius: 12px 12px 2px 12px !important;
          padding: 10px 14px !important;
          max-width: 85% !important;
          align-self: flex-end !important;
        }
      ` : ''}
    `;

    applyWallpaper();
    updateModalUI();
  }

  function hexToRgb(hex) {
    hex = hex.replace('#', '');
    if (hex.length === 3) hex = hex.split('').map(c => c + c).join('');
    const num = parseInt(hex, 16);
    return `${(num >> 16) & 255}, ${(num >> 8) & 255}, ${num & 255}`;
  }

  function applyWallpaper() {
    let wallEl = document.getElementById('antigravity-backdrop-wallpaper');
    if (!settings.wallpaperEnabled || !settings.wallpaperUrl) {
      if (wallEl) wallEl.remove();
      return;
    }
    if (!wallEl) {
      wallEl = document.createElement('div');
      wallEl.id = 'antigravity-backdrop-wallpaper';
      wallEl.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:-1;background-size:cover;background-position:center;transition:opacity 0.3s ease;';
      document.body.prepend(wallEl);
    }
    wallEl.style.backgroundImage = `url("${settings.wallpaperUrl}")`;
    wallEl.style.opacity = (settings.wallpaperOpacity / 100).toString();
    wallEl.style.filter = settings.wallpaperBlur > 0 ? `blur(${settings.wallpaperBlur}px)` : 'none';
  }

  // --- OUTSIDE DISMISSAL HANDLER ---
  let outsideDismissalInitialized = false;
  function setupOutsideDismissal() {
    if (outsideDismissalInitialized) return;
    outsideDismissalInitialized = true;

    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        const modal = document.getElementById('antigravity-tune-modal');
        if (modal) modal.style.display = 'none';
        const hud = document.getElementById('antigravity-token-hud');
        if (hud) hud.style.display = 'none';
        const menu = document.getElementById('antigravity-engine-menu');
        if (menu) menu.style.display = 'none';
      }
    });

    window.addEventListener('pointerdown', (e) => {
      // 1. Token HUD Dismiss
      const hud = document.getElementById('antigravity-token-hud');
      const tokenBtn = document.getElementById('antigravity-token-counter');
      if (hud && hud.style.display === 'flex') {
        if (!hud.contains(e.target) && (!tokenBtn || !tokenBtn.contains(e.target))) {
          hud.style.display = 'none';
        }
      }

      // 2. Engine Menu Dismiss
      const menu = document.getElementById('antigravity-engine-menu');
      const engineBtn = document.getElementById('antigravity-engine-switcher');
      if (menu && menu.style.display === 'flex') {
        if (!menu.contains(e.target) && (!engineBtn || !engineBtn.contains(e.target))) {
          menu.style.display = 'none';
        }
      }
    });
  }

  // --- ENGINE DISPATCH ---
  function setEngine(key, lockToCurrentChat = true) {
    if (!ENGINES[key]) return;
    settings.activeEngine = key;
    saveSettings();

    const convId = getActiveConvId();
    if (lockToCurrentChat && convId) {
      saveChatLockedEngine(convId, key);
    }

    try {
      window.fetch(`http://127.0.0.1:55979/set-engine?engine=${key}`, { timeout: 800 }).catch(() => {});
    } catch(e) {}

    updateModalUI();
    window.__agEnsureChatTurnChips();
    window.__agEnsureBottomControls();
  }

  // --- POPUPS & HUD CREATION ---
  let popoversBuilt = false;
  function ensurePopovers() {
    if (popoversBuilt && document.getElementById('antigravity-token-hud') && document.getElementById('antigravity-engine-menu') && document.getElementById('antigravity-tune-modal') && !document.getElementById('antigravity-tune-modal').innerHTML.includes('⚡ Power Tools')) {
      return;
    }
    popoversBuilt = true;
    if (!document.body) return;

    // 1. SMART TELEMETRY HUD
    let tokenHud = document.getElementById('antigravity-token-hud');
    if (!tokenHud) {
      tokenHud = document.createElement('div');
      tokenHud.id = 'antigravity-token-hud';
      tokenHud.style.cssText = 'position:fixed;bottom:68px;right:220px;z-index:999999;width:480px;max-width:92vw;background:#101216;border:1px solid rgba(56,189,248,0.3);box-shadow:0 24px 54px rgba(0,0,0,0.85),0 0 24px rgba(56,189,248,0.12);border-radius:14px;padding:16px;color:#f1f5f9;display:none;flex-direction:column;gap:12px;backdrop-filter:blur(20px);font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;box-sizing:border-box;';
      tokenHud.innerHTML = `
        <div style="display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid rgba(255,255,255,0.08);padding-bottom:10px;">
          <div style="display:flex;align-items:center;gap:8px;">
            <div style="width:24px;height:24px;border-radius:6px;background:rgba(56,189,248,0.15);display:flex;align-items:center;justify-content:center;color:#38bdf8;">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z"/></svg>
            </div>
            <span style="font-size:12px;font-weight:700;letter-spacing:0.5px;text-transform:uppercase;color:#38bdf8;">Token & Quota Telemetry</span>
          </div>
          <div style="display:flex;align-items:center;gap:6px;">
            <span id="ag-token-reset-badge" style="font-size:10px;font-family:monospace;padding:2px 7px;border-radius:4px;background:rgba(245,158,11,0.15);color:#f59e0b;border:1px solid rgba(245,158,11,0.3);">Aggy: Checking...</span>
          </div>
        </div>

        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">
          <div style="background:rgba(245,158,11,0.06);border:1px solid rgba(245,158,11,0.25);border-radius:8px;padding:8px 10px;">
            <div style="font-size:10px;color:#f59e0b;">Gemini 5-Hour Limit (Aggy)</div>
            <div id="ag-quota-5h-val" style="font-size:13px;font-weight:700;font-family:monospace;color:#f1f5f9;margin-top:2px;">--</div>
          </div>
          <div style="background:rgba(56,189,248,0.06);border:1px solid rgba(56,189,248,0.25);border-radius:8px;padding:8px 10px;">
            <div style="font-size:10px;color:#38bdf8;">Weekly Limit (Aggy)</div>
            <div id="ag-quota-weekly-val" style="font-size:13px;font-weight:700;font-family:monospace;color:#38bdf8;margin-top:2px;">--</div>
          </div>
          <div style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.06);border-radius:8px;padding:8px 10px;">
            <div style="font-size:10px;color:#94a3b8;">Today's Total Burn</div>
            <div id="ag-token-today-val" style="font-size:14px;font-weight:700;font-family:monospace;color:#f1f5f9;margin-top:2px;">--</div>
          </div>
          <div style="background:rgba(56,189,248,0.06);border:1px solid rgba(56,189,248,0.25);border-radius:8px;padding:8px 10px;">
            <div style="font-size:10px;color:#38bdf8;">Cache Read Hit Rate</div>
            <div id="ag-token-cache-val" style="font-size:14px;font-weight:700;font-family:monospace;color:#38bdf8;margin-top:2px;">--</div>
          </div>
        </div>

        <div style="display:flex;justify-content:space-between;align-items:center;font-size:10px;color:#64748b;border-top:1px solid rgba(255,255,255,0.06);padding-top:8px;">
          <span>Original Aggy Usage Tracking · gRPC-Web Live</span>
          <button id="ag-token-hud-close" style="background:transparent;border:none;color:#94a3b8;cursor:pointer;text-decoration:underline;">Close</button>
        </div>
      `;
      document.body.appendChild(tokenHud);
      tokenHud.querySelector('#ag-token-hud-close').onclick = () => { tokenHud.style.display = 'none'; };
    }

    // 2. ENGINE SELECTOR QUICK MENU
    let engineMenu = document.getElementById('antigravity-engine-menu');
    if (!engineMenu) {
      engineMenu = document.createElement('div');
      engineMenu.id = 'antigravity-engine-menu';
      engineMenu.style.cssText = 'position:fixed;bottom:68px;right:280px;z-index:999999;width:420px;background:#101216;border:1px solid rgba(244,114,182,0.3);box-shadow:0 24px 54px rgba(0,0,0,0.85),0 0 24px rgba(244,114,182,0.12);border-radius:14px;padding:16px;color:#f1f5f9;display:none;flex-direction:column;gap:10px;backdrop-filter:blur(20px);font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;box-sizing:border-box;';
      
      const currentEngKey = getActiveEngineForCurrentChat();
      let itemsHtml = '';
      Object.keys(ENGINES).forEach(key => {
        const eng = ENGINES[key];
        const isCurrent = (currentEngKey === key);
        itemsHtml += `
          <div class="ag-engine-card" data-engine="${key}" style="padding:10px 12px;border-radius:10px;border:1px solid ${isCurrent ? eng.color : 'rgba(255,255,255,0.08)'};background:${isCurrent ? eng.bg : 'rgba(255,255,255,0.02)'};cursor:pointer;display:flex;flex-direction:column;gap:4px;transition:all 0.2s;">
            <div style="display:flex;justify-content:space-between;align-items:center;">
              <span style="font-size:12px;font-weight:700;color:${eng.color};">${eng.title}</span>
              <span style="font-size:9px;font-weight:600;font-family:monospace;padding:2px 6px;border-radius:4px;background:${eng.bg};color:${eng.color};border:1px solid ${eng.color}40;">${eng.badge}</span>
            </div>
            <div style="font-size:11px;color:#94a3b8;">${eng.desc}</div>
          </div>
        `;
      });

      engineMenu.innerHTML = `
        <div style="display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid rgba(255,255,255,0.08);padding-bottom:10px;">
          <div>
            <div style="font-size:13px;font-weight:700;letter-spacing:-0.2px;">Cognitive Engines & Operational Doctrines</div>
            <div style="font-size:10px;color:#94a3b8;">Select active mindset for this conversation (saved in chat memory)</div>
          </div>
          <button id="ag-engine-menu-close" style="background:transparent;border:none;color:#94a3b8;cursor:pointer;padding:2px;">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>
        <div style="display:flex;flex-direction:column;gap:6px;max-height:360px;overflow-y:auto;padding-right:2px;">
          ${itemsHtml}
        </div>
      `;

      document.body.appendChild(engineMenu);
      engineMenu.querySelector('#ag-engine-menu-close').onclick = () => { engineMenu.style.display = 'none'; };

      engineMenu.querySelectorAll('.ag-engine-card').forEach(card => {
        card.onclick = () => {
          const key = card.getAttribute('data-engine');
          setEngine(key, true);
          engineMenu.style.display = 'none';
        };
      });
    }

    buildStudioModal();
  }

  // --- MODAL BUILDER (NEW 4-TAB POWER TOOLS SUITE) ---
  function buildStudioModal() {
    const existing = document.getElementById('antigravity-tune-modal');
    if (existing) {
      if (existing.querySelector('#ag-tab-turns-list') && !existing.innerHTML.includes('⚡ Power Tools')) return;
      existing.remove();
    }
    if (!document.body) return;

    const overlay = document.createElement('div');
    overlay.id = 'antigravity-tune-modal';
    overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.7);backdrop-filter:blur(8px);z-index:999999;display:none;align-items:center;justify-content:center;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;';

    // Safe outside click: clicking darkened backdrop closes modal
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        overlay.style.display = 'none';
      }
    });

    const modalBox = document.createElement('div');
    modalBox.style.cssText = 'width:580px;max-width:94vw;max-height:88vh;overflow-y:auto;background:#111216;border:1px solid rgba(255,255,255,0.12);border-radius:16px;box-shadow:0 24px 48px rgba(0,0,0,0.7);padding:20px;color:#f1f5f9;box-sizing:border-box;display:flex;flex-direction:column;gap:14px;';

    modalBox.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid rgba(255,255,255,0.08);padding-bottom:12px;">
        <div style="display:flex;align-items:center;gap:10px;">
          <div style="width:32px;height:32px;border-radius:8px;background:rgba(244,114,182,0.15);border:1px solid rgba(244,114,182,0.3);display:flex;align-items:center;justify-content:center;color:#f472b6;">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 -960 960 960" fill="currentColor">
              <path d="M440-160v-160h80v60h320v40H520v60h-80Zm-320-60v-40h240v40H120Zm240-180v-60H120v-40h240v-60h80v160h-80Zm160-60v-40h360v40H520Zm160-180v-160h80v60h120v40H760v60h-80Zm-560-60v-40h480v40H120Z"/>
            </svg>
          </div>
          <div>
            <div style="font-size:14px;font-weight:700;letter-spacing:-0.2px;">Antigravity Power Tools & Tune Studio</div>
            <div style="font-size:11px;color:#94a3b8;">High-Rigor Cognitive Engines, Developer Utilities & Telemetry</div>
          </div>
        </div>

        <div style="display:flex;align-items:center;gap:8px;">
          <span id="ag-studio-badge" style="font-size:10px;font-weight:600;font-family:monospace;padding:3px 8px;border-radius:12px;background:rgba(244,114,182,0.15);color:#f472b6;border:1px solid rgba(244,114,182,0.3);">Cyberpunk</span>
          <button id="ag-studio-close" style="background:transparent;border:none;color:#94a3b8;cursor:pointer;padding:4px;border-radius:6px;display:flex;">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>
      </div>

      <!-- 4 CLEAN TABS -->
      <div style="display:flex;gap:5px;border-bottom:1px solid rgba(255,255,255,0.06);padding-bottom:8px;">
        <button class="ag-tab-btn active" data-tab="tools" style="flex:1;padding:7px 8px;font-size:11px;font-weight:600;border-radius:8px;border:1px solid rgba(244,114,182,0.4);background:rgba(244,114,182,0.15);color:#f472b6;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:6px;">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>
          <span>Tools</span>
        </button>
        <button class="ag-tab-btn" data-tab="engines" style="flex:1;padding:7px 8px;font-size:11px;font-weight:600;border-radius:8px;border:1px solid rgba(255,255,255,0.08);background:rgba(255,255,255,0.03);color:#94a3b8;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:6px;">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
          <span>Engines</span>
        </button>
        <button class="ag-tab-btn" data-tab="telemetry" style="flex:1;padding:7px 8px;font-size:11px;font-weight:600;border-radius:8px;border:1px solid rgba(255,255,255,0.08);background:rgba(255,255,255,0.03);color:#94a3b8;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:6px;">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg>
          <span>Telemetry</span>
        </button>
        <button class="ag-tab-btn" data-tab="canvas" style="flex:1;padding:7px 8px;font-size:11px;font-weight:600;border-radius:8px;border:1px solid rgba(255,255,255,0.08);background:rgba(255,255,255,0.03);color:#94a3b8;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:6px;">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="13.5" cy="6.5" r=".5"></circle><circle cx="17.5" cy="10.5" r=".5"></circle><circle cx="8.5" cy="7.5" r=".5"></circle><circle cx="6.5" cy="12.5" r=".5"></circle><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z"></path></svg>
          <span>Theme</span>
        </button>
      </div>

      <!-- TAB 1: ⚡ POWER TOOLS -->
      <div id="ag-tab-tools" class="ag-tab-content" style="display:flex;flex-direction:column;gap:12px;">
        
        <!-- Toggle 1: Zero-Yap Mode -->
        <div style="display:flex;flex-direction:column;gap:6px;background:rgba(255,255,255,0.02);border:1px solid rgba(255,255,255,0.06);border-radius:10px;padding:12px;">
          <div style="display:flex;justify-content:space-between;align-items:center;">
            <div>
              <div style="font-size:12px;font-weight:600;display:flex;align-items:center;gap:6px;">
                <span>Zero-Yap / Code-Only Mode</span>
                <span style="font-size:9px;padding:1px 5px;border-radius:4px;background:rgba(244,114,182,0.15);color:#f472b6;font-family:monospace;">STRICT DIFFS</span>
              </div>
              <div style="font-size:10px;color:#94a3b8;margin-top:2px;">Suppresses introductory preambles, recaps, and fluff. AI delivers pure executable diffs.</div>
            </div>
            <input type="checkbox" id="ag-tool-zeroyap" style="cursor:pointer;width:18px;height:18px;accent-color:#f472b6;">
          </div>
          <div id="ag-zeroyap-status" style="font-size:10px;font-family:monospace;color:#f472b6;display:none;"></div>
        </div>

        <!-- Toggle 2: Destructive Action Guard -->
        <div style="display:flex;flex-direction:column;gap:6px;background:rgba(255,255,255,0.02);border:1px solid rgba(255,255,255,0.06);border-radius:10px;padding:12px;">
          <div style="display:flex;justify-content:space-between;align-items:center;">
            <div>
              <div style="font-size:12px;font-weight:600;display:flex;align-items:center;gap:6px;">
                <span>Destructive Action Safety Guard</span>
                <span style="font-size:9px;padding:1px 5px;border-radius:4px;background:rgba(16,185,129,0.15);color:#10b981;font-family:monospace;">GIT / FS LOCK</span>
              </div>
              <div style="font-size:10px;color:#94a3b8;margin-top:2px;">Enforces mandatory user confirmation before file deletion, git reset, or db drops.</div>
            </div>
            <input type="checkbox" id="ag-tool-destructguard" style="cursor:pointer;width:18px;height:18px;accent-color:#10b981;">
          </div>
          <div id="ag-destruct-status" style="font-size:10px;font-family:monospace;color:#10b981;display:none;"></div>
        </div>

        <!-- Session Scratchpad (Pinned Invariants) -->
        <div style="display:flex;flex-direction:column;gap:6px;background:rgba(255,255,255,0.02);border:1px solid rgba(255,255,255,0.06);border-radius:10px;padding:12px;">
          <div style="display:flex;justify-content:space-between;align-items:center;">
            <div>
              <div style="font-size:12px;font-weight:600;">Session Scratchpad & Pinned Context</div>
              <div style="font-size:10px;color:#94a3b8;">Pinned notes are injected into system prompt so the AI never forgets project invariants.</div>
            </div>
            <button id="ag-scratchpad-save" style="padding:4px 10px;font-size:11px;font-weight:600;border-radius:6px;background:#f472b6;color:#120919;border:none;cursor:pointer;">Pin to AI Context</button>
          </div>
          <textarea id="ag-scratchpad-input" rows="3" placeholder="e.g. Backend port: 8000 | Auth: JWT in Authorization header | Never mock database in test_auth.py" style="width:100%;background:rgba(0,0,0,0.3);border:1px solid rgba(255,255,255,0.1);border-radius:6px;padding:8px;font-size:11px;color:#f1f5f9;font-family:monospace;resize:vertical;box-sizing:border-box;margin-top:4px;"></textarea>
          <div id="ag-scratchpad-status" style="font-size:10px;color:#10b981;display:none;">Saved & synchronized to GEMINI.md</div>
        </div>

        <!-- Context Bloat & Handover Meter -->
        <div style="display:flex;flex-direction:column;gap:6px;background:rgba(255,255,255,0.02);border:1px solid rgba(255,255,255,0.06);border-radius:10px;padding:12px;">
          <div style="display:flex;justify-content:space-between;align-items:center;">
            <div style="display:flex;align-items:center;gap:6px;">
              <span style="font-size:12px;font-weight:600;">Context Health & Memory Depth</span>
              <span id="ag-context-badge" style="font-size:9px;font-weight:700;font-family:monospace;padding:1px 6px;border-radius:4px;background:rgba(16,185,129,0.15);color:#10b981;">OPTIMAL</span>
            </div>
            <button id="ag-copy-handover" style="padding:3px 8px;font-size:10px;font-weight:600;border-radius:6px;background:rgba(255,255,255,0.04);color:#cbd5e1;border:1px solid rgba(255,255,255,0.1);cursor:pointer;display:inline-flex;align-items:center;gap:4px;">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
              <span>Copy Handover</span>
            </button>
          </div>
          <div style="width:100%;height:6px;border-radius:3px;background:rgba(255,255,255,0.08);overflow:hidden;margin-top:4px;">
            <div id="ag-context-bar" style="width:20%;height:100%;background:#10b981;transition:width 0.3s ease, background 0.3s ease;"></div>
          </div>
          <div id="ag-context-advice" style="font-size:10px;color:#94a3b8;margin-top:2px;">Optimal context depth. Fast latency & zero hallucination.</div>
        </div>

        <!-- Active Dev Ports Inspector -->
        <div style="display:flex;flex-direction:column;gap:6px;background:rgba(255,255,255,0.02);border:1px solid rgba(255,255,255,0.06);border-radius:10px;padding:12px;">
          <div style="display:flex;justify-content:space-between;align-items:center;">
            <div>
              <div style="font-size:12px;font-weight:600;">Active Dev Ports (3000, 5000, 8000...)</div>
              <div style="font-size:10px;color:#94a3b8;">Inspect listening dev servers and kill hung processes with one click.</div>
            </div>
            <button id="ag-port-scan" style="padding:3px 8px;font-size:10px;font-weight:600;border-radius:6px;background:rgba(56,189,248,0.15);color:#38bdf8;border:1px solid rgba(56,189,248,0.3);cursor:pointer;">Scan Ports</button>
          </div>
          <div id="ag-port-results" style="display:flex;flex-wrap:wrap;gap:6px;margin-top:4px;font-size:11px;color:#94a3b8;">
            <span style="font-size:10px;color:#64748b;">Click "Scan Ports" to inspect active listeners.</span>
          </div>
        </div>

      </div>

      <!-- TAB 2: 🎯 COGNITIVE ENGINES -->
      <div id="ag-tab-engines" class="ag-tab-content" style="display:none;flex-direction:column;gap:10px;">
        <div style="display:flex;justify-content:space-between;align-items:center;">
          <span style="font-size:11px;font-weight:600;color:#94a3b8;text-transform:uppercase;letter-spacing:0.5px;">Cognitive Specializations & Directives</span>
          <span style="font-size:10px;color:#64748b;font-family:monospace;">Locked to active chat</span>
        </div>
        <div style="display:flex;flex-direction:column;gap:8px;max-height:360px;overflow-y:auto;padding-right:2px;">
          
          <div class="ag-studio-engine-item" data-engine="stock_architect" style="padding:10px;border-radius:8px;border:1px solid rgba(255,255,255,0.08);background:rgba(255,255,255,0.02);cursor:pointer;display:flex;flex-direction:column;gap:4px;">
            <div style="display:flex;justify-content:space-between;align-items:center;">
              <span style="font-size:12px;font-weight:700;color:#94a3b8;">Stock Default (Balanced Full-Stack Architect)</span>
              <span style="font-size:9px;font-weight:600;font-family:monospace;padding:2px 6px;border-radius:4px;background:rgba(148,163,184,0.15);color:#94a3b8;">DEFAULT</span>
            </div>
            <div style="font-size:11px;color:#94a3b8;">Standard clean full-stack architectural engineering with balanced reasoning depth.</div>
          </div>

          <div class="ag-studio-engine-item" data-engine="byte_operator" style="padding:10px;border-radius:8px;border:1px solid rgba(255,255,255,0.08);background:rgba(255,255,255,0.02);cursor:pointer;display:flex;flex-direction:column;gap:4px;">
            <div style="display:flex;justify-content:space-between;align-items:center;">
              <span style="font-size:12px;font-weight:700;color:#ef4444;">Byte Operator Mode (Offensive Security & RE)</span>
              <span style="font-size:9px;font-weight:600;font-family:monospace;padding:2px 6px;border-radius:4px;background:rgba(239,68,68,0.15);color:#ef4444;">RE / KERNEL</span>
            </div>
            <div style="font-size:11px;color:#94a3b8;">Adversary emulation, anti-cheat & kernel analysis, zero softening preambles. Direct technical artifacts.</div>
          </div>

          <div class="ag-studio-engine-item" data-engine="shadow_monarch" style="padding:10px;border-radius:8px;border:1px solid rgba(255,255,255,0.08);background:rgba(255,255,255,0.02);cursor:pointer;display:flex;flex-direction:column;gap:4px;">
            <div style="display:flex;justify-content:space-between;align-items:center;">
              <span style="font-size:12px;font-weight:700;color:#a855f7;">Shadow Monarch Terminal (Universal S-Rank)</span>
              <span style="font-size:9px;font-weight:600;font-family:monospace;padding:2px 6px;border-radius:4px;background:rgba(168,85,247,0.15);color:#a855f7;">SOVEREIGN</span>
            </div>
            <div style="font-size:11px;color:#94a3b8;">Zero-assumption tool verification, error triage from stderr signatures, autonomous diagnostic self-healing.</div>
          </div>

          <div class="ag-studio-engine-item" data-engine="claude_planner" style="padding:10px;border-radius:8px;border:1px solid rgba(255,255,255,0.08);background:rgba(255,255,255,0.02);cursor:pointer;display:flex;flex-direction:column;gap:4px;">
            <div style="display:flex;justify-content:space-between;align-items:center;">
              <span style="font-size:12px;font-weight:700;color:#f472b6;">Claude Thinking Engine (Fable V Planner)</span>
              <span style="font-size:9px;font-weight:600;font-family:monospace;padding:2px 6px;border-radius:4px;background:rgba(244,114,182,0.15);color:#f472b6;">ACTIVE</span>
            </div>
            <div style="font-size:11px;color:#94a3b8;">Deconstructive First-Principles & Multiperspective CoT, Graph of Thoughts DAG synthesis.</div>
          </div>

          <div class="ag-studio-engine-item" data-engine="elite_bug_fixer" style="padding:10px;border-radius:8px;border:1px solid rgba(255,255,255,0.08);background:rgba(255,255,255,0.02);cursor:pointer;display:flex;flex-direction:column;gap:4px;">
            <div style="display:flex;justify-content:space-between;align-items:center;">
              <span style="font-size:12px;font-weight:700;color:#10b981;">Elite Bug Fixer & Antifragile Engine</span>
              <span style="font-size:9px;font-weight:600;font-family:monospace;padding:2px 6px;border-radius:4px;background:rgba(16,185,129,0.15);color:#10b981;">DEBUGGER</span>
            </div>
            <div style="font-size:11px;color:#94a3b8;">Surgical micro-auditing, deductive root-cause debugging, stressor-driven evolutionary resilience.</div>
          </div>

          <!-- TDD Test Engineer -->
          <div class="ag-studio-engine-item" data-engine="tdd_engineer" style="padding:10px;border-radius:8px;border:1px solid rgba(255,255,255,0.08);background:rgba(255,255,255,0.02);cursor:pointer;display:flex;flex-direction:column;gap:4px;">
            <div style="display:flex;justify-content:space-between;align-items:center;">
              <span style="font-size:12px;font-weight:700;color:#06b6d4;">TDD Test Engineer (Zero-Regression & Test-First)</span>
              <span style="font-size:9px;font-weight:600;font-family:monospace;padding:2px 6px;border-radius:4px;background:rgba(6,182,212,0.15);color:#06b6d4;">TEST-DRIVEN</span>
            </div>
            <div style="font-size:11px;color:#94a3b8;">Enforces test-first design, mock hermeticity, edge case boundary assertion, and regression-free diffs.</div>
          </div>

          <!-- Security Auditor -->
          <div class="ag-studio-engine-item" data-engine="security_auditor" style="padding:10px;border-radius:8px;border:1px solid rgba(255,255,255,0.08);background:rgba(255,255,255,0.02);cursor:pointer;display:flex;flex-direction:column;gap:4px;">
            <div style="display:flex;justify-content:space-between;align-items:center;">
              <span style="font-size:12px;font-weight:700;color:#eab308;">Security & Vulnerability Auditor (OWASP Top 10)</span>
              <span style="font-size:9px;font-weight:600;font-family:monospace;padding:2px 6px;border-radius:4px;background:rgba(234,179,8,0.15);color:#eab308;">OWASP / THREAT</span>
            </div>
            <div style="font-size:11px;color:#94a3b8;">Defensive threat modeling, injection prevention, token/secret leakage audits, and sanitization boundaries.</div>
          </div>

        </div>
      </div>

      <!-- TAB 3: 📊 TELEMETRY & QUOTA -->
      <div id="ag-tab-telemetry" class="ag-tab-content" style="display:none;flex-direction:column;gap:12px;">
        <div style="display:grid;grid-template-columns:repeat(2, 1fr);gap:8px;">
          <div style="background:rgba(255,255,255,0.02);border:1px solid rgba(255,255,255,0.08);border-radius:10px;padding:12px;">
            <div style="font-size:10px;color:#94a3b8;">Aggy 5-Hour Quota Remaining</div>
            <div id="ag-tab-5h-val" style="font-size:18px;font-weight:700;font-family:monospace;color:#38bdf8;margin-top:4px;">--</div>
            <div id="ag-tab-5h-reset" style="font-size:10px;color:#64748b;margin-top:2px;">Resets in --</div>
          </div>
          <div style="background:rgba(255,255,255,0.02);border:1px solid rgba(255,255,255,0.08);border-radius:10px;padding:12px;">
            <div style="font-size:10px;color:#94a3b8;">Aggy Weekly Quota Remaining</div>
            <div id="ag-tab-w-val" style="font-size:18px;font-weight:700;font-family:monospace;color:#a855f7;margin-top:4px;">--</div>
            <div id="ag-tab-w-reset" style="font-size:10px;color:#64748b;margin-top:2px;">Resets in --</div>
          </div>
        </div>

        <div style="display:grid;grid-template-columns:repeat(3, 1fr);gap:8px;background:rgba(56,189,248,0.05);border:1px solid rgba(56,189,248,0.2);border-radius:10px;padding:10px;">
          <div>
            <div style="font-size:10px;color:#38bdf8;">Context Depth</div>
            <div id="ag-studio-token-ctx" style="font-size:13px;font-weight:700;font-family:monospace;color:#f0f9ff;margin-top:2px;">--</div>
          </div>
          <div>
            <div style="font-size:10px;color:#38bdf8;">Cache Read Hit</div>
            <div id="ag-studio-token-cache" style="font-size:13px;font-weight:700;font-family:monospace;color:#38bdf8;margin-top:2px;">--%</div>
          </div>
          <div>
            <div style="font-size:10px;color:#38bdf8;">Today's Total Burn</div>
            <div id="ag-studio-token-total" style="font-size:13px;font-weight:700;font-family:monospace;color:#f0f9ff;margin-top:2px;">--M</div>
          </div>
        </div>

        <!-- RECENT TURNS STREAM -->
        <div style="background:rgba(255,255,255,0.02);border:1px solid rgba(255,255,255,0.08);border-radius:10px;padding:12px;display:flex;flex-direction:column;gap:8px;">
          <div style="display:flex;justify-content:space-between;align-items:center;">
            <div style="display:flex;align-items:center;gap:6px;">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
              <span style="font-size:11px;font-weight:600;color:#94a3b8;text-transform:uppercase;letter-spacing:0.5px;">Turn History</span>
            </div>
            <span id="ag-tab-turns-badge" style="font-size:10px;font-family:monospace;color:#38bdf8;padding:1px 6px;border-radius:4px;background:rgba(56,189,248,0.1);">-- turns</span>
          </div>
          <div id="ag-tab-turns-list" style="display:flex;flex-direction:column;gap:5px;max-height:160px;overflow-y:auto;padding-right:2px;">
            <div style="font-size:10px;color:#64748b;font-family:monospace;">No turns recorded in active session yet.</div>
          </div>
        </div>
      </div>

      <!-- TAB 4: 🎨 CANVAS & UI -->
      <div id="ag-tab-canvas" class="ag-tab-content" style="display:none;flex-direction:column;gap:12px;">
        <div style="display:grid;grid-template-columns:repeat(3, 1fr);gap:6px;">
          <button class="ag-theme-pill" data-theme="Cyberpunk" style="padding:8px;border-radius:8px;border:1px solid rgba(255,255,255,0.08);background:rgba(255,255,255,0.02);text-align:left;cursor:pointer;display:flex;align-items:center;gap:6px;color:#f1f5f9;">
            <div style="width:10px;height:10px;border-radius:50%;background:#f472b6;"></div>
            <div style="font-size:11px;font-weight:600;">Cyberpunk</div>
          </button>
          <button class="ag-theme-pill" data-theme="Sakura" style="padding:8px;border-radius:8px;border:1px solid rgba(255,255,255,0.08);background:rgba(255,255,255,0.02);text-align:left;cursor:pointer;display:flex;align-items:center;gap:6px;color:#f1f5f9;">
            <div style="width:10px;height:10px;border-radius:50%;background:#fbcfe8;"></div>
            <div style="font-size:11px;font-weight:600;">Sakura</div>
          </button>
          <button class="ag-theme-pill" data-theme="Cyan Matrix" style="padding:8px;border-radius:8px;border:1px solid rgba(255,255,255,0.08);background:rgba(255,255,255,0.02);text-align:left;cursor:pointer;display:flex;align-items:center;gap:6px;color:#f1f5f9;">
            <div style="width:10px;height:10px;border-radius:50%;background:#38bdf8;"></div>
            <div style="font-size:11px;font-weight:600;">Cyan Matrix</div>
          </button>
          <button class="ag-theme-pill" data-theme="Midnight" style="padding:8px;border-radius:8px;border:1px solid rgba(255,255,255,0.08);background:rgba(255,255,255,0.02);text-align:left;cursor:pointer;display:flex;align-items:center;gap:6px;color:#f1f5f9;">
            <div style="width:10px;height:10px;border-radius:50%;background:#818cf8;"></div>
            <div style="font-size:11px;font-weight:600;">Midnight</div>
          </button>
          <button class="ag-theme-pill" data-theme="Emerald" style="padding:8px;border-radius:8px;border:1px solid rgba(255,255,255,0.08);background:rgba(255,255,255,0.02);text-align:left;cursor:pointer;display:flex;align-items:center;gap:6px;color:#f1f5f9;">
            <div style="width:10px;height:10px;border-radius:50%;background:#10b981;"></div>
            <div style="font-size:11px;font-weight:600;">Emerald</div>
          </button>
          <button class="ag-theme-pill" data-theme="Amber" style="padding:8px;border-radius:8px;border:1px solid rgba(255,255,255,0.08);background:rgba(255,255,255,0.02);text-align:left;cursor:pointer;display:flex;align-items:center;gap:6px;color:#f1f5f9;">
            <div style="width:10px;height:10px;border-radius:50%;background:#f59e0b;"></div>
            <div style="font-size:11px;font-weight:600;">Amber</div>
          </button>
        </div>

        <div style="display:flex;justify-content:space-between;align-items:center;background:rgba(255,255,255,0.02);border:1px solid rgba(255,255,255,0.06);border-radius:10px;padding:10px 12px;">
          <div>
            <div style="font-size:12px;font-weight:600;">Message Box Layout</div>
            <div style="font-size:10px;color:#94a3b8;">Classic Clean (Full-Width) vs Bubble Mode</div>
          </div>
          <div style="display:flex;align-items:center;gap:6px;">
            <button id="ag-layout-classic-btn" type="button" style="padding:4px 10px;font-size:11px;border-radius:6px;border:1px solid ${!settings.chatBubbleMode ? '#f472b6' : 'rgba(255,255,255,0.1)'};background:${!settings.chatBubbleMode ? 'rgba(244,114,182,0.15)' : 'transparent'};color:${!settings.chatBubbleMode ? '#f472b6' : '#94a3b8'};cursor:pointer;">Classic Clean</button>
            <button id="ag-layout-bubble-btn" type="button" style="padding:4px 10px;font-size:11px;border-radius:6px;border:1px solid ${settings.chatBubbleMode ? '#f472b6' : 'rgba(255,255,255,0.1)'};background:${settings.chatBubbleMode ? 'rgba(244,114,182,0.15)' : 'transparent'};color:${settings.chatBubbleMode ? '#f472b6' : '#94a3b8'};cursor:pointer;">Bubble</button>
          </div>
        </div>

        <div style="display:flex;justify-content:space-between;align-items:center;background:rgba(255,255,255,0.02);border:1px solid rgba(255,255,255,0.06);border-radius:10px;padding:10px 12px;">
          <label style="font-size:12px;font-weight:600;">Monospace & UI Typography</label>
          <select id="ag-font-select" style="background:#1e1428;border:1px solid rgba(255,255,255,0.1);color:#f1f5f9;font-size:11px;padding:4px 8px;border-radius:6px;cursor:pointer;">
            <option value="default" ${settings.fontFamily === 'default' ? 'selected' : ''}>System Default</option>
            <option value="jetbrains" ${settings.fontFamily === 'jetbrains' ? 'selected' : ''}>JetBrains Mono</option>
            <option value="fira" ${settings.fontFamily === 'fira' ? 'selected' : ''}>Fira Code</option>
            <option value="jakarta" ${settings.fontFamily === 'jakarta' ? 'selected' : ''}>Plus Jakarta Sans</option>
            <option value="inter" ${settings.fontFamily === 'inter' ? 'selected' : ''}>Inter</option>
          </select>
        </div>
      </div>

      <!-- FOOTER -->
      <div style="display:flex;justify-content:space-between;align-items:center;border-top:1px solid rgba(255,255,255,0.08);padding-top:12px;margin-top:4px;">
        <button id="ag-stock-reset" style="background:transparent;border:none;color:#94a3b8;font-size:11px;cursor:pointer;text-decoration:underline;">Reset to Stock Antigravity</button>
        <span style="font-size:10px;color:#64748b;font-family:monospace;">Power Tools Suite v4.0 · Antigravity Native</span>
      </div>
    `;

    overlay.appendChild(modalBox);
    const parent = document.body || document.documentElement;
    if (parent) parent.appendChild(overlay);

    // Tab switcher
    overlay.querySelectorAll('.ag-tab-btn').forEach(btn => {
      btn.onclick = () => {
        const tabName = btn.getAttribute('data-tab');
        overlay.querySelectorAll('.ag-tab-btn').forEach(b => {
          b.style.borderColor = 'rgba(255,255,255,0.08)';
          b.style.background = 'rgba(255,255,255,0.03)';
          b.style.color = '#94a3b8';
        });
        btn.style.borderColor = 'rgba(244,114,182,0.4)';
        btn.style.background = 'rgba(244,114,182,0.15)';
        btn.style.color = '#f472b6';

        overlay.querySelectorAll('.ag-tab-content').forEach(c => c.style.display = 'none');
        const target = document.getElementById('ag-tab-' + tabName);
        if (target) target.style.display = 'flex';
      };
    });

    // Zero-Yap Toggle
    const zeroYapToggle = document.getElementById('ag-tool-zeroyap');
    if (zeroYapToggle) {
      zeroYapToggle.onchange = (e) => {
        daemonState.zeroYapMode = e.target.checked;
        window.fetch(`http://127.0.0.1:55979/set-toggle?key=zeroYapMode&val=${e.target.checked}`).catch(()=>{});
      };
    }

    // Destructive Guard Toggle
    const destructToggle = document.getElementById('ag-tool-destructguard');
    if (destructToggle) {
      destructToggle.onchange = (e) => {
        daemonState.destructiveGuard = e.target.checked;
        window.fetch(`http://127.0.0.1:55979/set-toggle?key=destructiveGuard&val=${e.target.checked}`).catch(()=>{});
      };
    }

    // Scratchpad Save
    const scratchpadSave = document.getElementById('ag-scratchpad-save');
    const scratchpadInput = document.getElementById('ag-scratchpad-input');
    const scratchpadStatus = document.getElementById('ag-scratchpad-status');
    if (scratchpadSave && scratchpadInput) {
      scratchpadSave.onclick = async () => {
        const text = scratchpadInput.value;
        daemonState.pinnedScratchpad = text;
        try {
          await window.fetch('http://127.0.0.1:55979/set-scratchpad', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ scratchpad: text })
          });
          if (scratchpadStatus) {
            scratchpadStatus.style.display = 'block';
            setTimeout(() => { scratchpadStatus.style.display = 'none'; }, 2500);
          }
        } catch(e) {}
      };
    }

    // Copy Handover Brief
    const handoverBtn = document.getElementById('ag-copy-handover');
    if (handoverBtn) {
      handoverBtn.onclick = () => {
        const text = `Please summarize our active progress, technical decisions made, and pending tasks in 5 bullet points so I can transfer context to a clean session.`;
        navigator.clipboard.writeText(text);
        handoverBtn.innerHTML = '<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg><span style="color:#10b981;">Copied</span>';
        setTimeout(() => {
          handoverBtn.innerHTML = '<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg><span>Copy Handover</span>';
        }, 2000);
      };
    }

    // Port Scan & Kill
    const portScanBtn = document.getElementById('ag-port-scan');
    const portResults = document.getElementById('ag-port-results');
    if (portScanBtn && portResults) {
      portScanBtn.onclick = async () => {
        portResults.innerHTML = '<span style="font-size:10px;color:#38bdf8;">Scanning local ports...</span>';
        try {
          const res = await window.fetch('http://127.0.0.1:55979/ports-sweep');
          const data = await res.json();
          if (!data.connections || data.connections.length === 0) {
            portResults.innerHTML = '<span style="font-size:10px;color:#10b981;">No active dev server ports currently listening.</span>';
            return;
          }
          portResults.innerHTML = '';
          data.connections.forEach(conn => {
            const pill = document.createElement('div');
            pill.style.cssText = 'display:inline-flex;align-items:center;gap:6px;padding:3px 8px;border-radius:6px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);font-family:monospace;font-size:10px;';
            pill.innerHTML = `<span>Port ${conn.LocalPort} (PID: ${conn.OwningProcess})</span><button data-port="${conn.LocalPort}" style="padding:1px 5px;background:#ef4444;border:none;border-radius:4px;color:#fff;cursor:pointer;font-size:9px;">Kill</button>`;
            pill.querySelector('button').onclick = async () => {
              await window.fetch(`http://127.0.0.1:55979/kill-port?port=${conn.LocalPort}`);
              pill.remove();
            };
            portResults.appendChild(pill);
          });
        } catch(e) {
          portResults.innerHTML = '<span style="font-size:10px;color:#ef4444;">Port scan unavailable.</span>';
        }
      };
    }

    // Theme pills
    overlay.querySelectorAll('.ag-theme-pill').forEach(btn => {
      btn.onclick = () => {
        settings.theme = btn.getAttribute('data-theme');
        saveSettings();
      };
    });

    // Font select
    const fontSelect = document.getElementById('ag-font-select');
    if (fontSelect) {
      fontSelect.onchange = (e) => {
        settings.fontFamily = e.target.value;
        saveSettings();
      };
    }

    // Layout buttons
    const layoutClassicBtn = document.getElementById('ag-layout-classic-btn');
    const layoutBubbleBtn = document.getElementById('ag-layout-bubble-btn');
    if (layoutClassicBtn && layoutBubbleBtn) {
      layoutClassicBtn.onclick = () => {
        settings.chatBubbleMode = false;
        saveSettings();
        updateModalUI();
      };
      layoutBubbleBtn.onclick = () => {
        settings.chatBubbleMode = true;
        saveSettings();
        updateModalUI();
      };
    }

    // Engine Selection
    overlay.querySelectorAll('.ag-studio-engine-item').forEach(item => {
      item.onclick = () => {
        const engKey = item.getAttribute('data-engine');
        setEngine(engKey, true);
      };
    });

    // Reset to stock
    const stockReset = overlay.querySelector('#ag-stock-reset');
    if (stockReset) {
      stockReset.onclick = () => {
        settings = Object.assign({}, DEFAULT_SETTINGS, { theme: 'Stock', wallpaperEnabled: false, activeEngine: 'stock_architect' });
        saveSettings();
        setEngine('stock_architect', true);
      };
    }

    const studioClose = overlay.querySelector('#ag-studio-close');
    if (studioClose) studioClose.onclick = () => { overlay.style.display = 'none'; };

    setupOutsideDismissal();
    fetchDaemonState();
  }

  function formatTokens(num) {
    if (!num) return '0';
    if (num >= 1000000) return (num / 1000000).toFixed(2) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'k';
    return String(num);
  }

  function updateTelemetryDisplay() {
    const todayVal = tokenStats.todayTokens || tokenStats.convTokens || 0;
    const formattedBurn = formatTokens(todayVal);

    // In Modal Tab 3: Telemetry
    const modTodayBurn = document.getElementById('ag-studio-token-total');
    if (modTodayBurn) modTodayBurn.textContent = formattedBurn + ' tokens';
    const modCtx = document.getElementById('ag-studio-token-ctx');
    if (modCtx) modCtx.textContent = formatTokens(tokenStats.currentContext) + ' ctx';
    const modCache = document.getElementById('ag-studio-token-cache');
    if (modCache) modCache.textContent = tokenStats.cacheRate + '%';
    const mod5hVal = document.getElementById('ag-tab-5h-val');
    if (mod5hVal && aggyQuota.gemini5hRemaining !== '--') mod5hVal.textContent = aggyQuota.gemini5hRemaining;
    const mod5hReset = document.getElementById('ag-tab-5h-reset');
    if (mod5hReset && aggyQuota.gemini5hReset !== '--') mod5hReset.textContent = 'Resets in ' + aggyQuota.gemini5hReset;
    const modWVal = document.getElementById('ag-tab-w-val');
    if (modWVal && aggyQuota.geminiWeeklyRemaining !== '--') modWVal.textContent = aggyQuota.geminiWeeklyRemaining;
    const modWReset = document.getElementById('ag-tab-w-reset');
    if (modWReset && aggyQuota.geminiWeeklyReset !== '--') modWReset.textContent = 'Resets in ' + aggyQuota.geminiWeeklyReset;

    // In Modal Tab 3: Recent Turns List (Turn Shower)
    const turnsBadge = document.getElementById('ag-tab-turns-badge');
    if (turnsBadge) turnsBadge.textContent = (tokenStats.totalTurns || 0) + ' turns';
    const turnsList = document.getElementById('ag-tab-turns-list');
    if (turnsList && tokenStats.recentTurns && tokenStats.recentTurns.length > 0) {
      let tHtml = '';
      tokenStats.recentTurns.forEach(t => {
        const eng = ENGINES[t.engineKey] || ENGINES['stock_architect'];
        const outTok = t.outputTokens ? formatTokens(t.outputTokens) : '';
        tHtml += `
          <div style="display:flex;align-items:center;justify-content:space-between;gap:8px;padding:6px 10px;background:rgba(255,255,255,0.02);border-radius:6px;border:1px solid rgba(255,255,255,0.05);font-size:11px;font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,monospace;">
            <div style="display:flex;align-items:center;gap:6px;overflow:hidden;">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#64748b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="shrink-0;"><polyline points="9 18 15 12 9 6"></polyline></svg>
              <span style="color:#94a3b8;font-weight:600;shrink-0;">T${t.turnIndex}</span>
              <span style="color:#e2e8f0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:240px;font-family:-apple-system,BlinkMacSystemFont,sans-serif;font-size:11px;">${t.promptSnippet || 'User prompt'}</span>
            </div>
            <div style="display:flex;align-items:center;gap:6px;shrink-0;">
              <span style="font-size:9px;padding:1px 6px;border-radius:4px;background:${eng.bg};color:${eng.color};border:1px solid ${eng.color}30;">${eng.name}</span>
              ${outTok ? `<span style="font-size:10px;color:#64748b;">${outTok}</span>` : ''}
            </div>
          </div>
        `;
      });
      turnsList.innerHTML = tHtml;
    }

    // In Token HUD
    const hudToday = document.getElementById('ag-token-today-val');
    if (hudToday) hudToday.textContent = formattedBurn + ' tokens';
    const hudCache = document.getElementById('ag-token-cache-val');
    if (hudCache) hudCache.textContent = tokenStats.cacheRate + '% hit';
    const hudLines = document.getElementById('ag-token-lines-val');
    if (hudLines) hudLines.textContent = (tokenStats.totalLinesConvo || '--') + ' lines';
    const hudTurns = document.getElementById('ag-token-turns-val');
    if (hudTurns) hudTurns.textContent = (tokenStats.totalTurns || '--') + ' turns';
    const hudCtxLabel = document.getElementById('ag-token-ctx-label');
    if (hudCtxLabel) hudCtxLabel.textContent = `${tokenStats.currentContext.toLocaleString()} / 1,000,000 (${Math.round((tokenStats.currentContext / 1000000) * 100)}%)`;
    const hudCtxBar = document.getElementById('ag-token-ctx-bar');
    if (hudCtxBar) hudCtxBar.style.width = Math.min(100, Math.round((tokenStats.currentContext / 1000000) * 100)) + '%';
    const hud5h = document.getElementById('ag-quota-5h-val');
    if (hud5h && aggyQuota.gemini5hRemaining !== '--') hud5h.textContent = `${aggyQuota.gemini5hRemaining} (Resets in ${aggyQuota.gemini5hReset})`;
    const hudW = document.getElementById('ag-quota-weekly-val');
    if (hudW && aggyQuota.geminiWeeklyRemaining !== '--') hudW.textContent = `${aggyQuota.geminiWeeklyRemaining} (Resets in ${aggyQuota.geminiWeeklyReset})`;
    const hudResetBadge = document.getElementById('ag-token-reset-badge');
    if (hudResetBadge && aggyQuota.gemini5hReset !== '--') hudResetBadge.textContent = `Aggy: Resets in ${aggyQuota.gemini5hReset} (${aggyQuota.gemini5hRemaining})`;

    // Bottom Bar Token Counter
    const tokBtn = document.getElementById('antigravity-token-counter');
    if (tokBtn) {
      tokBtn.innerHTML = `
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z"/>
        </svg>
        <span style="color:#38bdf8;font-weight:600;">${formatTokens(tokenStats.currentContext)}</span>
        <span style="color:#94a3b8;font-size:11px;">ctx</span>
        <span style="font-size:10px;padding:1px 4px;border-radius:4px;background:rgba(56,189,248,0.15);color:#38bdf8;">${tokenStats.cacheRate}%</span>
      `;
    }
  }

  function updateToolsUI() {
    const zeroYapToggle = document.getElementById('ag-tool-zeroyap');
    const zeroYapStatus = document.getElementById('ag-zeroyap-status');
    if (zeroYapToggle) {
      zeroYapToggle.checked = !!daemonState.zeroYapMode;
      if (zeroYapStatus) {
        if (daemonState.zeroYapMode) {
          zeroYapStatus.innerHTML = '<span style="color:#10b981;font-weight:700;">● ACTIVE</span> · Code-only diffs enforced in GEMINI.md';
          zeroYapStatus.style.display = 'block';
        } else {
          zeroYapStatus.style.display = 'none';
        }
      }
    }

    const destructToggle = document.getElementById('ag-tool-destructguard');
    const destructStatus = document.getElementById('ag-destruct-status');
    if (destructToggle) {
      destructToggle.checked = !!daemonState.destructiveGuard;
      if (destructStatus) {
        if (daemonState.destructiveGuard) {
          destructStatus.innerHTML = '<span style="color:#10b981;font-weight:700;">● GUARD ON</span> · Destructive operations require user confirmation';
          destructStatus.style.display = 'block';
        } else {
          destructStatus.style.display = 'none';
        }
      }
    }

    const scratchpadInput = document.getElementById('ag-scratchpad-input');
    const scratchpadStatus = document.getElementById('ag-scratchpad-status');
    if (scratchpadInput) {
      if (daemonState.pinnedScratchpad) {
        scratchpadInput.value = daemonState.pinnedScratchpad;
        if (scratchpadStatus) {
          scratchpadStatus.innerHTML = '<span style="color:#38bdf8;font-weight:700;">● PINNED</span> · Injected in GEMINI.md (' + daemonState.pinnedScratchpad.length + ' chars active)';
          scratchpadStatus.style.display = 'block';
        }
      }
    }
  }

  function updateModalUI() {
    const badge = document.getElementById('ag-studio-badge');
    if (badge) badge.textContent = settings.theme;

    const activeEng = getActiveEngineForCurrentChat();
    const overlay = document.getElementById('antigravity-tune-modal');
    if (overlay) {
      overlay.querySelectorAll('.ag-studio-engine-item').forEach(item => {
        const k = item.getAttribute('data-engine');
        if (k === activeEng) {
          item.style.borderColor = ENGINES[k]?.color || '#f472b6';
          item.style.background = 'rgba(255,255,255,0.06)';
        } else {
          item.style.borderColor = 'rgba(255,255,255,0.08)';
          item.style.background = 'rgba(255,255,255,0.02)';
        }
      });
    }

    // Update Context Health Meter
    const ctxBar = document.getElementById('ag-context-bar');
    const ctxBadge = document.getElementById('ag-context-badge');
    const ctxAdvice = document.getElementById('ag-context-advice');
    if (ctxBar && tokenStats.currentContext) {
      const pct = Math.min(100, Math.round((tokenStats.currentContext / 200000) * 100));
      ctxBar.style.width = `${Math.max(4, pct)}%`;
      ctxBar.style.background = tokenStats.healthColor;
      if (ctxBadge) {
        ctxBadge.textContent = `${tokenStats.contextHealth.toUpperCase()} (${(tokenStats.currentContext / 1000).toFixed(0)}k)`;
        ctxBadge.style.color = tokenStats.healthColor;
        ctxBadge.style.background = `rgba(${hexToRgb(tokenStats.healthColor)}, 0.15)`;
      }
      if (ctxAdvice) ctxAdvice.textContent = tokenStats.healthAdvice;
    }

    updateTelemetryDisplay();
  }

  // --- MOUNTING: SIDEBAR BUTTON (NATIVE INTEGRATION) ---
  window.__agEnsureTuneButton = function() {
    // Look for Automations and Customizations in sidebar
    const autoBtn = document.querySelector('button[data-testid="automations-button"]') || document.querySelector('[href*="automation"]');
    const custLink = document.querySelector('a[href="/customizations"]') || document.querySelector('[href*="customiz"]');
    
    // Clean up any rogue fixed button
    const oldFixed = document.querySelectorAll('#antigravity-tune-btn');
    oldFixed.forEach(el => {
      if (el.style.position === 'fixed') el.remove();
    });

    if (!autoBtn || !custLink) return;

    let tuneBtn = document.getElementById('antigravity-tune-btn');
    if (!tuneBtn) {
      tuneBtn = document.createElement('button');
      tuneBtn.id = 'antigravity-tune-btn';
      tuneBtn.className = autoBtn.className;
      tuneBtn.setAttribute('data-testid', 'tune-button');
      tuneBtn.innerHTML = `
        <span class="shrink-0 flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 -960 960 960" fill="currentColor">
            <path d="M440-160v-160h80v60h320v40H520v60h-80Zm-320-60v-40h240v40H120Zm240-180v-60H120v-40h240v-60h80v160h-80Zm160-60v-40h360v40H520Zm160-180v-160h80v60h120v40H760v60h-80Zm-560-60v-40h480v40H120Z"/>
          </svg>
        </span>
        <span class="truncate text-sm font-medium text-pink-400">Power Tools</span>
      `;

      tuneBtn.onclick = function(e) {
        e.preventDefault();
        e.stopPropagation();
        const modal = document.getElementById('antigravity-tune-modal');
        if (modal) {
          modal.style.display = (modal.style.display === 'flex') ? 'none' : 'flex';
          updateModalUI();
          fetchDaemonState();
        }
      };

      autoBtn.parentNode.insertBefore(tuneBtn, custLink);
    } else {
      tuneBtn.onclick = function(e) {
        e.preventDefault();
        e.stopPropagation();
        const modal = document.getElementById('antigravity-tune-modal');
        if (modal) {
          modal.style.display = (modal.style.display === 'flex') ? 'none' : 'flex';
          updateModalUI();
          fetchDaemonState();
        }
      };
      if (tuneBtn.nextElementSibling !== custLink && autoBtn.parentNode) {
        autoBtn.parentNode.insertBefore(tuneBtn, custLink);
      }
    }
  };

  // --- MOUNTING: CHAT FOOTER CONTROLS (TOKEN COUNTER + ENGINE SWITCHER) ---
  window.__agEnsureBottomControls = function() {
    const turboBtn = document.querySelector('button[data-testid="permissions-selector-trigger"]');
    if (!turboBtn) return;
    const parent = turboBtn.parentElement;
    if (!parent) return;

    ensurePopovers();

    // 1. TOKEN COUNTER BUTTON (Inside Chat Input Footer)
    let tokenBtn = document.getElementById('antigravity-token-counter');
    if (!tokenBtn || tokenBtn.style.position === 'fixed') {
      if (tokenBtn) tokenBtn.remove();
      tokenBtn = document.createElement('button');
      tokenBtn.id = 'antigravity-token-counter';
      tokenBtn.className = 'flex cursor-pointer items-center h-7 gap-1.5 px-2.5 rounded-md text-xs font-mono transition-colors text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 shrink-0';
      tokenBtn.title = 'Click to view Token & Quota Telemetry';

      tokenBtn.onclick = function(e) {
        e.preventDefault();
        e.stopPropagation();
        const hud = document.getElementById('antigravity-token-hud');
        if (hud) {
          hud.style.display = (hud.style.display === 'flex') ? 'none' : 'flex';
          if (hud.style.display === 'flex') fetchAggyQuota();
        }
      };

      parent.insertBefore(tokenBtn, turboBtn);
    }

    const kVal = (tokenStats.currentContext >= 1000) ? (tokenStats.currentContext / 1000).toFixed(1) + 'k' : (tokenStats.currentContext || '0');
    tokenBtn.innerHTML = `
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z"/>
      </svg>
      <span style="color:#38bdf8;font-weight:600;">${kVal}</span>
      <span style="color:#94a3b8;font-size:11px;">ctx</span>
      <span style="font-size:10px;padding:1px 4px;border-radius:4px;background:rgba(56,189,248,0.15);color:#38bdf8;">${tokenStats.cacheRate}%</span>
    `;

    // 2. ENGINE SWITCHER BUTTON (Inside Chat Input Footer)
    let engineBtn = document.getElementById('antigravity-engine-switcher');
    const currentEngKey = getActiveEngineForCurrentChat();
    const eng = ENGINES[currentEngKey] || ENGINES['stock_architect'];

    if (!engineBtn) {
      engineBtn = document.createElement('button');
      engineBtn.id = 'antigravity-engine-switcher';
      engineBtn.className = 'flex cursor-pointer items-center h-7 gap-1.5 px-2.5 rounded-md text-xs font-mono transition-colors text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 shrink-0';
      engineBtn.title = 'Click to switch Cognitive Engine (Locked to this chat)';

      engineBtn.onclick = function(e) {
        e.preventDefault();
        e.stopPropagation();
        const menu = document.getElementById('antigravity-engine-menu');
        if (menu) {
          menu.style.display = (menu.style.display === 'flex') ? 'none' : 'flex';
        }
      };

      parent.insertBefore(engineBtn, tokenBtn);
    }

    engineBtn.innerHTML = `
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="${eng.color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="10"/><path d="m10 15 5-3-5-3v6Z"/>
      </svg>
      <span style="color:${eng.color};font-weight:600;">${eng.name}</span>
    `;
    engineBtn.style.borderColor = eng.color + '66';
    engineBtn.style.background = eng.bg;
  };

  // --- TRANSCRIPT TURN CHIPS (THE TURN SHOWER) ---
  window.__agEnsureChatTurnChips = function() {
    const userNodes = document.querySelectorAll('[data-testid="user-input-step"], [data-testid*="user-message"], .user-message');
    const activeEngKey = getActiveEngineForCurrentChat();
    const activeEng = ENGINES[activeEngKey] || ENGINES['stock_architect'];

    userNodes.forEach((node, idx) => {
      let chip = node.querySelector('.ag-turn-chip');
      if (!chip) {
        chip = document.createElement('div');
        chip.className = 'ag-turn-chip';
        const cardBorder = node.querySelector('.bg-card-border') || node;
        cardBorder.parentNode.insertBefore(chip, cardBorder.nextSibling);
      }
      chip.style.cssText = `display:inline-flex;align-items:center;gap:6px;font-size:10px;font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,monospace;padding:2px 8px;border-radius:6px;background:rgba(255,255,255,0.03);color:#94a3b8;border:1px solid rgba(255,255,255,0.08);margin-top:6px;margin-bottom:2px;width:fit-content;line-height:14px;letter-spacing:0.1px;user-select:none;`;
      
      const turnNum = (tokenStats.totalTurns || (idx + 1));
      const ctxStr = tokenStats.currentContext ? `${(tokenStats.currentContext / 1000).toFixed(0)}k` : '';
      chip.innerHTML = `
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="opacity:0.5;shrink-0;">
          <polyline points="9 18 15 12 9 6"></polyline>
        </svg>
        <span style="color:#e2e8f0;font-weight:600;">Turn ${turnNum}</span>
        <span style="opacity:0.25;">·</span>
        <span style="color:${activeEng.color};font-weight:500;">${activeEng.name}</span>
        ${ctxStr ? `<span style="opacity:0.25;">·</span><span style="color:#64748b;">${ctxStr} ctx</span>` : ''}
      `;
    });
  };

  window.__agUpdateTokens = function(stats) {
    if (!stats) return;
    tokenStats = Object.assign(tokenStats, stats);
    window.__agEnsureBottomControls();
    window.__agEnsureChatTurnChips();
    updateModalUI();
  };

  window.__agUpdateEngineDisplay = function() {
    window.__agEnsureBottomControls();
    window.__agEnsureChatTurnChips();
    updateModalUI();
  };

  // Safe Lifecycle Boot
  ensurePopovers();
  window.__agEnsureTuneButton();
  window.__agEnsureBottomControls();
  window.__agEnsureChatTurnChips();
  applyAll();
  fetchAggyQuota();
  setInterval(fetchAggyQuota, 60000);

  // Periodic Observer to keep controls anchored cleanly across route changes
  setInterval(() => {
    window.__agEnsureTuneButton();
    window.__agEnsureBottomControls();
    window.__agEnsureChatTurnChips();
  }, 1000);
})();

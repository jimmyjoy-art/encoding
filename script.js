(() => {
  'use strict';

  // ---------- QP DICTIONARY (Your provided mapping) ----------
  const QP = {
    "A":"=41","B":"=42","C":"=43","D":"=44","E":"=45","F":"=46","G":"=47","H":"=48","I":"=49","J":"=4A",
    "K":"=4B","L":"=4C","M":"=4D","N":"=4E","O":"=4F","P":"=50","Q":"=51","R":"=52","S":"=53","T":"=54",
    "U":"=55","V":"=56","W":"=57","X":"=58","Y":"=59","Z":"=5A","a":"=61","b":"=62","c":"=63","d":"=64",
    "e":"=65","f":"=66","g":"=67","h":"=68","i":"=69","j":"=6A","k":"=6B","l":"=6C","m":"=6D","n":"=6E",
    "o":"=6F","p":"=70","q":"=71","r":"=72","s":"=73","t":"=74","u":"=75","v":"=76","w":"=77","x":"=78",
    "y":"=79","z":"=7A","0":"=30","1":"=31","2":"=32","3":"=33","4":"=34","5":"=35","6":"=36","7":"=37",
    "8":"=38","9":"=39"," ":"=20","!":"=21","\"":"=22","#":"=23","$":"=24","%":"=25","&":"=26","'":"=27",
    "(":"=28",")":"=29","*":"=2A","+":"=2B",",":"=2C","-":"=2D",".":"=2E","/":"=2F",":":"=3A",";":"=3B",
    "<":"=3C","=":"=3D",">":"=3E","?":"=3F","@":"=40","[":"=5B","\\":"=5C","]":"=5D","^":"=5E","_":"=5F",
    "`":"=60","{":"=7B","|":"=7C","}":"=7D","~":"=7E"
  };

  // Reverse map for decoding
  const QP_REVERSE = Object.fromEntries(Object.entries(QP).map(([k,v]) => [v,k]));

  // ---------- DOM references ----------
  const $ = sel => document.querySelector(sel);
  const d = document;

  const inputEl = $('#input');
  const outputEl = $('#output');
  const encodeBtn = $('#encodeBtn');
  const decodeBtn = $('#decodeBtn');
  const copyBtn = $('#copyBtn');
  const clearBtn = $('#clearBtn');
  const autoBtn = $('#autoBtn');
  const autoStateEl = $('#autoState');
  const toastRoot = $('#toast');
  const downloadBtn = $('#downloadBtn');
  const exportQPBtn = $('#exportQPBtn');

  const stats = {
    inChars: $('#statChars'),
    outLen: $('#statOutLen'),
    eq: $('#statEq'),
    lines: $('#statLines'),
    time: $('#statTime'),
    inCharsSmall: $('#inChars'),
    outLenSmall: $('#outLen'),
    eqSmall: $('#eqCount')
  };

  // ---------- Settings ----------
  const LINE_WRAP = 76;
  let AUTO_MODE = true;
  const THEME_KEY = 'qp_theme';
  const AUTO_KEY = 'qp_auto';

  // Initialize page
  function init() {
    // theme
    const saved = localStorage.getItem(THEME_KEY) || 'dark';
    setTheme(saved);
    document.getElementById('year').textContent = new Date().getFullYear();

    // auto mode
    const autoSaved = localStorage.getItem(AUTO_KEY);
    if (autoSaved !== null) AUTO_MODE = autoSaved === '1';
    autoStateEl.textContent = AUTO_MODE ? 'ON' : 'OFF';

    bind();
    updateStats();
  }

  // ---------- Theme toggle ----------
  $('#themeToggle').addEventListener('click', () => {
    const current = document.body.dataset.theme === 'light' ? 'light' : 'dark';
    const next = current === 'light' ? 'dark' : 'light';
    setTheme(next);
    showToast(`Theme switched to ${next}`, 'info');
  });

  function setTheme(name) {
    if (name === 'light') {
      document.body.dataset.theme = 'light';
      document.getElementById('bg-gradient').style.opacity = '0.6';
    } else {
      document.body.dataset.theme = 'dark';
      document.getElementById('bg-gradient').style.opacity = '1';
    }
    localStorage.setItem(THEME_KEY, name);
    $('#themeToggle').setAttribute('aria-pressed', String(name === 'dark'));
  }

  // ---------- Binding ----------
  function bind() {
    encodeBtn.addEventListener('click', () => runOp('encode'));
    decodeBtn.addEventListener('click', () => runOp('decode'));
    copyBtn.addEventListener('click', copyOutput);
    clearBtn.addEventListener('click', clearAll);
    autoBtn.addEventListener('click', toggleAuto);
    downloadBtn.addEventListener('click', downloadOutput);
    exportQPBtn.addEventListener('click', exportAsQP);

    inputEl.addEventListener('input', onInputChange);

    // keyboard shortcuts
    window.addEventListener('keydown', (e) => {
      const ctrl = e.ctrlKey || e.metaKey;
      if (ctrl && e.key.toLowerCase() === 'e') { e.preventDefault(); runOp('encode'); }
      if (ctrl && e.key.toLowerCase() === 'd') { e.preventDefault(); runOp('decode'); }
      if (ctrl && e.key.toLowerCase() === 'c') { e.preventDefault(); copyOutput(); }
      if (ctrl && e.key.toLowerCase() === 'l') { e.preventDefault(); clearAll(); }
      if (ctrl && e.shiftKey && e.key.toLowerCase() === 's') { e.preventDefault(); downloadOutput(); }
    });
  }

  // ---------- Input change updates stats & auto detection ----------
  function onInputChange() {
    updateStats();
    if (AUTO_MODE) {
      const val = inputEl.value;
      if (looksLikeQP(val)) {
        // show subtle action suggestion (no auto-run to avoid accidental overwrites)
        // optionally auto-run decode:
        // runOp('decode');
      }
    }
  }

  function toggleAuto() {
    AUTO_MODE = !AUTO_MODE;
    autoStateEl.textContent = AUTO_MODE ? 'ON' : 'OFF';
    localStorage.setItem(AUTO_KEY, AUTO_MODE ? '1' : '0');
    showToast('Auto-detect ' + (AUTO_MODE ? 'enabled' : 'disabled'), 'info');
  }

  // ---------- Core runner ----------
  async function runOp(opHint) {
    const start = performance.now();
    const raw = inputEl.value;
    if (!raw) { showToast('Input is empty', 'danger'); return; }

    // if auto mode: detect
    let op = opHint;
    if (AUTO_MODE) {
      if (looksLikeQP(raw)) op = 'decode';
      else if (opHint === 'decode' && !looksLikeQP(raw)) {
        // user forced decode but text doesn't look like QP: allow fallback
      }
    }

    // show loading effect
    encodeBtn.disabled = decodeBtn.disabled = true;
    const result = op === 'encode' ? encodeQP(raw) : decodeQP(raw);
    outputEl.value = result;
    const took = Math.round(performance.now() - start);

    // wrap/format final output (RFC wrapping already applied in encode)
    updateStats();
    encodeBtn.disabled = decodeBtn.disabled = false;
    showToast(`${op.charAt(0).toUpperCase()+op.slice(1)} complete • ${took} ms`, 'success');

    // stats
    stats.time.textContent = took;
  }

  // ---------- Heuristics ----------
  function looksLikeQP(text) {
    // if contains =XX hex sequences commonly used in QP
    return /=([A-Fa-f0-9]{2})/.test(text);
  }

  // ---------- Encode / Decode implementations ----------
  function encodeQP(input) {
    // We encode char-by-char using QP map, fallback to hex if missing.
    let out = '';
    for (let i = 0; i < input.length; i++) {
      const ch = input[i];
      if (QP.hasOwnProperty(ch)) {
        out += QP[ch];
      } else {
        // fallback: encode as HEX (UTF-16 code unit -> may turn into BOM for multi-byte, acceptable fallback)
        const code = input.charCodeAt(i);
        const hex = code.toString(16).toUpperCase().padStart(2, '0');
        out += '=' + hex;
      }
    }
    // wrap at 76 characters with soft break (RFC) by inserting "=\r\n"
    // ensure we don't break an =XX sequence
    let wrapped = '';
    let idx = 0;
    while (idx < out.length) {
      const chunk = out.slice(idx, idx + LINE_WRAP);
      // ensure we don't cut inside an =XX sequence:
      const lastEq = chunk.lastIndexOf('=');
      if (lastEq > -1 && (chunk.length - lastEq) < 3 && (idx + LINE_WRAP) < out.length) {
        // move back so we end before the '='
        const cut = idx + lastEq;
        wrapped += out.slice(idx, cut) + '=\r\n';
        idx = cut;
      } else {
        wrapped += chunk;
        if ((idx + LINE_WRAP) < out.length) wrapped += '=\r\n';
        idx += LINE_WRAP;
      }
    }
    return wrapped;
  }

  function decodeQP(input) {
    // Remove soft line breaks "=\r\n" or "=\n"
    let cleaned = input.replace(/=\r?\n/g, '');
    // Replace =XX with characters using reverse map fallback
    const decoded = cleaned.replace(/=([A-Fa-f0-9]{2})/g, (m, hex) => {
      const token = '=' + hex.toUpperCase();
      if (QP_REVERSE[token]) return QP_REVERSE[token];
      // fallback to interpreting hex to char
      const code = parseInt(hex, 16);
      return String.fromCharCode(code);
    });
    return decoded;
  }

  // ---------- Utilities ----------
  function copyOutput() {
    const txt = outputEl.value;
    if (!txt) { showToast('Nothing to copy', 'danger'); return; }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(txt).then(() => showToast('Output copied to clipboard', 'success'));
    } else {
      outputEl.select();
      document.execCommand('copy');
      showToast('Output copied (legacy)', 'success');
    }
  }

  function clearAll() {
    inputEl.value = '';
    outputEl.value = '';
    updateStats();
    showToast('Cleared', 'info');
  }

  function updateStats() {
    const inText = inputEl.value || '';
    const outText = outputEl.value || '';

    const inLen = inText.length;
    const outLen = outText.length;
    const eqCount = (outText.match(/=[A-F0-9]{2}/gi) || []).length;
    const lines = outText.split(/\r?\n/).length;

    // small displays
    stats.inChars.textContent = inLen;
    stats.outLen.textContent = outLen;
    stats.eq.textContent = eqCount;
    stats.lines.textContent = lines;

    // tiny
    stats.inCharsSmall.textContent = inLen;
    stats.outLenSmall.textContent = outLen;
    stats.eqSmall.textContent = eqCount;

    // keep mirrored
    stats.inCharsSmall.textContent = inLen;
    stats.outLenSmall.textContent = outLen;
    stats.eqSmall.textContent = eqCount;
  }

  // ---------- Toasts ----------
  let toastTimer = null;
  function showToast(message, type='info') {
    const el = document.createElement('div');
    el.className = 'toast show';
    el.textContent = message;
    if (type === 'success') el.style.borderLeft = '4px solid ' + getComputedStyle(document.documentElement).getPropertyValue('--success') || '#3ad29f';
    if (type === 'danger') el.style.borderLeft = '4px solid var(--danger)';
    toastRoot.appendChild(el);
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      el.classList.remove('show');
      el.style.opacity = '0';
      setTimeout(() => el.remove(), 360);
    }, 2200);
  }

  // ---------- Download / Export ----------
  function downloadOutput() {
    const content = outputEl.value;
    if (!content) { showToast('No output to download', 'danger'); return; }
    const blob = new Blob([content], {type: 'text/plain;charset=utf-8'});
    const filename = `qp-output-${new Date().toISOString().slice(0,19).replace(/[:T]/g,'-')}.txt`;
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = filename; document.body.appendChild(a);
    a.click(); a.remove(); URL.revokeObjectURL(url);
    showToast('Downloaded as ' + filename, 'success');
  }

  function exportAsQP() {
    const content = outputEl.value;
    if (!content) { showToast('No output to export', 'danger'); return; }
    const blob = new Blob([content], {type: 'text/plain;charset=utf-8'});
    const filename = `qp-${new Date().toISOString().slice(0,19).replace(/[:T]/g,'-')}.qp`;
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = filename; document.body.appendChild(a);
    a.click(); a.remove(); URL.revokeObjectURL(url);
    showToast('Exported .qp • ' + filename, 'success');
  }

  // ---------- Init ----------
  init();

  // Update stats live when output changes (for e.g., after ops)
  new MutationObserver(updateStats).observe(outputEl, {attributes:true, childList:true, subtree:true});

  // Ensure stats also update after manual changes
  inputEl.addEventListener('input', () => updateStats());
  outputEl.addEventListener('input', () => updateStats());

})();

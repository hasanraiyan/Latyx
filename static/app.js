document.addEventListener('DOMContentLoaded', () => {
  // DOM Elements
  const editorEl = document.getElementById('editor');
  const previewPane = document.getElementById('preview-pane');
  const editorPane = document.getElementById('editor-pane');
  const resizer = document.getElementById('resizer');
  const pdfFrame = document.getElementById('pdfFrame');

  const compileBtn = document.getElementById('compileBtn');
  const downloadBtn = document.getElementById('downloadBtn');
  const copyLinkBtn = document.getElementById('copyLinkBtn');
  const copyLinkText = document.getElementById('copyLinkText');
  const clearBtn = document.getElementById('clearBtn');
  const compilerSelect = document.getElementById('compilerSelect');

  const loadingOverlay = document.getElementById('loadingOverlay');
  const logPanel = document.getElementById('log-panel');
  const logContent = document.getElementById('log-content');
  const closeLogBtn = document.getElementById('closeLogBtn');
  const statusText = document.getElementById('statusText');

  // AI Elements
  const toggleAiBtn = document.getElementById('toggleAiBtn');
  const aiPane = document.getElementById('ai-pane');
  const closeAiBtn = document.getElementById('closeAiBtn');
  const aiMessages = document.getElementById('ai-messages');
  const aiInput = document.getElementById('aiInput');
  const sendAiBtn = document.getElementById('sendAiBtn');
  const fixErrorBtn = document.getElementById('fixErrorBtn');
  const designSystemSelect = document.getElementById('designSystemSelect');

  // State
  let isResizing = false;
  let saveTimeout = null;

  // --- Editor Setup ---
  const editor = ace.edit('editor');
  editor.setTheme('ace/theme/tomorrow');
  editor.session.setMode('ace/mode/latex');
  editor.setOptions({
    fontSize: '14px',
    showPrintMargin: false,
    wrap: true,
    enableBasicAutocompletion: true,
    enableLiveAutocompletion: true,
    tabSize: 2,
  });

  // Load from LocalStorage
  const savedSource = localStorage.getItem('latexSource');
  const savedCompiler = localStorage.getItem('latexCompiler');

  if (savedCompiler) {
    compilerSelect.value = savedCompiler;
  }

  const defaultSource =
    '\\documentclass{article}\n\\begin{document}\n\\section{Introduction}\nHello from your new SaaS LaTeX Editor.\n\nStart typing and hit Compile!\n\\end{document}';
  editor.setValue(savedSource || defaultSource, -1);

  // Auto-save
  editor.session.on('change', () => {
    setStatus('Unsaved changes...', 'text-amber-600');
    clearTimeout(saveTimeout);
    saveTimeout = setTimeout(() => {
      localStorage.setItem('latexSource', editor.getValue());
      setStatus('Saved locally', 'text-slate-500');
    }, 1000);
  });

  // Save compiler selection
  compilerSelect.addEventListener('change', () => {
    localStorage.setItem('latexCompiler', compilerSelect.value);
  });

  // --- Resizer Logic ---
  resizer.addEventListener('mousedown', (e) => {
    isResizing = true;
    document.body.style.cursor = 'col-resize';
    resizer.classList.add('active');
    // Disable pointer events on iframes to prevent capturing mouseup
    pdfFrame.style.pointerEvents = 'none';
  });

  document.addEventListener('mousemove', (e) => {
    if (!isResizing) return;
    const containerWidth = document.body.clientWidth;
    // Calculate percentage
    let newEditorWidth = (e.clientX / containerWidth) * 100;

    // Constraints (20% to 80%)
    if (newEditorWidth < 20) newEditorWidth = 20;
    if (newEditorWidth > 80) newEditorWidth = 80;

    editorPane.style.width = `${newEditorWidth}%`;
    editor.resize(); // Ace resize
  });

  document.addEventListener('mouseup', () => {
    if (isResizing) {
      isResizing = false;
      document.body.style.cursor = 'default';
      resizer.classList.remove('active');
      pdfFrame.style.pointerEvents = 'auto';
    }
  });

  // --- Compilation Logic ---
  async function compile() {
    showLoading(true);
    hideLog();
    setStatus('Compiling...', 'text-indigo-600');

    try {
      const source = editor.getValue();
      const compiler = compilerSelect.value;

      // Use query param for debug if needed, keeping simple for now
      const response = await fetch('/compile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          source_code: source,
          compiler: compiler,
        }),
      });

      const contentType = response.headers.get('content-type');
      let data;

      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        // Fallback for non-JSON errors (like 502/504 from proxy)
        const text = await response.text();
        throw new Error(text || `Server returned ${response.status}`);
      }

      if (response.ok && data.success) {
        const url = data.pdf_url;
        // Force reload of iframe by adding timestamp if needed, or just src
        pdfFrame.src = url;

        // Update download button
        downloadBtn.href = url;
        downloadBtn.classList.remove('opacity-50', 'cursor-not-allowed', 'pointer-events-none');
        downloadBtn.classList.add('hover:bg-indigo-700');
        downloadBtn.removeAttribute('disabled');

        // Update copy link button
        copyLinkBtn.dataset.url = url;
        copyLinkBtn.classList.remove('opacity-50', 'cursor-not-allowed', 'pointer-events-none');
        copyLinkBtn.classList.add('hover:bg-slate-50', 'cursor-pointer');

        setStatus('Compilation successful', 'text-emerald-600');
      } else {
        // Handle compilation error
        throw new Error(data.log || data.detail || data.error || 'Unknown error');
      }
    } catch (error) {
      console.error(error);
      showLog(error.message);
      setStatus('Compilation failed', 'text-rose-600');
    } finally {
      showLoading(false);
    }
  }

  // --- UI Helpers ---
  function showLoading(show) {
    loadingOverlay.hidden = !show;
    compileBtn.disabled = show;
    if (show) {
      compileBtn.classList.add('opacity-75', 'cursor-wait');
    } else {
      compileBtn.classList.remove('opacity-75', 'cursor-wait');
    }
  }

  function setStatus(text, colorClass) {
    statusText.textContent = text;
    // Reset classes
    statusText.className = 'text-sm font-medium transition-colors duration-300';
    if (colorClass) statusText.classList.add(colorClass);
  }

  function showLog(message) {
    logContent.textContent = message || 'No details available.';
    logPanel.classList.remove('collapsed');
    if (!toggleAiBtn.classList.contains('hidden')) {
      fixErrorBtn.classList.remove('hidden');
      fixErrorBtn.classList.add('flex');
    }
  }

  function hideLog() {
    logPanel.classList.add('collapsed');
  }

  // --- AI Logic ---
  fetch('/health')
    .then((r) => r.json())
    .then((data) => {
      if (data.ai_enabled) {
        toggleAiBtn.classList.remove('hidden');
      }
    })
    .catch(console.error);

  // Load Design Systems
  fetch('/design-systems')
    .then((r) => r.json())
    .then((systems) => {
      if (Array.isArray(systems)) {
        systems.forEach((sys) => {
          const option = document.createElement('option');
          option.value = sys.id;
          option.textContent = sys.name;
          option.title = sys.description;
          designSystemSelect.appendChild(option);
        });
      }
    })
    .catch((err) => console.error('Failed to load design systems:', err));

  function toggleAiPane(show) {
    if (show) {
      aiPane.classList.remove('translate-x-full');
    } else {
      aiPane.classList.add('translate-x-full');
    }
  }

  toggleAiBtn.addEventListener('click', () => toggleAiPane(true));
  closeAiBtn.addEventListener('click', () => toggleAiPane(false));

  // Clear initial empty state
  let isInitialState = true;

  function addAiMessage(text, isUser = false) {
    if (isInitialState) {
      aiMessages.innerHTML = '';
      isInitialState = false;
    }

    const container = document.createElement('div');
    container.className = `flex gap-3 ${isUser ? 'flex-row-reverse' : ''}`;

    const avatar = document.createElement('div');
    avatar.className = `w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm ${
      isUser ? 'bg-indigo-100 text-indigo-600' : 'bg-white border border-slate-200 text-emerald-600'
    }`;
    avatar.innerHTML = isUser
      ? '<svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>'
      : '<span>🤖</span>';

    const contentDiv = document.createElement('div');
    contentDiv.className = `max-w-[85%] p-3.5 text-sm leading-relaxed shadow-sm ${
      isUser
        ? 'bg-indigo-600 text-white rounded-2xl rounded-tr-none'
        : 'bg-white border border-slate-100 text-slate-700 rounded-2xl rounded-tl-none'
    }`;

    // Handle code blocks or newlines simply
    contentDiv.innerText = text;

    container.appendChild(avatar);
    container.appendChild(contentDiv);

    // Animation
    container.style.opacity = '0';
    container.style.transform = 'translateY(10px)';
    container.style.transition = 'all 0.3s ease';

    aiMessages.appendChild(container);

    // Trigger reflow
    void container.offsetWidth;

    container.style.opacity = '1';
    container.style.transform = 'translateY(0)';

    aiMessages.scrollTop = aiMessages.scrollHeight;
  }

  function addToolMessage(tool) {
    if (isInitialState) {
      aiMessages.innerHTML = '';
      isInitialState = false;
    }

    const container = document.createElement('div');
    container.className = 'flex gap-3 mb-4';

    const avatar = document.createElement('div');
    avatar.className =
      'w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 bg-slate-100 text-slate-500 border border-slate-200 mt-1';
    avatar.innerHTML =
      '<svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>';

    const contentDiv = document.createElement('div');
    contentDiv.className =
      'max-w-[85%] text-xs font-mono bg-slate-50 border border-slate-200 text-slate-600 rounded-lg p-3 w-full shadow-sm';

    const headerDiv = document.createElement('div');
    headerDiv.className = 'flex justify-between items-center cursor-pointer select-none';

    const title = document.createElement('div');
    title.className = 'font-bold text-indigo-600 flex items-center gap-2';
    title.innerHTML = `<span>⚡ Used tool: ${tool.name}</span>`;

    const chevron = document.createElement('span');
    chevron.innerHTML =
      '<svg class="w-4 h-4 transform transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" /></svg>';

    headerDiv.appendChild(title);
    headerDiv.appendChild(chevron);

    const details = document.createElement('div');
    details.className = 'hidden mt-3 space-y-3 border-t border-slate-200 pt-2 transition-all';

    // Args
    const argsDiv = document.createElement('div');
    argsDiv.innerHTML = `<div class="font-semibold text-slate-500 mb-1">Input:</div><pre class="bg-white p-2 rounded border border-slate-100 overflow-x-auto text-[10px]">${JSON.stringify(tool.args, null, 2)}</pre>`;

    // Output
    const outputDiv = document.createElement('div');
    let outputText = String(tool.output);
    if (outputText.length > 500) outputText = outputText.substring(0, 500) + '... (truncated)';
    outputDiv.innerHTML = `<div class="font-semibold text-slate-500 mb-1">Output:</div><pre class="bg-white p-2 rounded border border-slate-100 overflow-x-auto text-slate-500 text-[10px] whitespace-pre-wrap">${outputText}</pre>`;

    details.appendChild(argsDiv);
    details.appendChild(outputDiv);

    contentDiv.appendChild(headerDiv);
    contentDiv.appendChild(details);

    // Toggle logic
    headerDiv.onclick = () => {
      details.classList.toggle('hidden');
      chevron.firstElementChild.classList.toggle('rotate-180');
    };

    container.appendChild(avatar);
    container.appendChild(contentDiv);

    aiMessages.appendChild(container);
    aiMessages.scrollTop = aiMessages.scrollHeight;
  }

  async function sendMessage(text) {
    if (!text.trim()) return;

    addAiMessage(text, true);
    aiInput.value = '';
    aiInput.disabled = true;
    sendAiBtn.disabled = true;

    // Show loading indicator
    const loadingDiv = document.createElement('div');
    loadingDiv.id = 'ai-loading';
    loadingDiv.className = 'flex items-center gap-2 text-slate-400 text-xs ml-12 mt-2';
    loadingDiv.innerHTML = `
            <div class="flex space-x-1">
                <div class="w-2 h-2 bg-slate-300 rounded-full animate-bounce" style="animation-delay: 0s"></div>
                <div class="w-2 h-2 bg-slate-300 rounded-full animate-bounce" style="animation-delay: 0.1s"></div>
                <div class="w-2 h-2 bg-slate-300 rounded-full animate-bounce" style="animation-delay: 0.2s"></div>
            </div>
            <span>AI is coding...</span>
        `;
    aiMessages.appendChild(loadingDiv);
    aiMessages.scrollTop = aiMessages.scrollHeight;

    try {
      const response = await fetch('/assist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          source_code: editor.getValue(),
          prompt: text,
          compiler: compilerSelect.value,
          design_system_id: designSystemSelect.value,
          provider: document.getElementById('aiProviderSelect').value,
        }),
      });

      if (!response.ok) {
        const errData = await response.json();
        let errMsg = errData.detail || 'AI request failed';
        if (typeof errMsg === 'object') {
          errMsg = JSON.stringify(errMsg, null, 2);
        }
        throw new Error(errMsg);
      }

      const data = await response.json();

      // Remove loading
      loadingDiv.remove();

      // Add tool messages if any
      if (data.tool_usages && Array.isArray(data.tool_usages)) {
        data.tool_usages.forEach((tool) => {
          addToolMessage(tool);
        });
      }

      // Add response message
      addAiMessage(data.message || 'Done!');

      // Update editor
      if (data.source_code && data.source_code !== editor.getValue()) {
        editor.setValue(data.source_code, -1);
        setStatus('Updated by AI', 'text-purple-600');
        // Auto compile
        // compile(); // Disabled auto-compile as requested
      }
    } catch (err) {
      loadingDiv.remove();
      addAiMessage('Error: ' + err.message);
      console.error(err);
    } finally {
      aiInput.disabled = false;
      sendAiBtn.disabled = false;
      aiInput.focus();
    }
  }

  sendAiBtn.addEventListener('click', () => sendMessage(aiInput.value));
  aiInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') sendMessage(aiInput.value);
  });

  fixErrorBtn.addEventListener('click', () => {
    const logText = logContent.textContent;
    if (!logText) return;
    toggleAiPane(true);
    sendMessage('Please fix this compilation error:\n' + logText.substring(0, 500));
  });

  // --- Event Listeners ---
  copyLinkBtn.addEventListener('click', () => {
    const url = copyLinkBtn.dataset.url;
    if (url) {
      navigator.clipboard
        .writeText(url)
        .then(() => {
          const originalText = copyLinkText.textContent;
          copyLinkText.textContent = 'Copied!';
          copyLinkBtn.classList.add('text-emerald-600');

          setTimeout(() => {
            copyLinkText.textContent = originalText;
            copyLinkBtn.classList.remove('text-emerald-600');
          }, 2000);
        })
        .catch((err) => {
          console.error('Failed to copy: ', err);
          setStatus('Failed to copy link', 'text-rose-600');
        });
    }
  });

  compileBtn.addEventListener('click', compile);

  // Keyboard Shortcut (Ctrl/Cmd + Enter)
  document.addEventListener('keydown', (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault();
      compile();
    }
  });

  closeLogBtn.addEventListener('click', hideLog);

  clearBtn.addEventListener('click', () => {
    if (confirm('Are you sure you want to clear the editor?')) {
      editor.setValue('', -1);
      localStorage.removeItem('latexSource');
    }
  });
});

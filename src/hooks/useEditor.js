import { useState, useCallback, useRef } from 'react';
import { compile } from '@/lib/api';
import { DEFAULT_LATEX } from '@/lib/constants';
import { toast } from 'sonner';
import { useLocalStorage } from '@/hooks/useLocalStorage';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export function useEditor() {
  const [sourceCode, setSourceCode] = useLocalStorage('latexSource', DEFAULT_LATEX);
  const [compiler, setCompiler] = useLocalStorage('latexCompiler', 'pdflatex');
  const [designSystemId, setDesignSystemId] = useState(null);
  const [provider, setProvider] = useLocalStorage('latexProvider', 'pollinations');

  const [compiledPdfUrl, setCompiledPdfUrl] = useState(null);
  const [compileStatus, setCompileStatus] = useState('idle');
  const [assistStatus, setAssistStatus] = useState('idle');
  const [logs, setLogs] = useState('');
  const [compileTime, setCompileTime] = useState(null);

  const INITIAL_MESSAGE = {
    role: 'assistant',
    content:
      "Hi! I'm your LaTeX AI assistant. Describe what you'd like to add or change, and I'll update your document.",
  };

  const [assistMessages, setAssistMessages] = useLocalStorage('latexChatHistory', [
    INITIAL_MESSAGE,
  ]);

  const prevPdfUrl = useRef(null);

  // ── Compile ────────────────────────────────────────────────────────────────
  const handleCompile = useCallback(async () => {
    if (!sourceCode.trim()) {
      toast.error('Source code is empty');
      return;
    }
    setCompileStatus('loading');
    const start = Date.now();
    try {
      const result = await compile({ source_code: sourceCode, compiler });
      const elapsed = ((Date.now() - start) / 1000).toFixed(2);
      setCompileTime(elapsed);

      if (result.pdf_base64) {
        const url = `data:application/pdf;base64,${result.pdf_base64}`;
        if (prevPdfUrl.current?.startsWith('blob:')) URL.revokeObjectURL(prevPdfUrl.current);
        prevPdfUrl.current = url;
        setCompiledPdfUrl(url);
      } else if (result.pdf_url) {
        setCompiledPdfUrl(result.pdf_url);
      }

      setLogs(result.logs || result.log || 'Compilation successful.');
      setCompileStatus('success');
      toast.success(`Compiled in ${elapsed}s`);
    } catch (err) {
      const msg = err.response?.data?.detail || err.message || 'Compilation failed';
      setLogs(typeof msg === 'string' ? msg : JSON.stringify(msg, null, 2));
      setCompileStatus('error');
      toast.error('Compilation failed — check the logs panel');
    }
  }, [sourceCode, compiler]);

  // ── Assist (SSE streaming) ─────────────────────────────────────────────────
  const handleAssist = useCallback(
    async (prompt) => {
      if (!prompt.trim()) return;
      setAssistStatus('loading');

      // Add user message immediately
      setAssistMessages((prev) => [...prev, { role: 'user', content: prompt }]);

      try {
        const response = await fetch(`${API_BASE}/assist`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            source_code: sourceCode,
            prompt,
            compiler,
            design_system_id: designSystemId || undefined,
            provider,
          }),
        });

        if (!response.ok || !response.body) {
          const errData = await response.json().catch(() => ({}));
          throw new Error(errData.detail || `HTTP ${response.status}`);
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';

        // Track pending tool_start cards by name so tool_end can update them
        // We use a Map: toolName → unique message id (index in assistMessages)
        // Since state is immutable snapshots, we'll use a local array and flush at the end.
        // For real-time updates we push directly via setAssistMessages functional updates.

        // Each tool gets a stable key so we can update it in place
        const toolKeyMap = {}; // name → key string

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const parts = buffer.split('\n\n');
          buffer = parts.pop() ?? '';

          for (const part of parts) {
            const trimmed = part.trim();
            if (!trimmed.startsWith('data: ')) continue;
            let event;
            try {
              event = JSON.parse(trimmed.slice(6).trim());
            } catch {
              continue;
            }

            switch (event.type) {
              case 'tool_start': {
                const key = `tool-${event.name}-${Date.now()}`;
                toolKeyMap[event.name] = key;
                setAssistMessages((prev) => [
                  ...prev,
                  {
                    role: 'tool',
                    key,
                    tool: { name: event.name, args: event.args, output: null, pending: true },
                  },
                ]);
                break;
              }

              case 'tool_end': {
                const key = toolKeyMap[event.name];
                if (key) {
                  // Update the matching tool card in place
                  setAssistMessages((prev) =>
                    prev.map((msg) =>
                      msg.role === 'tool' && msg.key === key
                        ? { ...msg, tool: { ...msg.tool, output: event.output, pending: false } }
                        : msg,
                    ),
                  );
                }
                break;
              }

              case 'message': {
                setAssistMessages((prev) => [
                  ...prev,
                  { role: 'assistant', content: event.text },
                ]);
                break;
              }

              case 'done': {
                if (event.source_code) {
                  setSourceCode(event.source_code);
                }
                break;
              }

              case 'error': {
                setAssistMessages((prev) => [
                  ...prev,
                  { role: 'assistant', content: `❌ ${event.detail || 'An error occurred.'}` },
                ]);
                toast.error(event.detail || 'AI assist failed');
                break;
              }

              default:
                break;
            }
          }
        }

        setAssistStatus('success');
      } catch (err) {
        const msg = err.message || 'AI assist failed';
        setAssistMessages((prev) => [
          ...prev,
          { role: 'assistant', content: `❌ Error: ${msg}` },
        ]);
        setAssistStatus('error');
        toast.error('AI assist failed');
      }
    },
    [sourceCode, compiler, designSystemId, provider],
  );

  const clearChatHistory = useCallback(() => {
    setAssistMessages([INITIAL_MESSAGE]);
  }, []);

  return {
    sourceCode,
    setSourceCode,
    compiler,
    setCompiler,
    designSystemId,
    setDesignSystemId,
    provider,
    setProvider,
    compiledPdfUrl,
    compileStatus,
    assistStatus,
    logs,
    compileTime,
    assistMessages,
    handleCompile,
    handleAssist,
    clearChatHistory,
  };
}

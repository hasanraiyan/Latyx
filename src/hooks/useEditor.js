import { useState, useCallback, useRef } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { compile } from '@/lib/api';
import { DEFAULT_LATEX } from '@/lib/constants';
import { toast } from 'sonner';
import { useLocalStorage } from '@/hooks/useLocalStorage';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export function useEditor() {
  const { getToken } = useAuth();
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
      const token = await getToken();
      const result = await compile({ source_code: sourceCode, compiler }, false, token);
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
        const token = await getToken();
        const response = await fetch(`${API_BASE}/assist`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
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
              case 'message_stream': {
                setAssistMessages((prev) => {
                  const last = prev[prev.length - 1];
                  if (last && last.role === 'assistant' && last.streaming) {
                    return [
                      ...prev.slice(0, -1),
                      { ...last, content: last.content + event.text },
                    ];
                  }
                  return [...prev, { role: 'assistant', content: event.text, streaming: true }];
                });
                break;
              }

              case 'message': {
                setAssistMessages((prev) => {
                  const last = prev[prev.length - 1];
                  if (last && last.role === 'assistant' && last.streaming) {
                    return [...prev.slice(0, -1), { role: 'assistant', content: event.text }];
                  }
                  return [...prev, { role: 'assistant', content: event.text }];
                });
                break;
              }

              case 'tool_start': {
                const key = event.id || toolKeyMap[event.name] || `tool-${event.name}-${Date.now()}`;
                toolKeyMap[event.name] = key;
                setAssistMessages((prev) => {
                  const existingIdx = prev.findIndex((m) => m.key === key);
                  if (existingIdx !== -1) {
                    // Standardized sequence: Step 3 (Finalized tool_start)
                    // Update the existing tool card with full, parsed arguments
                    return prev.map((msg, i) =>
                      i === existingIdx
                        ? { ...msg, tool: { ...msg.tool, args: event.args || {}, isStreaming: false } }
                        : msg,
                    );
                  }
                  // Standardized sequence: Step 1 (Early tool_start)
                  return [
                    ...prev,
                    {
                      role: 'tool',
                      key,
                      tool: {
                        name: event.name,
                        args: event.args || {},
                        output: null,
                        pending: true,
                      },
                    },
                  ];
                });
                break;
              }

              case 'tool_args_stream': {
                const key = event.id || toolKeyMap[event.name] || `tool-${event.name}-${Date.now()}`;
                toolKeyMap[event.name] = key;

                setAssistMessages((prev) => {
                  const existingIdx = prev.findIndex((m) => m.key === key);
                  if (existingIdx !== -1) {
                    return prev.map((msg, i) => {
                      if (i === existingIdx) {
                        const currentArgs = msg.tool.args;
                        const newArgs =
                          typeof currentArgs === 'string'
                            ? currentArgs + (event.args || '')
                            : event.args || '';
                        return { ...msg, tool: { ...msg.tool, args: newArgs, isStreaming: true } };
                      }
                      return msg;
                    });
                  } else {
                    // Upsert: Create tool card if it doesn't exist yet
                    return [
                      ...prev,
                      {
                        role: 'tool',
                        key,
                        tool: {
                          name: event.name,
                          args: event.args || '',
                          output: null,
                          pending: true,
                          isStreaming: true,
                        },
                      },
                    ];
                  }
                });
                break;
              }

              case 'tool_end': {
                const key = event.id || toolKeyMap[event.name];
                if (key) {
                  setAssistMessages((prev) =>
                    prev.map((msg) => {
                      if (msg.role === 'tool' && msg.key === key) {
                        let finalArgs = msg.tool.args;
                        if (typeof finalArgs === 'string') {
                          try {
                            finalArgs = JSON.parse(finalArgs);
                          } catch {
                            // Leave as string if not valid JSON
                          }
                        }
                        return {
                          ...msg,
                          tool: { ...msg.tool, args: finalArgs, output: event.output, pending: false },
                        };
                      }
                      return msg;
                    }),
                  );
                }
                break;
              }

              case 'vfs_update': {
                if (event.filename && event.content !== undefined) {
                  setSourceCode(event.content);
                }
                break;
              }

              case 'done': {
                if (event.source_code) {
                  setSourceCode(event.source_code);
                }
                // Finalize any streaming messages
                setAssistMessages((prev) =>
                  prev.map((msg) => (msg.streaming ? { ...msg, streaming: false } : msg)),
                );
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
        setAssistMessages((prev) => [...prev, { role: 'assistant', content: `❌ Error: ${msg}` }]);
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

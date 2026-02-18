import { useState, useCallback, useRef } from 'react';
import { compile, assist } from '@/lib/api';
import { DEFAULT_LATEX } from '@/lib/constants';
import { toast } from 'sonner';

export function useEditor() {
  const [sourceCode, setSourceCode] = useState(DEFAULT_LATEX);
  const [compiler, setCompiler] = useState('pdflatex');
  const [designSystemId, setDesignSystemId] = useState(null);
  const [provider, setProvider] = useState('pollinations');

  const [compiledPdfUrl, setCompiledPdfUrl] = useState(null);
  const [compileStatus, setCompileStatus] = useState('idle'); // idle | loading | success | error
  const [assistStatus, setAssistStatus] = useState('idle');
  const [logs, setLogs] = useState('');
  const [compileTime, setCompileTime] = useState(null);

  const [assistMessages, setAssistMessages] = useState([
    {
      role: 'assistant',
      content:
        "Hi! I'm your LaTeX AI assistant. Describe what you'd like to add or change, and I'll update your document.",
    },
  ]);

  const prevPdfUrl = useRef(null);

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

      // Handle PDF: result may be { pdf_base64, logs } or { pdf_url, logs }
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

  const handleAssist = useCallback(
    async (prompt) => {
      if (!prompt.trim()) return;
      setAssistStatus('loading');
      setAssistMessages((prev) => [...prev, { role: 'user', content: prompt }]);
      try {
        const result = await assist({
          source_code: sourceCode,
          prompt,
          compiler,
          design_system_id: designSystemId || undefined,
          provider,
        });

        const newCode = result.source_code || result.updated_source_code || result.code;
        const message =
          result.message || result.explanation || 'Done! Your document has been updated.';

        // Build the new messages to append
        const newMessages = [];

        // Tool usage cards (collapsible) — shown before the assistant reply
        if (Array.isArray(result.tool_usages) && result.tool_usages.length > 0) {
          result.tool_usages.forEach((tool) => {
            newMessages.push({ role: 'tool', tool });
          });
        }

        // Update source code if AI returned new code
        if (newCode) {
          setSourceCode(newCode);
        }

        newMessages.push({ role: 'assistant', content: message || 'No changes were made.' });
        setAssistMessages((prev) => [...prev, ...newMessages]);
        setAssistStatus('success');
      } catch (err) {
        const msg = err.response?.data?.detail || err.message || 'AI assist failed';
        setAssistMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content: `❌ Error: ${typeof msg === 'string' ? msg : JSON.stringify(msg)}`,
          },
        ]);
        setAssistStatus('error');
        toast.error('AI assist failed');
      }
    },
    [sourceCode, compiler, designSystemId, provider],
  );

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
  };
}

import { useCallback } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { StreamLanguage } from '@codemirror/language';
import { stex } from '@codemirror/legacy-modes/mode/stex';
import { oneDark } from '@codemirror/theme-one-dark';
import { useTheme } from 'next-themes';

const latexLang = StreamLanguage.define(stex);

export default function CodePanel({ sourceCode, setSourceCode, onCompile }) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  const lineCount = sourceCode.split('\n').length;

  // Ctrl/Cmd+Enter → compile (CodeMirror handles Tab natively)
  const handleKeyDown = useCallback(
    (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        onCompile?.();
      }
    },
    [onCompile],
  );

  return (
    <div className="flex flex-col h-full bg-background overflow-hidden" onKeyDown={handleKeyDown}>
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-1.5 border-b border-border bg-muted/30 shrink-0">
        <span className="text-xs font-medium text-muted-foreground font-mono">source.tex</span>
        <span className="text-xs text-muted-foreground font-mono">
          {lineCount} lines · {sourceCode.length} chars
        </span>
      </div>

      {/* CodeMirror editor — fills remaining height */}
      <div className="flex-1 overflow-hidden">
        <CodeMirror
          value={sourceCode}
          onChange={setSourceCode}
          extensions={[latexLang]}
          theme={isDark ? oneDark : 'light'}
          basicSetup={{
            lineNumbers: true,
            highlightActiveLineGutter: true,
            highlightActiveLine: true,
            foldGutter: true,
            dropCursor: true,
            allowMultipleSelections: true,
            indentOnInput: true,
            bracketMatching: true,
            closeBrackets: true,
            autocompletion: false,
            rectangularSelection: true,
            crosshairCursor: false,
            highlightSelectionMatches: true,
            tabSize: 2,
          }}
          style={{ height: '100%', fontSize: '13px' }}
          height="100%"
        />
      </div>

      {/* Footer hint */}
      <div className="px-3 py-1 border-t border-border bg-muted/20 shrink-0">
        <span className="text-xs text-muted-foreground/60">
          <kbd className="font-mono bg-muted px-1 rounded text-[10px]">Ctrl</kbd>
          {' + '}
          <kbd className="font-mono bg-muted px-1 rounded text-[10px]">Enter</kbd>
          {' to compile · '}
          <kbd className="font-mono bg-muted px-1 rounded text-[10px]">Tab</kbd>
          {' to indent'}
        </span>
      </div>
    </div>
  );
}

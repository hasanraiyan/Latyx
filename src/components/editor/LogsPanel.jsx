import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp, Copy, Terminal, CheckCheck } from 'lucide-react';
import { toast } from 'sonner';

function colorizeLog(line) {
  if (/error/i.test(line)) return 'text-red-400';
  if (/warning/i.test(line)) return 'text-yellow-400';
  if (/info|note/i.test(line)) return 'text-blue-400';
  if (/success|done|compiled/i.test(line)) return 'text-green-400';
  return 'text-muted-foreground/70';
}

export default function LogsPanel({ logs, compileStatus }) {
  const [collapsed, setCollapsed] = useState(true);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(logs || '').then(() => {
      setCopied(true);
      toast.success('Logs copied');
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const lines = (logs || '').split('\n');

  return (
    <div
      className={`border-t border-border bg-card shrink-0 transition-all duration-200 ${
        collapsed ? 'h-8' : 'h-40'
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-3 h-8 border-b border-border bg-muted/30">
        <div className="flex items-center gap-2">
          <Terminal className="w-3.5 h-3.5 text-muted-foreground" />
          <span className="text-xs font-medium text-muted-foreground">Compile Logs</span>
          {compileStatus === 'error' && (
            <span className="text-[10px] text-red-500 font-medium">● Error</span>
          )}
          {compileStatus === 'success' && (
            <span className="text-[10px] text-green-500 font-medium">● Success</span>
          )}
        </div>
        <div className="flex items-center gap-1">
          {logs && (
            <Button variant="ghost" size="icon" className="h-5 w-5" onClick={handleCopy}>
              {copied ? (
                <CheckCheck className="w-3 h-3 text-green-500" />
              ) : (
                <Copy className="w-3 h-3" />
              )}
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="h-5 w-5"
            onClick={() => setCollapsed(!collapsed)}
          >
            {collapsed ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </Button>
        </div>
      </div>

      {/* Log content */}
      {!collapsed && (
        <div className="h-[calc(100%-2rem)] overflow-y-auto p-2 font-mono text-[11px] leading-5">
          {!logs ? (
            <span className="text-muted-foreground/40">
              No logs yet. Compile your document to see output here.
            </span>
          ) : (
            lines.map((line, i) => (
              <div key={i} className={colorizeLog(line)}>
                {line || '\u00A0'}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

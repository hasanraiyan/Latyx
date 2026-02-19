import { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Button } from '@/components/ui/button';
import {
  Bot,
  Send,
  User,
  Sparkles,
  Wrench,
  ChevronDown,
  Copy,
  CheckCheck,
  Trash2,
  FileText,
  Edit3,
  Search,
  Globe,
  FolderOpen,
} from 'lucide-react';
import { toast } from 'sonner';

// ── Code block with syntax highlighting + copy button ─────────────────────────
function CodeBlock({ language, children }) {
  const [copied, setCopied] = useState(false);
  const code = String(children).replace(/\n$/, '');

  const handleCopy = () => {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      toast.success('Copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    });
  };

  // Normalise language tag: latex / tex / TeX → 'latex'
  const lang = language?.toLowerCase().replace(/^tex$/, 'latex') || 'text';

  return (
    <div className="relative my-2 rounded-lg overflow-hidden border border-border text-[11px]">
      {/* Header bar */}
      <div className="flex items-center justify-between px-3 py-1 bg-[#1e1e2e] border-b border-white/10">
        <span className="text-[10px] font-mono text-white/40">{lang}</span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1 text-[10px] text-white/40 hover:text-white/70 transition-colors"
        >
          {copied ? <CheckCheck className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
      <SyntaxHighlighter
        language={lang}
        style={oneDark}
        customStyle={{
          margin: 0,
          padding: '10px 12px',
          fontSize: '11px',
          lineHeight: '1.6',
          background: '#1e1e2e',
          borderRadius: 0,
        }}
        wrapLongLines
      >
        {code}
      </SyntaxHighlighter>
    </div>
  );
}

// ── Markdown renderer for assistant messages ─────────────────────────────────
function MdContent({ content }) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        p: ({ children }) => <p className="mb-1 last:mb-0">{children}</p>,
        code({ node, inline, className, children, ...props }) {
          const match = /language-(\w+)/.exec(className || '');
          if (!inline && match) {
            return <CodeBlock language={match[1]}>{children}</CodeBlock>;
          }
          if (!inline && !match) {
            // Fenced block with no language tag — still render nicely
            return <CodeBlock language="text">{children}</CodeBlock>;
          }
          // Inline code
          return (
            <code className="bg-black/20 rounded px-1 py-0.5 font-mono text-[10px]" {...props}>
              {children}
            </code>
          );
        },
        strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
        ul: ({ children }) => <ul className="list-disc pl-4 my-1 space-y-0.5">{children}</ul>,
        ol: ({ children }) => <ol className="list-decimal pl-4 my-1 space-y-0.5">{children}</ol>,
        li: ({ children }) => <li>{children}</li>,
        h1: ({ children }) => <p className="font-bold text-sm mb-1">{children}</p>,
        h2: ({ children }) => <p className="font-semibold mb-1">{children}</p>,
        h3: ({ children }) => <p className="font-medium mb-1">{children}</p>,
        blockquote: ({ children }) => (
          <blockquote className="border-l-2 border-current/40 pl-2 italic opacity-80 my-1">
            {children}
          </blockquote>
        ),
        hr: () => <hr className="border-current/20 my-2" />,
      }}
    >
      {content}
    </ReactMarkdown>
  );
}

// ── Tool metadata helper (labels + icons) ──────────────────────────────────
function getToolMetadata(tool) {
  const name = tool.name;
  let args = tool.args || {};

  // Handle streaming JSON string
  if (typeof args === 'string') {
    if (args.trim().startsWith('{')) {
      try {
        args = JSON.parse(args);
      } catch {
        // Crude regex-based field extraction for partial JSON streaming
        const queryMatch = args.match(/"query"\s*:\s*"([^"]*)"/);
        const filenameMatch = args.match(/"filename"\s*:\s*"([^"]*)"/);
        const pathMatch = args.match(/"path"\s*:\s*"([^"]*)"/);

        args = {
          query: queryMatch ? queryMatch[1] : undefined,
          filename: filenameMatch ? filenameMatch[1] : (pathMatch ? pathMatch[1] : undefined)
        };
      }
    } else {
      // It's a string but doesn't start like JSON yet (could be just one bit of a field)
      args = {};
    }
  }

  switch (name) {
    case 'read_file': {
      const filename = args.filename || 'document.tex';
      return {
        label: `Reading ${filename}`,
        icon: FileText,
      };
    }
    case 'write_file': {
      const filename = args.filename || 'document.tex';
      return {
        label: `Updating ${filename}`,
        icon: Edit3,
      };
    }
    case 'replace_text': {
      const filename = args.filename || 'document.tex';
      return {
        label: `Replacing text in ${filename}`,
        icon: Edit3,
      };
    }
    case 'insert_line': {
      const filename = args.filename || 'document.tex';
      return {
        label: `Inserting line @${args.line_number} in ${filename}`,
        icon: Edit3,
      };
    }
    case 'delete_line': {
      const filename = args.filename || 'document.tex';
      return {
        label: `Deleting line @${args.line_number} in ${filename}`,
        icon: Edit3,
      };
    }
    case 'tavily_search':
      return {
        label: `Searching web for "${args.query || '...'}"`,
        icon: Globe,
      };
    default:
      return {
        label: `Using ${name}`,
        icon: Wrench,
      };
  }
}

// ── Step history for completed tools in a turn (Perplexity style) ─────────────
function StepHistory({ tools }) {
  const [isExpanded, setIsExpanded] = useState(false);
  if (!tools || tools.length === 0) return null;

  const toolCount = tools.length;
  const uniqueIcons = Array.from(new Set(tools.map(t => getToolMetadata(t).icon)));

  return (
    <div className="mb-3 animate-in fade-in slide-in-from-top-1 duration-300">
      {/* Summary Row */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center gap-2 px-2 py-1.5 rounded-lg border border-border/40 bg-muted/20 hover:bg-muted/40 transition-all group"
      >
        <div className="flex -space-x-1.5 mr-1">
          {uniqueIcons.slice(0, 3).map((Icon, i) => (
            <div key={i} className="w-4 h-4 rounded-full bg-background border border-border/60 flex items-center justify-center shrink-0 shadow-sm">
              <Icon className="w-2.5 h-2.5 text-primary/70" />
            </div>
          ))}
          {uniqueIcons.length > 3 && (
            <div className="w-4 h-4 rounded-full bg-background border border-border/60 flex items-center justify-center shrink-0 shadow-sm text-[8px] font-bold text-muted-foreground">
              +{uniqueIcons.length - 3}
            </div>
          )}
        </div>
        <span className="text-[10px] font-medium text-muted-foreground/80 group-hover:text-foreground transition-colors">
          Performed {toolCount} {toolCount === 1 ? 'action' : 'actions'}
        </span>
        <ChevronDown className={`w-3 h-3 text-muted-foreground/40 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
      </button>

      {/* Expanded Details */}
      {isExpanded && (
        <div className="mt-2 ml-2 pl-3 border-l-[1.5px] border-border/30 space-y-2 animate-in fade-in slide-in-from-left-1 duration-200">
          {tools.map((tool, idx) => {
            const metadata = getToolMetadata(tool);
            const Icon = metadata.icon;
            return (
              <div key={idx} className="flex items-center gap-2 text-[10px] text-muted-foreground/60 transition-colors hover:text-muted-foreground">
                <div className="w-3.5 h-3.5 rounded-full bg-muted/30 flex items-center justify-center shrink-0 border border-border/10">
                  <Icon className="w-2 h-2" />
                </div>
                <span className="truncate max-w-[180px]">{metadata.label}</span>
                <div className="flex-1 h-[0.5px] bg-gradient-to-r from-border/20 to-transparent ml-1" />
                <span className="text-[8px] font-mono tracking-tighter opacity-40 uppercase shrink-0">Done</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── Tool call card ──────────────────────────────────────────────────────────
function ToolCard({ tool }) {
  const { label, icon: Icon } = getToolMetadata(tool);
  const [manualOpen, setManualOpen] = useState(null);
  const isPending = tool.pending;
  const isStreaming = tool.isStreaming;
  const open = manualOpen !== null ? manualOpen : false;

  const outputText =
    typeof tool.output === 'string'
      ? tool.output.length > 500
        ? tool.output.slice(0, 500) + '… (truncated)'
        : tool.output
      : tool.output != null
        ? JSON.stringify(tool.output, null, 2)
        : null;

  return (
    <div className={`rounded-xl border transition-all ${isPending ? 'border-primary/30 bg-primary/5' : 'border-border bg-muted/20 hover:bg-muted/30'} text-[11px] font-mono overflow-hidden`}>
      <button
        onClick={() => !isPending && setManualOpen((o) => !(o === null ? !isPending : o))}
        className={`w-full flex items-center justify-between px-3 py-2 transition-colors text-left overflow-hidden ${isPending ? 'cursor-default' : 'hover:bg-muted/40'}`}
      >
        <div className="flex items-center gap-2.5 font-medium min-w-0 flex-1">
          {isPending ? (
            <div className="relative shrink-0">
              <Icon className="w-3.5 h-3.5 text-primary shrink-0" />
              <div className="absolute inset-0 bg-primary rounded-full animate-ping opacity-25" />
            </div>
          ) : (
            <Icon className="w-3.5 h-3.5 text-primary/60 shrink-0" />
          )}
          <span className={`truncate flex-1 ${isPending ? 'text-primary font-semibold' : 'text-foreground/80'}`}>
            {label}
          </span>
        </div>
        {!isPending && (
          <ChevronDown
            className={`w-3 h-3 text-muted-foreground/40 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
          />
        )}
      </button>

      {open && !isPending && (
        <div className="border-t border-border/50 px-3 py-2.5 space-y-3 bg-background/40">
          {tool.args && (
            <div>
              <p className="text-[10px] font-semibold text-muted-foreground/60 uppercase tracking-tight mb-1.5 flex items-center gap-1.5">
                <span className="w-1 h-1 rounded-full bg-primary/40" />
                Input
              </p>
              <pre className="bg-muted/50 rounded-lg border border-border/50 p-2.5 text-[10px] overflow-x-auto whitespace-pre-wrap leading-relaxed shadow-inner">
                {JSON.stringify(tool.args, null, 2)}
              </pre>
            </div>
          )}
          {outputText != null && (
            <div>
              <p className="text-[10px] font-semibold text-muted-foreground/60 uppercase tracking-tight mb-1.5 flex items-center gap-1.5">
                <span className="w-1 h-1 rounded-full bg-green-500/40" />
                Output
              </p>
              <pre className="bg-muted/50 rounded-lg border border-border/50 p-2.5 text-[10px] overflow-x-auto whitespace-pre-wrap leading-relaxed text-muted-foreground/80 shadow-inner">
                {outputText}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Main panel ───────────────────────────────────────────────────────────────
export default function AiAssistPanel({ messages, assistStatus, onAssist, onClear }) {
  const [prompt, setPrompt] = useState('');
  const messagesEndRef = useRef(null);
  const isLoading = assistStatus === 'loading';

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    const trimmed = prompt.trim();
    if (!trimmed || isLoading) return;
    onAssist(trimmed);
    setPrompt('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2 px-3 py-1.5 border-b border-border bg-muted/30 shrink-0">
        <Sparkles className="w-3.5 h-3.5 text-primary" />
        <span className="text-xs font-medium text-muted-foreground flex-1">AI Assistant</span>
        {onClear && (
          <button
            onClick={onClear}
            title="Clear chat history"
            className="w-5 h-5 flex items-center justify-center rounded hover:bg-muted/60 text-muted-foreground/50 hover:text-muted-foreground transition-colors"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3 space-y-4">
        {(() => {
          const visibleRows = [];
          const totalMessages = messages.length;

          for (let i = 0; i < totalMessages; i++) {
            const msg = messages[i];

            if (msg.role === 'user') {
              visibleRows.push({ ...msg, type: 'chat' });
              continue;
            }

            // Group bot turn (consecutive messages until next user or end)
            const turn = [];
            let j = i;
            while (j < totalMessages && messages[j].role !== 'user') {
              turn.push(messages[j]);
              j++;
            }
            i = j - 1; // Sync outer loop index

            const assistantMsgs = turn.filter(m => m.role === 'assistant');
            const toolMsgs = turn.filter(m => m.role === 'tool');

            // Collect all "Completed" tools in this turn for history
            const completedTools = toolMsgs.filter(tm => !tm.tool.pending).map(tm => tm.tool);

            // Determine what to show in the main content slot
            // Priority: Last assistant message > Last pending tool > Virtual loading
            if (assistantMsgs.length > 0) {
              const lastAssistant = assistantMsgs[assistantMsgs.length - 1];
              visibleRows.push({
                ...lastAssistant,
                type: 'chat',
                history: completedTools
              });
            } else if (toolMsgs.length > 0) {
              const lastTool = toolMsgs[toolMsgs.length - 1];
              if (lastTool.tool.pending) {
                visibleRows.push({
                  ...lastTool,
                  type: 'tool_card',
                  // History is everything before this pending tool
                  history: toolMsgs.slice(0, -1).map(tm => tm.tool)
                });
              } else {
                // All tools finished but no text yet? Show the last one as a card, or loading if active
                if (j === totalMessages && isLoading) {
                  visibleRows.push({
                    role: 'assistant',
                    type: 'loading',
                    key: 'virtual-loading',
                    history: completedTools
                  });
                } else {
                  visibleRows.push({
                    ...lastTool,
                    type: 'tool_card',
                    history: toolMsgs.slice(0, -1).map(tm => tm.tool)
                  });
                }
              }
            } else if (j === totalMessages && isLoading) {
              // Edge case: Loading but no bot activity yet (e.g. initial request)
              visibleRows.push({ role: 'assistant', type: 'loading', key: 'initial-loading' });
            }
          }

          return visibleRows.map((msg, i) => {
            const isLoadingState = msg.type === 'loading' || (msg.type === 'tool_card' && msg.tool.pending);

            return (
              <div
                key={msg.key || msg.id || i}
                className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
              >
                {/* Avatar */}
                <div
                  className={`relative w-6 h-6 shrink-0 mt-1 flex items-center justify-center`}
                >
                  {isLoadingState ? (
                    <div className="absolute inset-0">
                      <div className="gemini-loading-ring" />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Bot className="w-3 h-3 text-muted-foreground" />
                      </div>
                    </div>
                  ) : (
                    <div
                      className={`w-full h-full rounded-full flex items-center justify-center shadow-sm ${msg.role === 'user'
                        ? 'bg-primary ring-2 ring-primary/20'
                        : 'bg-muted border border-border'
                        }`}
                    >
                      {msg.role === 'user' ? (
                        <User className="w-3.5 h-3.5 text-primary-foreground" />
                      ) : (
                        <Bot className="w-3.5 h-3.5 text-muted-foreground" />
                      )}
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className={`flex-1 min-w-0 ${msg.role === 'user' ? 'max-w-[85%]' : 'max-w-[95%]'}`}>
                  {/* Step History (for bot turns with previous activity) */}
                  <StepHistory tools={msg.history} />

                  {msg.type === 'tool_card' ? (
                    <ToolCard tool={msg.tool} />
                  ) : msg.type === 'loading' ? (
                    null // Explicit loading rows are shown via the avatar
                  ) : (
                    <div
                      className={`rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed shadow-sm ${msg.role === 'user'
                        ? 'bg-primary text-primary-foreground rounded-tr-sm'
                        : 'bg-muted text-foreground rounded-tl-sm border border-border/40'
                        }`}
                    >
                      {msg.role === 'assistant' ? (
                        <MdContent content={msg.content} />
                      ) : (
                        <span className="whitespace-pre-wrap">{msg.content}</span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          });
        })()}

        <div ref={messagesEndRef} />
      </div>

      {/* ChatGPT-style pill input */}
      <div className="p-3 border-t border-border bg-background shrink-0">
        <div className="relative rounded-2xl border border-border bg-muted/30 focus-within:border-primary/50 focus-within:ring-1 focus-within:ring-primary/20 transition-all">
          <textarea
            value={prompt}
            onChange={(e) => {
              setPrompt(e.target.value);
              e.target.style.height = 'auto';
              e.target.style.height = Math.min(e.target.scrollHeight, 160) + 'px';
            }}
            onKeyDown={handleKeyDown}
            placeholder="Ask AI to edit your document…"
            rows={1}
            disabled={isLoading}
            className="w-full resize-none bg-transparent px-4 pt-3 pb-10 text-xs leading-relaxed outline-none placeholder:text-muted-foreground/50 disabled:opacity-50 max-h-40 overflow-hidden"
            style={{ height: '42px' }}
          />
          {/* Bottom row: hint left, send button right */}
          <div className="absolute bottom-2 right-2 flex items-center justify-end pointer-events-none">
            <button
              onClick={handleSend}
              disabled={isLoading || !prompt.trim()}
              className="pointer-events-auto w-7 h-7 rounded-full flex items-center justify-center transition-all disabled:opacity-30 disabled:cursor-not-allowed bg-primary text-primary-foreground hover:opacity-90 active:scale-95"
            >
              {isLoading ? (
                <span className="w-3 h-3 border-2 border-primary-foreground/40 border-t-primary-foreground rounded-full animate-spin" />
              ) : (
                <Send className="w-3 h-3" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

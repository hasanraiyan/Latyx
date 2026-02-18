import { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Button } from '@/components/ui/button';
import { Bot, Send, User, Sparkles, Wrench, ChevronDown, Copy, CheckCheck } from 'lucide-react';
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

// ── Tool call card ──────────────────────────────────────────────────────────
function ToolCard({ tool }) {
  const [open, setOpen] = useState(false);
  const outputText =
    typeof tool.output === 'string'
      ? tool.output.length > 500
        ? tool.output.slice(0, 500) + '… (truncated)'
        : tool.output
      : JSON.stringify(tool.output, null, 2);

  return (
    <div className="rounded-lg border border-border bg-muted/40 text-xs font-mono overflow-hidden">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-3 py-2 hover:bg-muted/60 transition-colors text-left"
      >
        <span className="flex items-center gap-2 font-semibold text-primary">
          <Wrench className="w-3 h-3 shrink-0" />
          Used tool: {tool.name}
        </span>
        <ChevronDown
          className={`w-3 h-3 text-muted-foreground transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && (
        <div className="border-t border-border px-3 py-2 space-y-2">
          <div>
            <p className="text-[10px] font-semibold text-muted-foreground mb-1">Input:</p>
            <pre className="bg-background rounded border border-border p-2 text-[10px] overflow-x-auto whitespace-pre-wrap">
              {JSON.stringify(tool.args, null, 2)}
            </pre>
          </div>
          <div>
            <p className="text-[10px] font-semibold text-muted-foreground mb-1">Output:</p>
            <pre className="bg-background rounded border border-border p-2 text-[10px] overflow-x-auto whitespace-pre-wrap text-muted-foreground">
              {outputText}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Main panel ───────────────────────────────────────────────────────────────
export default function AiAssistPanel({ messages, assistStatus, onAssist }) {
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
        <span className="text-xs font-medium text-muted-foreground">AI Assistant</span>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {messages.map((msg, i) => {
          if (msg.role === 'tool') {
            return <ToolCard key={i} tool={msg.tool} />;
          }

          return (
            <div
              key={i}
              className={`flex gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
            >
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                  msg.role === 'user' ? 'bg-primary' : 'bg-muted border border-border'
                }`}
              >
                {msg.role === 'user' ? (
                  <User className="w-3 h-3 text-primary-foreground" />
                ) : (
                  <Bot className="w-3 h-3 text-muted-foreground" />
                )}
              </div>

              <div
                className={`max-w-[85%] rounded-xl px-3 py-2 text-xs leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-primary text-primary-foreground rounded-tr-sm'
                    : 'bg-muted text-foreground rounded-tl-sm'
                }`}
              >
                {msg.role === 'assistant' ? (
                  <MdContent content={msg.content} />
                ) : (
                  <span className="whitespace-pre-wrap">{msg.content}</span>
                )}
              </div>
            </div>
          );
        })}

        {/* Loading dots */}
        {isLoading && (
          <div className="flex gap-2">
            <div className="w-6 h-6 rounded-full bg-muted border border-border flex items-center justify-center shrink-0">
              <Bot className="w-3 h-3 text-muted-foreground" />
            </div>
            <div className="bg-muted rounded-xl rounded-tl-sm px-3 py-2 flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-muted-foreground/50 rounded-full animate-bounce [animation-delay:0ms]" />
              <span className="w-1.5 h-1.5 bg-muted-foreground/50 rounded-full animate-bounce [animation-delay:150ms]" />
              <span className="w-1.5 h-1.5 bg-muted-foreground/50 rounded-full animate-bounce [animation-delay:300ms]" />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-2 border-t border-border bg-muted/20 shrink-0">
        <div className="flex gap-2 items-end">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask AI to edit your document…"
            rows={2}
            disabled={isLoading}
            className="flex-1 resize-none rounded-lg border border-border bg-background px-3 py-2 text-xs leading-relaxed outline-none focus:border-primary/50 transition-colors placeholder:text-muted-foreground/60 disabled:opacity-50"
          />
          <Button
            size="icon"
            className="h-8 w-8 shrink-0"
            onClick={handleSend}
            disabled={isLoading || !prompt.trim()}
          >
            <Send className="w-3 h-3" />
          </Button>
        </div>
        <p className="text-[10px] text-muted-foreground/50 mt-1 px-1">
          Enter to send · Shift+Enter for new line
        </p>
      </div>
    </div>
  );
}

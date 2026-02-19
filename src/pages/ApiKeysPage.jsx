import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@clerk/clerk-react';
import { useTheme } from 'next-themes';
import {
  Copy,
  KeyRound,
  Trash2,
  Zap,
  ArrowLeft,
  Plus,
  Moon,
  Sun,
  Shield,
  Clock,
  Check,
} from 'lucide-react';
import { toast } from 'sonner';

import { createApiKey, deleteApiKey, listApiKeys } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Spinner } from '@/components/ui/spinner';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

function formatDate(value) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function KeyRow({ apiKey, onDelete, deletingId }) {
  const isDeleting = deletingId === apiKey.id;

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 py-3.5 px-4 hover:bg-muted/30 transition-colors group">
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
          <KeyRound className="w-3.5 h-3.5 text-primary" />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold leading-tight truncate">{apiKey.name}</p>
          <div className="flex items-center gap-2 mt-0.5">
            <code className="text-xs font-mono text-muted-foreground bg-muted/60 px-1.5 py-0.5 rounded">
              {apiKey.prefix}…
            </code>
            {apiKey.last_used_at ? (
              <span className="text-[11px] text-muted-foreground/70 flex items-center gap-1">
                <Clock className="w-2.5 h-2.5" />
                Last used {formatDate(apiKey.last_used_at)}
              </span>
            ) : (
              <span className="text-[11px] text-muted-foreground/50">Never used</span>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0 ml-11 sm:ml-0">
        <Badge variant="secondary" className="text-[10px] h-5 gap-1 text-green-600 bg-green-500/10">
          <Shield className="w-2.5 h-2.5" />
          Active
        </Badge>
        <span className="text-[11px] text-muted-foreground/50 hidden sm:block">
          {formatDate(apiKey.created_at)}
        </span>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-opacity"
              disabled={isDeleting}
              onClick={() => onDelete(apiKey.id)}
            >
              {isDeleting ? (
                <Spinner className="w-3.5 h-3.5" />
              ) : (
                <Trash2 className="w-3.5 h-3.5" />
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent>Revoke key</TooltipContent>
        </Tooltip>
      </div>
    </div>
  );
}

export default function ApiKeysPage() {
  const { getToken } = useAuth();
  const { theme, setTheme } = useTheme();
  const [name, setName] = useState('');
  const [apiKeys, setApiKeys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [deletingId, setDeletingId] = useState('');
  const [lastCreatedKey, setLastCreatedKey] = useState('');
  const [copied, setCopied] = useState(false);

  const loadApiKeys = async () => {
    setLoading(true);
    try {
      const token = await getToken();
      const data = await listApiKeys(token);
      setApiKeys(Array.isArray(data) ? data : []);
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to load API keys');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadApiKeys();
  }, []);

  const handleCreate = async (event) => {
    event.preventDefault();
    if (!name.trim()) {
      toast.error('Please provide a name for the API key');
      return;
    }
    setCreating(true);
    try {
      const token = await getToken();
      const data = await createApiKey({ name: name.trim() }, token);
      setLastCreatedKey(data.key || '');
      setName('');
      toast.success('API key created');
      await loadApiKeys();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to create API key');
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id) => {
    setDeletingId(id);
    try {
      const token = await getToken();
      await deleteApiKey(id, token);
      toast.success('API key revoked');
      setApiKeys((prev) => prev.filter((k) => k.id !== id));
      if (lastCreatedKey) setLastCreatedKey('');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to revoke API key');
    } finally {
      setDeletingId('');
    }
  };

  const handleCopy = async () => {
    if (!lastCreatedKey) return;
    try {
      await navigator.clipboard.writeText(lastCreatedKey);
      setCopied(true);
      toast.success('API key copied to clipboard');
      setTimeout(() => setCopied(false), 2500);
    } catch {
      toast.error('Copy failed. Please copy manually.');
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Topbar — matches EditorTopbar */}
      <header className="flex items-center gap-2 px-3 h-12 border-b border-border bg-card shrink-0">
        <Link
          to="/editor"
          className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors mr-1"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <div className="w-6 h-6 rounded-md bg-primary flex items-center justify-center">
            <Zap className="w-3 h-3 text-primary-foreground" />
          </div>
          <span className="font-bold text-sm text-foreground">Latyx</span>
        </Link>

        <Separator orientation="vertical" className="h-5" />

        <div className="flex items-center gap-1.5">
          <KeyRound className="w-3.5 h-3.5 text-muted-foreground" />
          <span className="text-xs font-medium text-foreground">API Keys</span>
        </div>

        <div className="flex-1" />

        {/* Theme toggle */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            >
              {theme === 'dark' ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
            </Button>
          </TooltipTrigger>
          <TooltipContent>Toggle theme</TooltipContent>
        </Tooltip>

        <Separator orientation="vertical" className="h-5" />

        <Button size="sm" className="h-7 text-xs gap-1.5 px-3" onClick={() => document.getElementById('key-name-input')?.focus()}>
          <Plus className="w-3 h-3" />
          New Key
        </Button>
      </header>

      {/* Page content */}
      <main className="flex-1 max-w-3xl w-full mx-auto px-4 py-8 space-y-6">

        {/* Page heading */}
        <div>
          <h1 className="text-xl font-bold tracking-tight">API Key Management</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Create and revoke API keys for scripts, CI pipelines, and integrations.
          </p>
        </div>

        {/* Create key form */}
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="px-4 py-3 border-b border-border bg-muted/20 flex items-center gap-2">
            <Plus className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="text-xs font-semibold text-foreground">Create a new key</span>
            <span className="text-xs text-muted-foreground ml-0.5">· shown only once, save immediately</span>
          </div>

          <div className="p-4 space-y-3">
            <form className="flex flex-col sm:flex-row gap-2" onSubmit={handleCreate}>
              <Input
                id="key-name-input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. CI pipeline, Personal script…"
                maxLength={80}
                className="flex-1 h-8 text-sm"
              />
              <Button type="submit" size="sm" disabled={creating} className="h-8 gap-1.5 px-4">
                {creating ? (
                  <>
                    <Spinner className="w-3 h-3" />
                    Creating…
                  </>
                ) : (
                  <>
                    <Plus className="w-3 h-3" />
                    Create key
                  </>
                )}
              </Button>
            </form>

            {/* Newly created key reveal */}
            {lastCreatedKey && (
              <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-3 space-y-2 animate-in fade-in slide-in-from-top-1 duration-300">
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                  <p className="text-xs font-medium text-amber-600 dark:text-amber-400">
                    Copy this key now — it won&apos;t be shown again
                  </p>
                </div>
                <div className="flex gap-2 items-center">
                  <code className="text-xs font-mono bg-background border border-border rounded-md px-3 py-2 flex-1 break-all select-all">
                    {lastCreatedKey}
                  </code>
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={handleCopy}
                    className="h-8 gap-1.5 shrink-0"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-green-500" />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        Copy
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Active keys list */}
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="px-4 py-3 border-b border-border bg-muted/20 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <KeyRound className="w-3.5 h-3.5 text-muted-foreground" />
              <span className="text-xs font-semibold text-foreground">Active keys</span>
            </div>
            {!loading && (
              <Badge variant="secondary" className="text-[10px] h-5">
                {apiKeys.length} {apiKeys.length === 1 ? 'key' : 'keys'}
              </Badge>
            )}
          </div>

          {loading ? (
            <div className="h-36 flex items-center justify-center gap-2 text-muted-foreground">
              <Spinner className="w-4 h-4 text-primary" />
              <span className="text-xs">Loading keys…</span>
            </div>
          ) : apiKeys.length === 0 ? (
            <div className="h-36 flex flex-col items-center justify-center gap-2 text-center px-4">
              <div className="w-10 h-10 rounded-xl bg-muted/60 flex items-center justify-center">
                <KeyRound className="w-5 h-5 text-muted-foreground/50" />
              </div>
              <p className="text-sm font-medium text-muted-foreground">No API keys yet</p>
              <p className="text-xs text-muted-foreground/60">Create one above to get started</p>
            </div>
          ) : (
            <div className="divide-y divide-border/60">
              {apiKeys.map((key) => (
                <KeyRow
                  key={key.id}
                  apiKey={key}
                  onDelete={handleDelete}
                  deletingId={deletingId}
                />
              ))}
            </div>
          )}
        </div>

        {/* Docs hint */}
        <p className="text-xs text-muted-foreground/60 text-center">
          Pass your key as <code className="font-mono bg-muted px-1 py-0.5 rounded text-[11px]">Authorization: Bearer &lt;key&gt;</code> in API requests.
        </p>
      </main>
    </div>
  );
}

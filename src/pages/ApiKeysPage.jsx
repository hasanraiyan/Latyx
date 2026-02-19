import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@clerk/clerk-react';
import { ArrowLeft, Copy, KeyRound, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

import { createApiKey, deleteApiKey, listApiKeys } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Spinner } from '@/components/ui/spinner';

function formatDate(value) {
  if (!value) return 'Never';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString();
}

export default function ApiKeysPage() {
  const { getToken } = useAuth();
  const [name, setName] = useState('');
  const [apiKeys, setApiKeys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [deletingId, setDeletingId] = useState('');
  const [lastCreatedKey, setLastCreatedKey] = useState('');

  const loadApiKeys = async () => {
    setLoading(true);
    try {
      const token = await getToken();
      const data = await listApiKeys(token);
      setApiKeys(Array.isArray(data) ? data : []);
    } catch (error) {
      const msg = error.response?.data?.detail || 'Failed to load API keys';
      toast.error(msg);
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
      const msg = error.response?.data?.detail || 'Failed to create API key';
      toast.error(msg);
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
      setApiKeys((prev) => prev.filter((key) => key.id !== id));
    } catch (error) {
      const msg = error.response?.data?.detail || 'Failed to revoke API key';
      toast.error(msg);
    } finally {
      setDeletingId('');
    }
  };

  const handleCopy = async () => {
    if (!lastCreatedKey) return;
    try {
      await navigator.clipboard.writeText(lastCreatedKey);
      toast.success('API key copied');
    } catch {
      toast.error('Copy failed. Please copy manually.');
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-5xl mx-auto px-4 py-8 md:py-12">
        <div className="flex items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">API Key Management</h1>
            <p className="text-muted-foreground text-sm mt-1">
              Create and revoke API keys for scripts and integrations.
            </p>
          </div>
          <Button variant="outline" asChild>
            <Link to="/editor" className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back to Editor
            </Link>
          </Button>
        </div>

        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <KeyRound className="w-4 h-4" />
                Create a new API key
              </CardTitle>
              <CardDescription>
                The generated key is shown only once. Save it immediately.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <form className="flex flex-col sm:flex-row gap-3" onSubmit={handleCreate}>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. CI pipeline"
                  maxLength={80}
                />
                <Button type="submit" disabled={creating} className="sm:w-auto">
                  {creating ? (
                    <>
                      <Spinner className="w-4 h-4" />
                      Creating...
                    </>
                  ) : (
                    'Create key'
                  )}
                </Button>
              </form>

              {lastCreatedKey && (
                <div className="rounded-md border bg-muted/30 p-3">
                  <p className="text-xs text-muted-foreground mb-2">New key (copy now):</p>
                  <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center">
                    <code className="text-xs break-all bg-background border rounded px-2 py-1.5 flex-1">
                      {lastCreatedKey}
                    </code>
                    <Button type="button" variant="secondary" size="sm" onClick={handleCopy}>
                      <Copy className="w-3.5 h-3.5" />
                      Copy
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Active API keys</CardTitle>
              <CardDescription>Revoke any key that is no longer in use.</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="h-36 flex items-center justify-center">
                  <Spinner className="w-6 h-6 text-primary" />
                </div>
              ) : apiKeys.length === 0 ? (
                <p className="text-sm text-muted-foreground">No API keys yet.</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Prefix</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Last used</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {apiKeys.map((key) => (
                      <TableRow key={key.id}>
                        <TableCell className="font-medium">{key.name}</TableCell>
                        <TableCell>{key.prefix}</TableCell>
                        <TableCell>{formatDate(key.created_at)}</TableCell>
                        <TableCell>{formatDate(key.last_used_at)}</TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="destructive"
                            size="sm"
                            disabled={deletingId === key.id}
                            onClick={() => handleDelete(key.id)}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            Revoke
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

import { FileText, Loader2, AlertCircle, Clock, Share2, Download, Link, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useState } from 'react';
import { toast } from 'sonner';

export default function PdfPreview({ pdfUrl, compileStatus, compileTime, onCompile }) {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    if (!pdfUrl) return;

    // Try native Web Share API first (great for mobile)
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Compiled LaTeX PDF',
          text: 'Check out this LaTeX document compiled with Latyx',
          url: pdfUrl,
        });
        return;
      } catch (err) {
        // User cancelled or API not supported — fall through to clipboard
        if (err.name === 'AbortError') return;
      }
    }

    // Fallback: copy URL to clipboard
    try {
      await navigator.clipboard.writeText(pdfUrl);
      setCopied(true);
      toast.success('PDF link copied to clipboard!');
      setTimeout(() => setCopied(false), 2500);
    } catch {
      toast.error('Could not copy link. Please copy the URL manually.');
    }
  };

  const handleDownload = () => {
    if (!pdfUrl) return;
    const a = document.createElement('a');
    a.href = pdfUrl;
    a.download = 'document.pdf';
    a.target = '_blank';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    toast.success('Downloading PDF…');
  };

  return (
    <div className="flex flex-col h-full bg-muted/10 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-1.5 border-b border-border bg-muted/30 shrink-0 gap-2">
        <span className="text-xs font-medium text-muted-foreground">PDF Preview</span>

        <div className="flex items-center gap-1.5">
          {compileTime && compileStatus === 'success' && (
            <Badge variant="secondary" className="text-xs gap-1 h-5 text-green-600 bg-green-500/10">
              <Clock className="w-2.5 h-2.5" />
              {compileTime}s
            </Badge>
          )}

          {pdfUrl && (
            <>
              {/* Share */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-6 w-6"
                    onClick={handleShare}
                  >
                    {copied ? (
                      <Check className="w-3.5 h-3.5 text-green-500" />
                    ) : (
                      <Share2 className="w-3.5 h-3.5" />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Share PDF</TooltipContent>
              </Tooltip>

              {/* Download */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-6 w-6"
                    onClick={handleDownload}
                  >
                    <Download className="w-3.5 h-3.5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Download PDF</TooltipContent>
              </Tooltip>
            </>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden relative">
        {/* Idle / no PDF yet */}
        {!pdfUrl && compileStatus === 'idle' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 text-center p-8">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
              <FileText className="w-8 h-8 text-primary/50" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">No preview yet</p>
              <p className="text-xs text-muted-foreground/60">
                Click <strong>Compile</strong> or press{' '}
                <kbd className="font-mono bg-muted px-1 rounded text-[10px]">Ctrl+Enter</kbd>
              </p>
            </div>
            <Button size="sm" variant="outline" onClick={onCompile} className="gap-2">
              <FileText className="w-3.5 h-3.5" />
              Compile now
            </Button>
          </div>
        )}

        {/* Loading */}
        {compileStatus === 'loading' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
            <p className="text-sm text-muted-foreground">Compiling…</p>
          </div>
        )}

        {/* Error */}
        {compileStatus === 'error' && !pdfUrl && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-8 text-center">
            <div className="w-14 h-14 rounded-2xl bg-red-500/10 flex items-center justify-center">
              <AlertCircle className="w-7 h-7 text-red-500" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-red-500">Compilation failed</p>
              <p className="text-xs text-muted-foreground">
                Check the logs panel below for details
              </p>
            </div>
          </div>
        )}

        {/* PDF iframe */}
        {pdfUrl && (
          <iframe
            key={pdfUrl}
            src={pdfUrl}
            className="w-full h-full border-0"
            title="Compiled PDF"
          />
        )}
      </div>
    </div>
  );
}

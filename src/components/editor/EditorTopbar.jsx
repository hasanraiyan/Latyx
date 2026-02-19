import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Spinner } from '@/components/ui/spinner';
import { useTheme } from 'next-themes';
import { Link } from 'react-router-dom';
import { Play, ArrowLeft, Moon, Sun, Zap, Cpu, Palette, Bot, Wifi, WifiOff, KeyRound } from 'lucide-react';
import { COMPILERS, AI_PROVIDERS } from '@/lib/constants';

export default function EditorTopbar({
  compiler,
  setCompiler,
  provider,
  setProvider,
  designSystemId,
  setDesignSystemId,
  designSystems,
  compileStatus,
  onCompile,
  isMobile = false,
}) {
  const { theme, setTheme } = useTheme();
  const isCompiling = compileStatus === 'loading';

  return (
    <header className="flex items-center gap-2 px-3 h-12 border-b border-border bg-card shrink-0">
      {/* Logo + back */}
      <Link
        to="/"
        className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors mr-1"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <div className="w-6 h-6 rounded-md bg-primary flex items-center justify-center">
          <Zap className="w-3 h-3 text-primary-foreground" />
        </div>
        <span className="font-bold text-sm text-foreground">Latyx</span>
      </Link>

      <Separator orientation="vertical" className="h-5" />

      <Separator orientation="vertical" className="h-5" />

      {/* Desktop Controls */}
      {!isMobile && (
        <>
          {/* Compiler select */}
          <Tooltip>
            {/* ... */}
          </Tooltip>

          {/* Design system select */}
          {designSystems.length > 0 && (
            <Tooltip>
              {/* ... */}
            </Tooltip>
          )}

          {/* AI provider select */}
          <Tooltip>
            {/* ... */}
          </Tooltip>
        </>
      )}

      {/* Compiler select */}
      {!isMobile && (
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-muted-foreground" />
              <Select value={compiler} onValueChange={setCompiler}>
                <SelectTrigger className="h-7 text-xs w-32 border-0 bg-muted/50 hover:bg-muted">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {COMPILERS.map((c) => (
                    <SelectItem key={c.value} value={c.value} className="text-xs">
                      {c.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </TooltipTrigger>
          <TooltipContent>LaTeX Compiler</TooltipContent>
        </Tooltip>
      )}

      {/* Design system select */}
      {!isMobile && designSystems.length > 0 && (
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex items-center gap-1.5">
              <Palette className="w-3.5 h-3.5 text-muted-foreground" />
              <Select
                value={designSystemId || 'none'}
                onValueChange={(v) => setDesignSystemId(v === 'none' ? null : v)}
              >
                <SelectTrigger className="h-7 text-xs w-36 border-0 bg-muted/50 hover:bg-muted">
                  <SelectValue placeholder="Design system" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none" className="text-xs">
                    No design system
                  </SelectItem>
                  {designSystems.map((ds) => (
                    <SelectItem key={ds.id || ds.name} value={ds.id || ds.name} className="text-xs">
                      {ds.name || ds.id}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </TooltipTrigger>
          <TooltipContent>Design System</TooltipContent>
        </Tooltip>
      )}

      {/* AI provider select */}
      {!isMobile && (
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex items-center gap-1.5">
              <Bot className="w-3.5 h-3.5 text-muted-foreground" />
              <Select value={provider} onValueChange={setProvider}>
                <SelectTrigger className="h-7 text-xs w-36 border-0 bg-muted/50 hover:bg-muted">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {AI_PROVIDERS.map((p) => (
                    <SelectItem key={p.value} value={p.value} className="text-xs">
                      {p.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </TooltipTrigger>
          <TooltipContent>AI Provider</TooltipContent>
        </Tooltip>
      )}

      {/* Spacer */}
      <div className="flex-1" />

      {/* Status badge */}
      {compileStatus === 'success' && (
        <Badge variant="secondary" className="text-xs gap-1 h-6 text-green-600 bg-green-500/10">
          <Wifi className="w-3 h-3" />
          Compiled
        </Badge>
      )}
      {compileStatus === 'error' && (
        <Badge variant="secondary" className="text-xs gap-1 h-6 text-red-500 bg-red-500/10">
          <WifiOff className="w-3 h-3" />
          Error
        </Badge>
      )}

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

      <Button variant="ghost" size="sm" className="h-7 text-xs gap-1.5 px-2" asChild>
        <Link to="/api-keys">
          <KeyRound className="w-3.5 h-3.5" />
          {!isMobile && 'API Keys'}
        </Link>
      </Button>

      {/* Compile button */}
      <Button
        size="sm"
        className="h-7 text-xs gap-1.5 px-3"
        onClick={onCompile}
        disabled={isCompiling}
      >
        {isCompiling ? (
          <>
            <Spinner className="w-3 h-3" />
            Compiling…
          </>
        ) : (
          <>
            <Play className="w-3 h-3" />
            Compile
          </>
        )}
      </Button>
    </header>
  );
}

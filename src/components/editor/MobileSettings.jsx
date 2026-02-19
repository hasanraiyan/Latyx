import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Cpu, Palette, Bot, Github } from 'lucide-react';
import { COMPILERS, AI_PROVIDERS } from '@/lib/constants';

export default function MobileSettings({
    compiler,
    setCompiler,
    provider,
    setProvider,
    designSystemId,
    setDesignSystemId,
    designSystems = [],
}) {
    return (
        <div className="flex flex-col gap-6 p-4 overflow-y-auto h-full pb-20">
            <div className="space-y-1.5">
                <h2 className="text-xl font-bold tracking-tight">Settings</h2>
                <p className="text-sm text-muted-foreground">Customize your editor environment.</p>
            </div>

            <Separator />

            <div className="space-y-4">
                {/* Compiler */}
                <div className="space-y-2">
                    <Label className="text-xs font-medium text-muted-foreground uppercase flex items-center gap-2">
                        <Cpu className="w-3.5 h-3.5" />
                        Typesetting Engine
                    </Label>
                    <Card className="bg-muted/30 border-border/60">
                        <CardContent className="p-1">
                            <Select value={compiler} onValueChange={setCompiler}>
                                <SelectTrigger className="w-full border-0 bg-transparent focus:ring-0">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {COMPILERS.map((c) => (
                                        <SelectItem key={c.value} value={c.value}>
                                            <span className="font-medium">{c.label}</span>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </CardContent>
                    </Card>
                </div>

                {/* AI Provider */}
                <div className="space-y-2">
                    <Label className="text-xs font-medium text-muted-foreground uppercase flex items-center gap-2">
                        <Bot className="w-3.5 h-3.5" />
                        AI Model
                    </Label>
                    <Card className="bg-muted/30 border-border/60">
                        <CardContent className="p-1">
                            <Select value={provider} onValueChange={setProvider}>
                                <SelectTrigger className="w-full border-0 bg-transparent focus:ring-0">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {AI_PROVIDERS.map((p) => (
                                        <SelectItem key={p.value} value={p.value}>
                                            <span className="font-medium">{p.label}</span>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </CardContent>
                    </Card>
                </div>

                {/* Design System */}
                <div className="space-y-2">
                    <Label className="text-xs font-medium text-muted-foreground uppercase flex items-center gap-2">
                        <Palette className="w-3.5 h-3.5" />
                        Style Preset
                    </Label>
                    <Card className="bg-muted/30 border-border/60">
                        <CardContent className="p-1">
                            <Select
                                value={designSystemId || 'none'}
                                onValueChange={(v) => setDesignSystemId(v === 'none' ? null : v)}
                            >
                                <SelectTrigger className="w-full border-0 bg-transparent focus:ring-0">
                                    <SelectValue placeholder="Select a style" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="none">
                                        <span className="text-muted-foreground">Default style</span>
                                    </SelectItem>
                                    {designSystems.map((ds) => (
                                        <SelectItem key={ds.id || ds.name} value={ds.id || ds.name}>
                                            <span className="font-medium">{ds.name || ds.id}</span>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </CardContent>
                    </Card>
                </div>
            </div>

            <div className="mt-auto pt-8 flex justify-center opacity-40">
                <a
                    href="https://github.com/hasanraiyan/Latyx"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-xs hover:opacity-100 transition-opacity"
                >
                    <Github className="w-3.5 h-3.5" />
                    <span>Open Source</span>
                </a>
            </div>
        </div>
    );
}

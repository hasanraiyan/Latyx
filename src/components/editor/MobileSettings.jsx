import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Cpu, Palette, Bot, ChevronRight } from 'lucide-react';
import { COMPILERS, AI_PROVIDERS } from '@/lib/constants';

function SettingRow({ icon: Icon, label, description, children }) {
    return (
        <div className="flex items-center justify-between gap-4 px-4 py-3">
            <div className="flex items-center gap-3 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <Icon className="w-4 h-4 text-primary" />
                </div>
                <div className="min-w-0">
                    <p className="text-sm font-medium leading-tight">{label}</p>
                    {description && (
                        <p className="text-xs text-muted-foreground mt-0.5 truncate">{description}</p>
                    )}
                </div>
            </div>
            <div className="shrink-0">{children}</div>
        </div>
    );
}

function SettingGroup({ title, children }) {
    return (
        <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide px-4 mb-1.5">
                {title}
            </p>
            <div className="rounded-xl border border-border/70 bg-card overflow-hidden divide-y divide-border/40">
                {children}
            </div>
        </div>
    );
}

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
        <div className="flex flex-col gap-6 py-5 overflow-y-auto h-full">
            {/* Header */}
            <div className="px-4">
                <h2 className="text-2xl font-bold tracking-tight">Settings</h2>
                <p className="text-sm text-muted-foreground mt-1">Customize your editor environment.</p>
            </div>

            <Separator />

            {/* Compilation Group */}
            <div className="px-3">
                <SettingGroup title="Compilation">
                    <SettingRow
                        icon={Cpu}
                        label="LaTeX Engine"
                        description={COMPILERS.find((c) => c.value === compiler)?.label || compiler}
                    >
                        <Select value={compiler} onValueChange={setCompiler}>
                            <SelectTrigger className="h-8 w-[130px] text-xs bg-muted/50 border-border/60">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {COMPILERS.map((c) => (
                                    <SelectItem key={c.value} value={c.value} className="text-sm">
                                        {c.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </SettingRow>
                </SettingGroup>
            </div>

            {/* AI Group */}
            <div className="px-3">
                <SettingGroup title="AI Assistant">
                    <SettingRow
                        icon={Bot}
                        label="Model Provider"
                        description={AI_PROVIDERS.find((p) => p.value === provider)?.label || provider}
                    >
                        <Select value={provider} onValueChange={setProvider}>
                            <SelectTrigger className="h-8 w-[130px] text-xs bg-muted/50 border-border/60">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {AI_PROVIDERS.map((p) => (
                                    <SelectItem key={p.value} value={p.value} className="text-sm">
                                        {p.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </SettingRow>

                    {designSystems.length > 0 && (
                        <SettingRow
                            icon={Palette}
                            label="Style Preset"
                            description={
                                designSystems.find((ds) => (ds.id || ds.name) === designSystemId)?.name ||
                                'No preset'
                            }
                        >
                            <Select
                                value={designSystemId || 'none'}
                                onValueChange={(v) => setDesignSystemId(v === 'none' ? null : v)}
                            >
                                <SelectTrigger className="h-8 w-[130px] text-xs bg-muted/50 border-border/60">
                                    <SelectValue placeholder="None" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="none" className="text-sm">
                                        Default
                                    </SelectItem>
                                    {designSystems.map((ds) => (
                                        <SelectItem key={ds.id || ds.name} value={ds.id || ds.name} className="text-sm">
                                            {ds.name || ds.id}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </SettingRow>
                    )}
                </SettingGroup>
            </div>

            {/* Footer */}
            <div className="mt-auto px-4 pb-4 flex items-center justify-center">
                <p className="text-xs text-muted-foreground/40">Latyx · Open Source LaTeX Editor</p>
            </div>
        </div>
    );
}

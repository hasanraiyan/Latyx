import { FileText, FileCheck, Sparkles, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function MobileNavBar({ activeTab, setActiveTab }) {
    const tabs = [
        { id: 'editor', label: 'Code', icon: FileText },
        { id: 'preview', label: 'Preview', icon: FileCheck },
        { id: 'assist', label: 'AI Assist', icon: Sparkles },
        { id: 'settings', label: 'Settings', icon: Settings },
    ];

    return (
        <div className="h-14 border-t border-border bg-card flex justify-around items-center px-1 shrink-0 pb-safe">
            {tabs.map((tab) => {
                const isActive = activeTab === tab.id;
                const Icon = tab.icon;

                return (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={cn(
                            "flex flex-col items-center justify-center w-full h-full gap-1 transition-colors relative",
                            isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
                        )}
                    >
                        {isActive && (
                            <div className="absolute top-0 w-8 h-0.5 bg-primary rounded-b-full shadow-[0_0_8px_rgba(var(--primary),0.5)]" />
                        )}
                        <Icon className={cn("w-5 h-5 transition-transform", isActive && "scale-110")} />
                        <span className="text-[10px] font-medium tracking-tight">{tab.label}</span>
                    </button>
                );
            })}
        </div>
    );
}

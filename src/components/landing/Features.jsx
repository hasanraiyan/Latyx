import {
    Zap,
    Eye,
    Brain,
    GitBranch,
    Download,
    Users,
    Lock,
    Palette,
} from 'lucide-react';

const features = [
    {
        icon: Eye,
        title: 'Real-time Preview',
        description:
            'See your PDF render instantly as you type. No more compile-and-pray cycles — changes appear in milliseconds.',
        color: 'text-blue-500',
        bg: 'bg-blue-500/10',
    },
    {
        icon: Brain,
        title: 'AI Autocomplete',
        description:
            'Context-aware suggestions for equations, environments, and citations. Write complex math with a single keystroke.',
        color: 'text-violet-500',
        bg: 'bg-violet-500/10',
    },
    {
        icon: Zap,
        title: 'Lightning Compilation',
        description:
            'Cloud-powered compilation with pdfLaTeX, XeLaTeX, and LuaLaTeX. Average compile time under 0.5 seconds.',
        color: 'text-yellow-500',
        bg: 'bg-yellow-500/10',
    },
    {
        icon: GitBranch,
        title: 'Version Control',
        description:
            'Built-in Git integration with visual diff. Track every change, branch experiments, and merge with confidence.',
        color: 'text-green-500',
        bg: 'bg-green-500/10',
    },
    {
        icon: Users,
        title: 'Real-time Collaboration',
        description:
            'Edit documents simultaneously with your team. See cursors, comments, and changes live — like Google Docs for LaTeX.',
        color: 'text-pink-500',
        bg: 'bg-pink-500/10',
    },
    {
        icon: Download,
        title: 'One-click Export',
        description:
            'Export to PDF, HTML, DOCX, or Markdown. Submit to arXiv directly from the editor with automatic formatting.',
        color: 'text-orange-500',
        bg: 'bg-orange-500/10',
    },
    {
        icon: Lock,
        title: 'Enterprise Security',
        description:
            'SOC 2 Type II certified. End-to-end encryption, SSO, audit logs, and on-premise deployment options.',
        color: 'text-red-500',
        bg: 'bg-red-500/10',
    },
    {
        icon: Palette,
        title: 'Custom Themes',
        description:
            'Beautiful editor themes, custom fonts, and configurable keybindings. Make Latyx feel like home.',
        color: 'text-teal-500',
        bg: 'bg-teal-500/10',
    },
];

export default function Features() {
    return (
        <section id="features" className="py-24 relative">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Section header */}
                <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
                    <p className="text-primary font-semibold text-sm uppercase tracking-wider">Features</p>
                    <h2 className="text-4xl sm:text-5xl font-bold tracking-tight">
                        Everything you need to
                        <br />
                        write great documents
                    </h2>
                    <p className="text-muted-foreground text-lg leading-relaxed">
                        Latyx combines a powerful editor with AI assistance and cloud infrastructure so you can
                        focus on your research, not your tooling.
                    </p>
                </div>

                {/* Feature grid */}
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {features.map((feature, i) => {
                        const Icon = feature.icon;
                        return (
                            <div
                                key={i}
                                className="group relative p-6 rounded-2xl border border-border bg-card hover:border-primary/30 hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                            >
                                <div
                                    className={`w-10 h-10 rounded-xl ${feature.bg} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}
                                >
                                    <Icon className={`w-5 h-5 ${feature.color}`} />
                                </div>
                                <h3 className="font-semibold text-base mb-2">{feature.title}</h3>
                                <p className="text-sm text-muted-foreground leading-relaxed">
                                    {feature.description}
                                </p>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}

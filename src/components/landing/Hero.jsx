import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Sparkles, Star } from 'lucide-react';

const codeSnippet = `\\documentclass{article}
\\usepackage{amsmath}

\\begin{document}

\\title{Quantum Field Theory}
\\author{Dr. Alice Chen}
\\maketitle

\\section{Introduction}
The Lagrangian density is given by:

\\begin{equation}
  \\mathcal{L} = \\bar{\\psi}(i\\gamma^\\mu
  \\partial_\\mu - m)\\psi
\\end{equation}

\\end{document}`;

export default function Hero() {
    return (
        <section className="relative min-h-screen flex items-center pt-16 overflow-hidden">
            {/* Background gradient blobs */}
            <div className="absolute inset-0 -z-10">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse" />
                <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-primary/5 rounded-full blur-3xl animate-pulse delay-1000" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/3 rounded-full blur-3xl" />
            </div>

            {/* Grid pattern overlay */}
            <div
                className="absolute inset-0 -z-10 opacity-[0.02]"
                style={{
                    backgroundImage: `linear-gradient(var(--color-foreground) 1px, transparent 1px), linear-gradient(90deg, var(--color-foreground) 1px, transparent 1px)`,
                    backgroundSize: '60px 60px',
                }}
            />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 w-full">
                <div className="grid lg:grid-cols-2 gap-16 items-center">
                    {/* Left: Text content */}
                    <div className="space-y-8">
                        <div className="inline-flex items-center gap-2">
                            <Badge variant="secondary" className="px-3 py-1 text-xs font-medium gap-1.5">
                                <Sparkles className="w-3 h-3 text-primary" />
                                AI-powered LaTeX editor
                            </Badge>
                        </div>

                        <div className="space-y-4">
                            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.05]">
                                Write LaTeX
                                <br />
                                <span className="text-primary">10× faster</span>
                                <br />
                                with AI
                            </h1>
                            <p className="text-xl text-muted-foreground leading-relaxed max-w-lg">
                                Latyx is the modern LaTeX editor with real-time preview, AI autocomplete, and
                                one-click compilation. Stop fighting your tools — start writing.
                            </p>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-3">
                            <Button size="lg" className="gap-2 shadow-lg text-base px-6">
                                Start writing for free
                                <ArrowRight className="w-4 h-4" />
                            </Button>
                            <Button size="lg" variant="outline" className="gap-2 text-base px-6">
                                View demo
                            </Button>
                        </div>

                        {/* Social proof */}
                        <div className="flex items-center gap-4 pt-2">
                            <div className="flex -space-x-2">
                                {['A', 'B', 'C', 'D', 'E'].map((l, i) => (
                                    <div
                                        key={i}
                                        className="w-8 h-8 rounded-full border-2 border-background flex items-center justify-center text-xs font-bold text-primary-foreground"
                                        style={{
                                            background: `oklch(${0.45 + i * 0.04} 0.2 ${250 + i * 15})`,
                                        }}
                                    >
                                        {l}
                                    </div>
                                ))}
                            </div>
                            <div className="text-sm text-muted-foreground">
                                <span className="font-semibold text-foreground">12,000+</span> researchers &amp;
                                students trust Latyx
                            </div>
                        </div>

                        <div className="flex items-center gap-1">
                            {[...Array(5)].map((_, i) => (
                                <Star key={i} className="w-4 h-4 fill-primary text-primary" />
                            ))}
                            <span className="text-sm text-muted-foreground ml-2">4.9/5 from 2,400+ reviews</span>
                        </div>
                    </div>

                    {/* Right: Code preview card */}
                    <div className="relative">
                        <div className="relative rounded-2xl border border-border bg-card shadow-2xl overflow-hidden">
                            {/* Window chrome */}
                            <div className="flex items-center gap-2 px-4 py-3 border-b border-border bg-muted/30">
                                <div className="w-3 h-3 rounded-full bg-red-400" />
                                <div className="w-3 h-3 rounded-full bg-yellow-400" />
                                <div className="w-3 h-3 rounded-full bg-green-400" />
                                <span className="ml-2 text-xs text-muted-foreground font-mono">
                                    quantum_field_theory.tex
                                </span>
                            </div>

                            {/* Code area */}
                            <div className="p-6 font-mono text-sm leading-relaxed overflow-hidden">
                                <pre className="text-foreground/80 whitespace-pre-wrap">{codeSnippet}</pre>
                            </div>

                            {/* AI suggestion overlay */}
                            <div className="absolute bottom-4 right-4 bg-primary/10 border border-primary/20 rounded-lg px-3 py-2 flex items-center gap-2 backdrop-blur-sm">
                                <Sparkles className="w-3.5 h-3.5 text-primary" />
                                <span className="text-xs font-medium text-primary">AI suggestion ready</span>
                            </div>
                        </div>

                        {/* Floating PDF preview card */}
                        <div className="absolute -bottom-6 -left-6 bg-card border border-border rounded-xl shadow-xl p-4 w-48">
                            <div className="text-xs text-muted-foreground mb-2 font-medium">Live Preview</div>
                            <div className="space-y-1.5">
                                <div className="h-2 bg-foreground/20 rounded w-full" />
                                <div className="h-2 bg-foreground/10 rounded w-3/4" />
                                <div className="h-2 bg-foreground/10 rounded w-5/6" />
                                <div className="h-3 bg-primary/20 rounded w-full mt-2" />
                                <div className="h-2 bg-foreground/10 rounded w-4/5" />
                                <div className="h-2 bg-foreground/10 rounded w-full" />
                            </div>
                            <div className="mt-2 text-xs text-primary font-medium">✓ Compiled in 0.4s</div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

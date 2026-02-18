import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

const faqs = [
    {
        q: 'Is Latyx compatible with existing LaTeX projects?',
        a: 'Yes! You can import any existing .tex file or project. Latyx supports all standard LaTeX packages and compilers including pdfLaTeX, XeLaTeX, and LuaLaTeX. Your existing workflow will work seamlessly.',
    },
    {
        q: 'How does the AI autocomplete work?',
        a: 'Our AI is trained on millions of LaTeX documents across all academic disciplines. It understands mathematical context, common environments, and citation patterns. It suggests completions inline as you type, and you accept them with Tab.',
    },
    {
        q: 'Can I use Latyx offline?',
        a: 'The desktop app (coming soon) supports offline editing with local compilation. The web app requires an internet connection for cloud compilation, but your files are always synced locally.',
    },
    {
        q: 'How does real-time collaboration work?',
        a: 'Multiple users can edit the same document simultaneously. Changes appear in real-time with colored cursors showing who is editing where. Conflicts are resolved automatically using operational transformation — similar to Google Docs.',
    },
    {
        q: 'Is my research data secure?',
        a: 'Absolutely. Latyx is SOC 2 Type II certified. All data is encrypted at rest (AES-256) and in transit (TLS 1.3). We never read your documents. Enterprise customers can opt for on-premise deployment.',
    },
    {
        q: 'Can I submit directly to arXiv or journals?',
        a: 'Yes! Latyx has built-in arXiv submission support. For journals, we support export in the required formats for most major publishers including Elsevier, Springer, IEEE, and ACM.',
    },
    {
        q: 'What happens if I exceed my plan limits?',
        a: "We'll notify you before you hit your limits and give you the option to upgrade. We never cut off access mid-document. Free plan users can always export their work.",
    },
    {
        q: 'Do you offer academic or student discounts?',
        a: 'Yes! Students and educators get 50% off the Pro plan with a valid .edu email address. We also offer institutional pricing for universities and research labs.',
    },
];

function FAQItem({ q, a }) {
    const [open, setOpen] = useState(false);

    return (
        <div className="border border-border rounded-xl overflow-hidden">
            <button
                onClick={() => setOpen(!open)}
                className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-muted/50 transition-colors"
            >
                <span className="font-medium text-sm pr-4">{q}</span>
                <ChevronDown
                    className={`w-4 h-4 text-muted-foreground flex-shrink-0 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
                />
            </button>
            {open && (
                <div className="px-6 pb-4 text-sm text-muted-foreground leading-relaxed border-t border-border pt-4">
                    {a}
                </div>
            )}
        </div>
    );
}

export default function FAQ() {
    return (
        <section id="faq" className="py-24 relative">
            <div className="absolute inset-0 -z-10 bg-muted/20" />
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Section header */}
                <div className="text-center mb-16 space-y-4">
                    <p className="text-primary font-semibold text-sm uppercase tracking-wider">FAQ</p>
                    <h2 className="text-4xl sm:text-5xl font-bold tracking-tight">
                        Frequently asked questions
                    </h2>
                    <p className="text-muted-foreground text-lg">
                        Everything you need to know about Latyx. Can't find an answer?{' '}
                        <a href="#" className="text-primary hover:underline">
                            Chat with us.
                        </a>
                    </p>
                </div>

                <div className="space-y-3">
                    {faqs.map((faq, i) => (
                        <FAQItem key={i} q={faq.q} a={faq.a} />
                    ))}
                </div>
            </div>
        </section>
    );
}

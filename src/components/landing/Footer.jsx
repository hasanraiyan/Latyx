import { Zap, Github, Twitter, Linkedin } from 'lucide-react';

const footerLinks = {
    Product: ['Features', 'Pricing', 'Changelog', 'Roadmap', 'Status'],
    Resources: ['Documentation', 'API Reference', 'Templates', 'Blog', 'Community'],
    Company: ['About', 'Careers', 'Press', 'Partners', 'Contact'],
    Legal: ['Privacy Policy', 'Terms of Service', 'Cookie Policy', 'Security'],
};

export default function Footer() {
    return (
        <footer className="border-t border-border bg-muted/20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div className="grid grid-cols-2 md:grid-cols-6 gap-8">
                    {/* Brand */}
                    <div className="col-span-2 space-y-4">
                        <a href="#" className="flex items-center gap-2 group w-fit">
                            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                                <Zap className="w-4 h-4 text-primary-foreground" />
                            </div>
                            <span className="text-xl font-bold tracking-tight">Latyx</span>
                        </a>
                        <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
                            The modern LaTeX editor for researchers, academics, and scientists. Write faster with
                            AI, collaborate in real-time.
                        </p>
                        <div className="flex items-center gap-3">
                            {[Github, Twitter, Linkedin].map((Icon, i) => (
                                <a
                                    key={i}
                                    href="#"
                                    className="w-8 h-8 rounded-md border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-primary/30 transition-colors"
                                >
                                    <Icon className="w-4 h-4" />
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Links */}
                    {Object.entries(footerLinks).map(([category, links]) => (
                        <div key={category} className="space-y-3">
                            <h4 className="text-sm font-semibold">{category}</h4>
                            <ul className="space-y-2">
                                {links.map((link) => (
                                    <li key={link}>
                                        <a
                                            href="#"
                                            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                                        >
                                            {link}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                <div className="border-t border-border mt-12 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <p className="text-xs text-muted-foreground">
                        © {new Date().getFullYear()} Latyx, Inc. All rights reserved.
                    </p>
                    <p className="text-xs text-muted-foreground">
                        Made with ❤️ for the research community
                    </p>
                </div>
            </div>
        </footer>
    );
}

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Menu, X, Zap, ArrowRight } from 'lucide-react';

const navLinks = [
  { label: 'Features', href: '#features' },
  { label: 'Pricing', href: '#pricing' },
  { label: 'Testimonials', href: '#testimonials' },
  { label: 'FAQ', href: '#faq' },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-background/80 backdrop-blur-xl border-b border-border shadow-sm'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <a href="#" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
              <Zap className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold tracking-tight">Latyx</span>
          </a>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground rounded-md hover:bg-accent transition-colors"
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-3">
            <Button variant="ghost" size="sm">
              Sign in
            </Button>
            <Button size="sm" className="shadow-md gap-1.5" asChild>
              <Link to="/editor">
                Open Editor
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </Button>
          </div>

          {/* Mobile toggle */}
          <button
            className="md:hidden p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden bg-background/95 backdrop-blur-xl border-b border-border">
          <div className="px-4 py-4 space-y-1">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="block px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground rounded-md hover:bg-accent transition-colors"
              >
                {link.label}
              </a>
            ))}
            <div className="pt-3 flex flex-col gap-2">
              <Button variant="outline" className="w-full">
                Sign in
              </Button>
              <Button className="w-full gap-1.5" asChild>
                <Link to="/editor">
                  Open Editor
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

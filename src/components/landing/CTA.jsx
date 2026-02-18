import { Button } from '@/components/ui/button';
import { ArrowRight, Sparkles } from 'lucide-react';

export default function CTA() {
  return (
    <section className="py-24 relative overflow-hidden">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="relative rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-12 sm:p-16 overflow-hidden">
          {/* Background decoration */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-primary/10 rounded-full blur-3xl -translate-y-1/2" />
          <div className="absolute bottom-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-2xl translate-x-1/2 translate-y-1/2" />

          <div className="relative space-y-6">
            <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-1.5">
              <Sparkles className="w-3.5 h-3.5 text-primary" />
              <span className="text-sm font-medium text-primary">Free forever, no credit card</span>
            </div>

            <h2 className="text-4xl sm:text-5xl font-bold tracking-tight">
              Start writing better
              <br />
              LaTeX today
            </h2>

            <p className="text-muted-foreground text-lg max-w-xl mx-auto leading-relaxed">
              Join 12,000+ researchers who've already switched to Latyx. Set up in 60 seconds, and
              your first document will be ready before your old editor even loads.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
              <Button size="lg" className="gap-2 shadow-lg text-base px-8">
                Get started for free
                <ArrowRight className="w-4 h-4" />
              </Button>
              <Button size="lg" variant="outline" className="text-base px-8">
                Schedule a demo
              </Button>
            </div>

            <p className="text-xs text-muted-foreground">
              No credit card required · 14-day Pro trial · Cancel anytime
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

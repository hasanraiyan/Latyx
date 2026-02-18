import { Star, Quote } from 'lucide-react';

const testimonials = [
  {
    name: 'Dr. Sarah Chen',
    role: 'Professor of Physics, MIT',
    avatar: 'SC',
    color: 'oklch(0.55 0.22 260)',
    quote:
      'Latyx has completely transformed how I write papers. The AI autocomplete for equations is uncanny — it feels like it reads my mind. I went from spending 3 hours on formatting to 20 minutes.',
    stars: 5,
  },
  {
    name: 'Marcus Okonkwo',
    role: 'PhD Candidate, Stanford CS',
    avatar: 'MO',
    color: 'oklch(0.55 0.18 150)',
    quote:
      'The real-time collaboration feature saved my thesis. My advisor and I could edit simultaneously, and the version history meant I never lost work. Absolutely essential for any serious researcher.',
    stars: 5,
  },
  {
    name: 'Elena Vasquez',
    role: 'Research Scientist, CERN',
    avatar: 'EV',
    color: 'oklch(0.55 0.2 30)',
    quote:
      "I've tried every LaTeX editor out there. Latyx is the first one that doesn't feel like it was designed in 1995. The compilation speed alone is worth switching — 0.4 seconds vs 30 seconds in Overleaf.",
    stars: 5,
  },
  {
    name: 'James Park',
    role: 'Mathematics Lecturer, Oxford',
    avatar: 'JP',
    color: 'oklch(0.55 0.2 300)',
    quote:
      'The template library is incredible. I set up my department\'s standard paper format once, and now all my students use it. The "Submit to arXiv" button is a game changer.',
    stars: 5,
  },
  {
    name: 'Priya Sharma',
    role: 'Data Scientist, DeepMind',
    avatar: 'PS',
    color: 'oklch(0.55 0.2 200)',
    quote:
      "Coming from a software background, I love that Latyx has proper Git integration. I can branch my paper like I branch code. The diff view for LaTeX is something I didn't know I needed.",
    stars: 5,
  },
  {
    name: 'Thomas Müller',
    role: 'Postdoc, Max Planck Institute',
    avatar: 'TM',
    color: 'oklch(0.55 0.2 80)',
    quote:
      "The AI citation suggestions are phenomenal. It reads my context and suggests relevant papers I hadn't even considered. It's like having a research assistant built into my editor.",
    stars: 5,
  },
];

export default function Testimonials() {
  return (
    <section id="testimonials" className="py-24 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
          <p className="text-primary font-semibold text-sm uppercase tracking-wider">
            Testimonials
          </p>
          <h2 className="text-4xl sm:text-5xl font-bold tracking-tight">
            Loved by researchers
            <br />
            worldwide
          </h2>
          <p className="text-muted-foreground text-lg">
            Join thousands of academics who've made Latyx their primary writing tool.
          </p>
        </div>

        {/* Testimonial grid */}
        <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6">
          {testimonials.map((t, i) => (
            <div
              key={i}
              className="break-inside-avoid rounded-2xl border border-border bg-card p-6 hover:border-primary/30 hover:shadow-lg transition-all duration-300 group"
            >
              <Quote className="w-6 h-6 text-primary/30 mb-3 group-hover:text-primary/50 transition-colors" />
              <p className="text-sm text-muted-foreground leading-relaxed mb-4">"{t.quote}"</p>

              <div className="flex items-center gap-1 mb-4">
                {[...Array(t.stars)].map((_, j) => (
                  <Star key={j} className="w-3.5 h-3.5 fill-primary text-primary" />
                ))}
              </div>

              <div className="flex items-center gap-3">
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                  style={{ background: t.color }}
                >
                  {t.avatar}
                </div>
                <div>
                  <div className="text-sm font-semibold">{t.name}</div>
                  <div className="text-xs text-muted-foreground">{t.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

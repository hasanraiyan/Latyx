import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Zap } from 'lucide-react';

const plans = [
    {
        name: 'Free',
        price: '$0',
        period: 'forever',
        description: 'Perfect for students and solo researchers.',
        badge: null,
        features: [
            '3 active projects',
            '100 compilations/month',
            'Real-time preview',
            'Basic AI suggestions',
            '500 MB storage',
            'Community support',
        ],
        cta: 'Get started free',
        variant: 'outline',
        highlighted: false,
    },
    {
        name: 'Pro',
        price: '$12',
        period: 'per month',
        description: 'For serious researchers and academics.',
        badge: 'Most popular',
        features: [
            'Unlimited projects',
            'Unlimited compilations',
            'Real-time preview',
            'Advanced AI autocomplete',
            '10 GB storage',
            'Git integration',
            'Priority support',
            'Custom themes',
        ],
        cta: 'Start Pro trial',
        variant: 'default',
        highlighted: true,
    },
    {
        name: 'Team',
        price: '$39',
        period: 'per month',
        description: 'For labs, departments, and organizations.',
        badge: null,
        features: [
            'Everything in Pro',
            'Up to 10 team members',
            'Real-time collaboration',
            'Shared templates library',
            '100 GB storage',
            'SSO / SAML',
            'Audit logs',
            'Dedicated support',
        ],
        cta: 'Start Team trial',
        variant: 'outline',
        highlighted: false,
    },
];

export default function Pricing() {
    return (
        <section id="pricing" className="py-24 relative">
            {/* Background accent */}
            <div className="absolute inset-0 -z-10 bg-muted/30" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Section header */}
                <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
                    <p className="text-primary font-semibold text-sm uppercase tracking-wider">Pricing</p>
                    <h2 className="text-4xl sm:text-5xl font-bold tracking-tight">
                        Simple, transparent pricing
                    </h2>
                    <p className="text-muted-foreground text-lg">
                        Start free, upgrade when you need more. No hidden fees, no surprises.
                    </p>
                </div>

                {/* Plans */}
                <div className="grid md:grid-cols-3 gap-8 items-start">
                    {plans.map((plan, i) => (
                        <div
                            key={i}
                            className={`relative rounded-2xl border p-8 transition-all duration-300 ${plan.highlighted
                                    ? 'border-primary bg-card shadow-2xl shadow-primary/10 scale-[1.02]'
                                    : 'border-border bg-card hover:border-primary/30 hover:shadow-lg'
                                }`}
                        >
                            {plan.badge && (
                                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                                    <Badge className="px-3 py-1 gap-1.5 shadow-md">
                                        <Zap className="w-3 h-3" />
                                        {plan.badge}
                                    </Badge>
                                </div>
                            )}

                            <div className="mb-6">
                                <h3 className="text-lg font-bold mb-1">{plan.name}</h3>
                                <p className="text-sm text-muted-foreground mb-4">{plan.description}</p>
                                <div className="flex items-baseline gap-1">
                                    <span className="text-4xl font-bold tracking-tight">{plan.price}</span>
                                    <span className="text-muted-foreground text-sm">/{plan.period}</span>
                                </div>
                            </div>

                            <Button
                                variant={plan.variant}
                                className="w-full mb-6"
                                size="lg"
                            >
                                {plan.cta}
                            </Button>

                            <ul className="space-y-3">
                                {plan.features.map((feature, j) => (
                                    <li key={j} className="flex items-center gap-3 text-sm">
                                        <div
                                            className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${plan.highlighted ? 'bg-primary/15' : 'bg-muted'
                                                }`}
                                        >
                                            <Check
                                                className={`w-3 h-3 ${plan.highlighted ? 'text-primary' : 'text-muted-foreground'}`}
                                            />
                                        </div>
                                        <span className="text-muted-foreground">{feature}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                <p className="text-center text-sm text-muted-foreground mt-10">
                    All plans include a 14-day free trial. No credit card required.
                </p>
            </div>
        </section>
    );
}

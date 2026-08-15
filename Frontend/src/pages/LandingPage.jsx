/**
 * LandingPage.jsx
 * -----------------------------------------
 * Public marketing page.
 * BATCH 2 UPDATE (visual only): added a subtle radial-glow background
 * behind the hero, refined typography scale, wrapped sections in the
 * new ScrollReveal component for a soft entrance as the user scrolls,
 * and polished the feature cards / CTA band. ALL content, copy, CTA
 * destinations, and the hash-scroll useEffect from the Batch 4
 * navigation fix are UNCHANGED.
 */

import { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ArrowRight, Target, Sparkles, Route as RouteIcon, MessagesSquare } from 'lucide-react';
import Button from '../components/ui/atoms/Button';
import Card from '../components/ui/molecules/Card';
import ScrollReveal from '../components/ui/motion/ScrollReveal';
import { ROUTES } from '../routes/routeConfig';

const FEATURES = [
  {
    icon: Target,
    title: 'Skill Gap Analysis',
    description:
      'A transparent, rule-based engine compares your real skills against what your target career actually requires.',
  },
  {
    icon: Sparkles,
    title: 'Personalized Recommendations',
    description:
      'Course and platform suggestions tailored to your background, budget, and time — with every reason shown, never a black box.',
  },
  {
    icon: RouteIcon,
    title: 'Sequenced Learning Roadmap',
    description:
      'A dependency-aware, staged plan that unlocks as you progress — never overwhelming, always the right next step.',
  },
  {
    icon: MessagesSquare,
    title: 'Interview Readiness',
    description: 'Practice questions and mock tests tuned to your target role, tracked over time.',
  },
];

const STEPS = [
  { title: 'Assess', description: 'Tell us your current skills and background.' },
  { title: 'Analyze Gap', description: 'See exactly what stands between you and your goal.' },
  { title: 'Get Roadmap', description: 'Follow a sequenced, staged learning plan.' },
  { title: 'Track Progress', description: 'Stay accountable and interview-ready.' },
];

export default function LandingPage() {
  const location = useLocation();

  useEffect(() => {
    if (!location.hash) return;
    const target = document.querySelector(location.hash);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [location.hash]);

  return (
    <div>
      <section className="relative overflow-hidden px-6 py-28">
        <div
          className="pointer-events-none absolute left-1/2 top-0 h-[520px] w-[900px] -translate-x-1/2 -translate-y-1/3 rounded-full bg-brand/20 blur-3xl"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute right-1/4 top-40 h-64 w-64 rounded-full bg-accent/20 blur-3xl"
          aria-hidden="true"
        />

        <div className="relative mx-auto max-w-3xl text-center">
          <span className="mb-5 inline-flex items-center gap-1.5 rounded-full border border-brand/20 bg-brand-subtle px-3 py-1 text-xs font-medium text-brand">
            <Sparkles className="h-3 w-3" /> Rule-based, explainable, always transparent
          </span>
          <h1 className="text-5xl font-extrabold leading-[1.1] tracking-tight text-text-primary sm:text-6xl">
            Know exactly what to <span className="bg-gradient-to-r from-brand to-accent bg-clip-text text-transparent">learn next</span>
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-text-secondary">
            A rule-based career and course decision platform — skill gap analysis, personalized
            recommendations, and a roadmap built for your goals. AI only enhances; it never
            replaces the logic you can see and trust.
          </p>
          <div className="mt-9 flex items-center justify-center gap-3">
            <Link to={ROUTES.REGISTER}>
              <Button size="lg">
                Get Started <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link to={ROUTES.CAREER_EXPLORER}>
              <Button size="lg" variant="secondary">
                Explore Careers
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <section id="how-it-works" className="border-t border-border-subtle bg-surface px-6 py-20">
        <div className="mx-auto max-w-5xl">
          <ScrollReveal>
            <h2 className="text-center text-2xl font-bold tracking-tight text-text-primary">
              How It Works
            </h2>
          </ScrollReveal>
          <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((step, i) => (
              <ScrollReveal key={step.title} delayMs={i * 80} className="text-center">
                <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-brand to-accent text-sm font-semibold text-white shadow-sm">
                  {i + 1}
                </div>
                <h3 className="mt-3.5 font-semibold text-text-primary">{step.title}</h3>
                <p className="mt-1 text-sm text-text-secondary">{step.description}</p>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 py-20">
        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 sm:grid-cols-2">
          {FEATURES.map((feature, i) => (
            <ScrollReveal key={feature.title} delayMs={i * 80}>
              <Card interactive className="h-full">
                <div className="flex h-10 w-10 items-center justify-center rounded-md bg-brand-subtle">
                  <feature.icon className="h-5 w-5 text-brand" />
                </div>
                <h3 className="mt-3.5 font-semibold text-text-primary">{feature.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-text-secondary">{feature.description}</p>
              </Card>
            </ScrollReveal>
          ))}
        </div>
      </section>

      <section className="relative overflow-hidden border-t border-border-subtle bg-gradient-to-br from-brand to-accent px-6 py-16 text-center text-white">
        <div
          className="pointer-events-none absolute -bottom-20 left-1/2 h-64 w-[700px] -translate-x-1/2 rounded-full bg-white/10 blur-3xl"
          aria-hidden="true"
        />
        <div className="relative">
          <h2 className="text-2xl font-bold tracking-tight">Ready to find your path?</h2>
          <Link to={ROUTES.REGISTER}>
            <Button size="lg" variant="secondary" className="mt-6">
              Create Your Free Account
            </Button>
          </Link>
        </div>
      </section>

      <footer className="px-6 py-8 text-center text-sm text-text-tertiary">
        © {new Date().getFullYear()} Career Platform. All rights reserved.
      </footer>
    </div>
  );
}
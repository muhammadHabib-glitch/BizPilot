import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  FileText,
  Calendar,
  Users,
  Sparkles,
  BarChart3,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";

const features = [
  {
    icon: FileText,
    title: "Smart Invoicing",
    description:
      "Create professional invoices in seconds. Auto-reminders, online payments, and recurring billing built in.",
  },
  {
    icon: Calendar,
    title: "Easy Scheduling",
    description:
      "Share your booking page. Clients self-schedule. Auto-confirmations and reminders — zero back-and-forth.",
  },
  {
    icon: Users,
    title: "Client Management",
    description:
      "Full client profiles with history, notes, and tags. Always know where things stand.",
  },
  {
    icon: Sparkles,
    title: "AI Copilot",
    description:
      "Get cash flow predictions, smart follow-up suggestions, and business insights powered by AI.",
  },
  {
    icon: BarChart3,
    title: "Financial Reports",
    description:
      "Revenue trends, outstanding receivables, and tax summaries — always up to date.",
  },
  {
    icon: CheckCircle2,
    title: "All-in-One",
    description:
      "Stop juggling 5 different tools. BizPilot replaces your scattered spreadsheets and apps.",
  },
];

const pricingPlans = [
  {
    name: "Free",
    price: "$0",
    description: "For testing and small side projects",
    features: [
      "Up to 5 clients",
      "10 invoices/month",
      "1 booking page",
      "Basic reports",
    ],
  },
  {
    name: "Starter",
    price: "$29",
    period: "/month",
    description: "For solopreneurs and freelancers",
    features: [
      "Unlimited clients",
      "Unlimited invoices",
      "3 booking pages",
      "AI insights (100/mo)",
      "Email support",
    ],
    popular: true,
  },
  {
    name: "Professional",
    price: "$79",
    period: "/month",
    description: "For growing businesses",
    features: [
      "Everything in Starter",
      "Unlimited booking pages",
      "AI insights (500/mo)",
      "Team members (up to 5)",
      "Priority support",
    ],
  },
];

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b border-gray-200 bg-white/80 backdrop-blur-sm">
        <div className="mx-auto max-w-6xl flex items-center justify-between px-6 h-16">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white font-bold text-sm">
              B
            </div>
            <span className="text-xl font-bold text-gray-900">BizPilot</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost">Sign in</Button>
            </Link>
            <Link href="/signup">
              <Button>
                Start Free <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-6 py-24 text-center">
        <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-4 py-1.5 text-sm font-medium text-blue-700 mb-6">
          <Sparkles className="h-4 w-4" />
          AI-Powered Back Office
        </div>
        <h1 className="text-5xl font-bold tracking-tight text-gray-900 sm:text-6xl">
          Run your business,
          <br />
          <span className="text-blue-600">not your back office</span>
        </h1>
        <p className="mt-6 text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
          Invoicing, scheduling, clients, and AI insights — all in one place.
          Built for small businesses that would rather grow than do paperwork.
        </p>
        <div className="mt-10 flex items-center justify-center gap-4">
          <Link href="/signup">
            <Button size="lg" className="text-base px-8">
              Start Free Trial <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </Link>
          <Link href="#features">
            <Button variant="outline" size="lg" className="text-base px-8">
              See Features
            </Button>
          </Link>
        </div>
        <p className="mt-4 text-sm text-gray-400">
          14-day free trial &middot; No credit card required
        </p>
      </section>

      {/* Features */}
      <section id="features" className="bg-gray-50 py-24">
        <div className="mx-auto max-w-6xl px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900">
              Everything you need, nothing you don&apos;t
            </h2>
            <p className="mt-4 text-gray-600 max-w-2xl mx-auto">
              Stop paying for 5 different tools. BizPilot gives you a complete
              back office in one simple dashboard.
            </p>
          </div>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="rounded-xl bg-white border border-gray-200 p-6 shadow-sm"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600 mb-4">
                  <feature.icon className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {feature.title}
                </h3>
                <p className="mt-2 text-sm text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-24">
        <div className="mx-auto max-w-6xl px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900">
              Simple, honest pricing
            </h2>
            <p className="mt-4 text-gray-600">
              Start free. Upgrade when you&apos;re ready.
            </p>
          </div>
          <div className="grid gap-8 lg:grid-cols-3 max-w-4xl mx-auto">
            {pricingPlans.map((plan) => (
              <div
                key={plan.name}
                className={`rounded-xl border p-8 ${
                  plan.popular
                    ? "border-blue-600 ring-2 ring-blue-600 relative"
                    : "border-gray-200"
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-blue-600 px-3 py-1 text-xs font-medium text-white">
                    Most Popular
                  </div>
                )}
                <h3 className="text-lg font-semibold text-gray-900">
                  {plan.name}
                </h3>
                <div className="mt-4 flex items-baseline gap-1">
                  <span className="text-4xl font-bold text-gray-900">
                    {plan.price}
                  </span>
                  {plan.period && (
                    <span className="text-gray-500">{plan.period}</span>
                  )}
                </div>
                <p className="mt-2 text-sm text-gray-500">
                  {plan.description}
                </p>
                <ul className="mt-6 space-y-3">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-sm text-gray-700">
                      <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Link href="/signup" className="mt-8 block">
                  <Button
                    variant={plan.popular ? "default" : "outline"}
                    className="w-full"
                  >
                    Get Started
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-blue-600 py-16">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <h2 className="text-3xl font-bold text-white">
            Ready to simplify your business?
          </h2>
          <p className="mt-4 text-blue-100 text-lg">
            Join thousands of small businesses running smarter with BizPilot.
          </p>
          <Link href="/signup">
            <Button
              size="lg"
              className="mt-8 bg-white text-blue-600 hover:bg-blue-50 text-base px-8"
            >
              Start Your Free Trial
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white py-12">
        <div className="mx-auto max-w-6xl px-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded bg-blue-600 text-white font-bold text-xs">
                B
              </div>
              <span className="text-sm font-semibold text-gray-900">
                BizPilot
              </span>
            </div>
            <p className="text-sm text-gray-400">
              &copy; {new Date().getFullYear()} BizPilot. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

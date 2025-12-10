
'use client';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/logo';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/hooks/use-auth';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, CheckCircle, ChevronDown, DollarSign, BarChart, Users, FileText, Zap, Shield, GitBranch } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Badge } from '@/components/ui/badge';

const featureHighlights = [
    {
        icon: Users,
        title: 'Client Management',
        description: 'Keep a complete directory of your clients, track communications, and manage relationships with ease.',
        image: PlaceHolderImages.find(p => p.id === 'feature-clients')?.imageUrl || "https://picsum.photos/seed/feature-clients/600/400",
        imageHint: 'people business meeting'
    },
    {
        icon: FileText,
        title: 'Effortless Invoicing',
        description: 'Create, send, and track professional invoices in seconds. Get paid faster with automated reminders.',
        image: PlaceHolderImages.find(p => p.id === 'feature-invoicing')?.imageUrl || "https://picsum.photos/seed/feature-invoicing/600/400",
        imageHint: 'invoice document payment'
    },
    {
        icon: Zap,
        title: 'AI-Powered Insights',
        description: 'Leverage our AI financial analyst to get daily summaries, revenue trends, and actionable business advice.',
        image: PlaceHolderImages.find(p => p.id === 'feature-ai')?.imageUrl || "https://picsum.photos/seed/feature-ai/600/400",
        imageHint: 'abstract data chart'
    },
];

const howItWorksSteps = [
  {
    number: "01",
    title: "Sign Up & Set Up",
    description: "Create your account in minutes and set up your business profile. It's quick, easy, and free to start.",
  },
  {
    number: "02",
    title: "Add Your Data",
    description: "Easily import or add your clients, products, and services. Our intuitive interface makes data entry a breeze.",
  },
  {
    number: "03",
    title: "Manage & Grow",
    description: "Start sending invoices, tracking tasks, and generating AI insights to streamline operations and grow your business.",
  },
];

const faqItems = [
  {
    question: 'Is there a free trial?',
    answer: 'Yes! All new accounts start with a 14-day free trial of our Unlimited Plan, giving you full access to all features. No credit card is required to start.',
  },
  {
    question: 'What happens after my free trial ends?',
    answer: "After your trial, your account will be limited. You can choose to upgrade to our affordable paid plan at any time to continue using all features without interruption.",
  },
  {
    question: 'Can I cancel my subscription at any time?',
    answer: 'Absolutely. You can cancel your subscription at any time from your billing settings. You will retain access to your plan until the end of the current billing cycle.',
  },
  {
    question: 'Is my data secure?',
    answer: 'Yes, security is our top priority. All your data is encrypted in transit and at rest. We use industry-standard security practices to ensure your business information is safe.',
  },
];


export default function LandingPage() {
  const { user, initializing } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!initializing && user) {
      router.replace('/dashboard');
    }
  }, [user, initializing, router]);

  // Prevent flash of content while redirecting
  if (initializing || user) {
    return (
        <div className="flex min-h-screen w-full items-center justify-center bg-background">
            <div className="flex flex-col items-center gap-4">
                <Logo />
                <p className="text-sm text-muted-foreground">Loading your workspace...</p>
            </div>
        </div>
    );
  }

  return (
    <div className="flex min-h-dvh flex-col bg-background text-foreground">
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur-sm">
        <div className="container mx-auto flex h-16 max-w-7xl items-center justify-between px-4 md:px-6">
          <Logo />
          <nav className="hidden items-center gap-6 text-sm font-medium md:flex">
             <Link href="#features" className="text-muted-foreground transition-colors hover:text-foreground">Features</Link>
             <Link href="#pricing" className="text-muted-foreground transition-colors hover:text-foreground">Pricing</Link>
             <Link href="#faq" className="text-muted-foreground transition-colors hover:text-foreground">FAQ</Link>
          </nav>
          <div className="flex items-center gap-4">
            <Button variant="ghost" asChild>
                <Link href="/login">Login</Link>
            </Button>
            <Button asChild>
              <Link href="/signup">Get Started <ArrowRight className="ml-2 h-4 w-4" /></Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative border-b">
             <div className="container mx-auto max-w-7xl px-4 md:px-6 text-center py-20 md:py-32">
                <Badge variant="outline" className="mb-4 py-1 px-3 rounded-full">Your All-in-One Business Command Center</Badge>
                <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl">
                    The Smart Way to Run Your Small Business
                </h1>
                <p className="mx-auto mt-6 max-w-3xl text-lg text-muted-foreground md:text-xl">
                    Stop juggling spreadsheets and apps. Dulus Business Manager (DBM) brings your clients, invoices, tasks, and financial insights into one powerful, AI-driven platform.
                </p>
                <div className="mt-8 flex justify-center gap-4">
                    <Button size="lg" asChild>
                        <Link href="/signup">Start Your Free Trial</Link>
                    </Button>
                    <Button size="lg" variant="outline" asChild>
                        <Link href="#features">Learn More <ChevronDown className="ml-2 h-4 w-4" /></Link>
                    </Button>
                </div>
            </div>
             <div
                className="absolute inset-0 -z-10 h-full w-full bg-white bg-[linear-gradient(to_right,#f0f0f0_1px,transparent_1px),linear-gradient(to_bottom,#f0f0f0_1px,transparent_1px)] bg-[size:6rem_4rem] dark:bg-background dark:bg-[linear-gradient(to_right,#1e1e1e_1px,transparent_1px),linear-gradient(to_bottom,#1e1e1e_1px,transparent_1px)]">
                <div
                    className="absolute bottom-0 left-0 right-0 top-0 bg-[radial-gradient(circle_500px_at_50%_200px,hsl(var(--primary)/0.1),transparent)] dark:bg-[radial-gradient(circle_500px_at_50%_200px,hsl(var(--primary)/0.05),transparent)]"></div>
            </div>
        </section>

        {/* Social Proof */}
        <section className="py-12 bg-muted/40 border-b">
            <div className="container mx-auto max-w-7xl px-4 md:px-6">
                <p className="text-center text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                    Trusted by small businesses and freelancers
                </p>
                <div className="mt-6 grid grid-cols-2 place-items-center gap-8 sm:grid-cols-3 md:grid-cols-6">
                    <GitBranch className="h-8 w-auto text-muted-foreground" />
                    <Zap className="h-8 w-auto text-muted-foreground" />
                    <DollarSign className="h-8 w-auto text-muted-foreground" />
                    <Shield className="h-8 w-auto text-muted-foreground" />
                    <BarChart className="h-8 w-auto text-muted-foreground" />
                    <Users className="h-8 w-auto text-muted-foreground" />
                </div>
            </div>
        </section>


        {/* Features Section */}
        <section id="features" className="py-20 md:py-32">
            <div className="container mx-auto max-w-7xl px-4 md:px-6">
                <div className="text-center">
                    <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Everything You Need. Nothing You Don’t.</h2>
                    <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
                       DBM is packed with features designed to save you time, reduce stress, and give you a clear view of your business health.
                    </p>
                </div>
                <div className="mt-16 space-y-24">
                    {featureHighlights.map((feature, index) => (
                        <div key={feature.title} className={`grid gap-8 md:grid-cols-2 md:gap-16 items-center ${index % 2 !== 0 ? 'md:grid-flow-col-dense' : ''}`}>
                            <div className={index % 2 !== 0 ? 'md:col-start-2' : ''}>
                                <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10 text-primary mb-4">
                                    <feature.icon className="w-6 h-6" />
                                </div>
                                <h3 className="text-2xl font-bold">{feature.title}</h3>
                                <p className="mt-2 text-muted-foreground">{feature.description}</p>
                            </div>
                            <div className="relative">
                                <Image
                                    src={feature.image}
                                    alt={feature.title}
                                    width={600}
                                    height={400}
                                    className="rounded-lg shadow-lg"
                                    data-ai-hint={feature.imageHint}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
        
        {/* How It Works Section */}
        <section className="py-20 md:py-32 bg-muted/40 border-y">
            <div className="container mx-auto max-w-7xl px-4 md:px-6">
                <div className="text-center">
                    <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Get Started in 3 Simple Steps</h2>
                    <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
                        From signup to sending your first invoice in under 5 minutes.
                    </p>
                </div>
                 <div className="relative mt-16 grid gap-8 md:grid-cols-3">
                    <div className="absolute top-1/2 left-0 w-full h-px bg-border/50 hidden md:block" />
                    {howItWorksSteps.map((step) => (
                        <div key={step.number} className="relative text-center p-6 bg-background rounded-lg border shadow-sm">
                             <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-background px-2">
                                <div className="flex h-12 w-12 items-center justify-center rounded-full border bg-primary font-bold text-primary-foreground">
                                    {step.number}
                                </div>
                            </div>
                            <h3 className="mt-8 text-xl font-bold">{step.title}</h3>
                            <p className="mt-2 text-muted-foreground">{step.description}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>


        {/* Pricing Section */}
        <section id="pricing" className="py-20 md:py-32">
            <div className="container mx-auto flex max-w-7xl justify-center px-4 md:px-6">
                <div className="w-full max-w-md rounded-2xl border-2 border-primary bg-card p-8 text-center shadow-2xl shadow-primary/10">
                    <h3 className="text-3xl font-bold">Unlimited Plan</h3>
                    <p className="mt-2 text-muted-foreground">Start with a 14-day free trial. No credit card required.</p>
                    <div className="my-8">
                        <span className="text-5xl font-extrabold">R349</span>
                        <span className="text-lg text-muted-foreground">/month</span>
                    </div>
                     <p className="text-sm text-muted-foreground mb-6">(approx. $20 USD, billed monthly)</p>
                    <Button size="lg" className="w-full" asChild>
                        <Link href="/signup">Start Free Trial</Link>
                    </Button>
                    <ul className="mt-8 space-y-4 text-left">
                        {[
                            "Unlimited Clients & Invoices",
                            "AI-Powered Insights",
                            "Task & Inventory Management",
                            "Secure Cloud Data Storage",
                            "Email & WhatsApp Support",
                        ].map((text, i) => (
                           <li key={i} className="flex items-center gap-3">
                               <CheckCircle className="h-5 w-5 text-green-500" />
                               <span>{text}</span>
                           </li>
                        ))}
                    </ul>
                </div>
            </div>
        </section>

        {/* FAQ Section */}
        <section id="faq" className="py-20 md:py-32 border-t bg-muted/40">
            <div className="container mx-auto max-w-3xl px-4 md:px-6">
                <div className="text-center">
                    <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Frequently Asked Questions</h2>
                </div>
                <Accordion type="single" collapsible className="w-full mt-12">
                   {faqItems.map((item, index) => (
                      <AccordionItem value={`item-${index}`} key={index}>
                        <AccordionTrigger className="text-lg">{item.question}</AccordionTrigger>
                        <AccordionContent className="text-muted-foreground text-base">
                          {item.answer}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                </Accordion>
            </div>
        </section>
      </main>

      <footer className="w-full border-t">
        <div className="container mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 py-8 text-center md:flex-row md:px-6">
            <div className="flex flex-col items-center md:items-start">
                <Logo />
                <p className="mt-2 text-sm text-muted-foreground">&copy; {new Date().getFullYear()} Dulus Data Dynamics. All rights reserved.</p>
            </div>
            <div className="flex gap-4">
                <Link href="/terms" className="text-sm text-muted-foreground hover:text-foreground">Terms of Service</Link>
                <Link href="/privacy" className="text-sm text-muted-foreground hover:text-foreground">Privacy Policy</Link>
                 <a href="https://dulusdatadynamics.netlify.app" target="_blank" rel="noopener noreferrer" className="text-sm text-muted-foreground hover:text-foreground">Website</a>
            </div>
        </div>
      </footer>
    </div>
  );
}

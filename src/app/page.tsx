
'use client';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/logo';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Check, LayoutDashboard, UsersRound, FileText, TrendingUp, Bot, Sparkles, FilePieChart, X, Youtube, Instagram, Linkedin } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';

const problems = [
    { icon: X, text: "Invoices scattered everywhere" },
    { icon: X, text: "Sales written in notebooks" },
    { icon: X, text: "No idea how much profit you're making" },
    { icon: X, text: "Clients aren't organized" },
    { icon: X, text: "End of the month is a stressful nightmare" },
];

const solutionFeatures = [
    {
        icon: FileText,
        title: 'Smart Invoicing',
        description: 'Create and send professional invoices in seconds, and get paid faster.',
    },
    {
        icon: LayoutDashboard,
        title: 'Business Dashboard',
        description: 'See your sales, income, and business performance instantly in one clear view.',
    },
    {
        icon: UsersRound,
        title: 'Client Manager',
        description: 'Store, manage, and track all your customer information and history with ease.',
    },
    {
        icon: TrendingUp,
        title: 'Sales Tracking',
        description: 'Know exactly how your business is performing every day with real-time analytics.',
    },
];

const howItWorksSteps = [
  {
    number: "01",
    title: "Create Your Account",
    description: "Sign up in minutes with just your email. No credit card required to start.",
  },
  {
    number: "02",
    title: "Add Customers & Products",
    description: "Easily import or add your clients and the services or products you sell.",
  },
  {
    number: "03",
    title: "Manage & Grow",
    description: "Start sending invoices, tracking tasks, and using AI insights to grow your business.",
  },
];

const aiFeatures = [
    { icon: Bot, title: "AI Invoice Generation", description: "Let AI create draft invoices for you based on client history." },
    { icon: Sparkles, title: "Smart Business Insights", description: "Get daily, easy-to-understand summaries of your financial health." },
    { icon: FilePieChart, title: "Automated Reports", description: "Generate sales, revenue, and client reports automatically." },
];

const whoIsItFor = [
    "Small Businesses",
    "Freelancers",
    "Retail Shops",
    "Service-based Businesses",
    "Startups & Entrepreneurs",
    "Artisans & Creators"
];

const faqItems = [
  {
    question: 'Is there a free trial?',
    answer: 'Yes! All new accounts start with a special 1-month free trial of our Unlimited Plan, giving you full access to all features. No credit card is required to start.',
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
  return (
    <div className="flex min-h-dvh flex-col bg-background text-foreground">
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur-sm">
        <div className="container mx-auto flex h-16 max-w-7xl items-center justify-between px-4 md:px-6">
          <Logo />
          <nav className="hidden items-center gap-6 text-sm font-medium md:flex">
             <Link href="#solution" className="text-muted-foreground transition-colors hover:text-foreground">Solution</Link>
             <Link href="#pricing" className="text-muted-foreground transition-colors hover:text-foreground">Pricing</Link>
             <Link href="#faq" className="text-muted-foreground transition-colors hover:text-foreground">FAQ</Link>
          </nav>
          <div className="flex items-center gap-4">
            <Button variant="ghost" asChild>
                <Link href="/login">Login</Link>
            </Button>
            <Button asChild>
              <Link href="/signup">Sign Up <ArrowRight className="ml-2 h-4 w-4" /></Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative border-b py-20 md:py-32">
             <div className="container mx-auto max-w-7xl px-4 md:px-6 text-center">
                <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl">
                    Run Your Entire Business in One Simple Dashboard
                </h1>
                <p className="mx-auto mt-6 max-w-3xl text-lg text-muted-foreground md:text-xl">
                    Manage invoices, clients, sales, and business performance in one place — built for small businesses.
                </p>
                <div className="mt-8 flex justify-center gap-4">
                    <Button size="lg" asChild>
                        <Link href="/signup">Start Your 1-Month Free Trial</Link>
                    </Button>
                </div>
                <div className="mt-16 mx-auto max-w-5xl">
                    <Card className="overflow-hidden rounded-lg border shadow-2xl shadow-primary/10">
                        <CardContent className="p-0">
                             <Image
                                src={PlaceHolderImages.find(p => p.id === 'dashboard-screenshot')?.imageUrl || "https://picsum.photos/seed/dashboard-screenshot/1200/800"}
                                alt="Dulus Business Manager Dashboard"
                                width={1200}
                                height={800}
                                className="w-full h-auto"
                                data-ai-hint="dashboard analytics"
                                priority
                            />
                        </CardContent>
                    </Card>
                </div>
            </div>
             <div
                className="absolute inset-0 -z-10 h-full w-full bg-white bg-[linear-gradient(to_right,#f0f0f0_1px,transparent_1px),linear-gradient(to_bottom,#f0f0f0_1px,transparent_1px)] bg-[size:6rem_4rem] dark:bg-background dark:bg-[linear-gradient(to_right,hsl(var(--border)),transparent_1px),linear-gradient(to_bottom,hsl(var(--border)),transparent_1px)]">
                <div
                    className="absolute bottom-0 left-0 right-0 top-0 bg-[radial-gradient(circle_500px_at_50%_200px,hsl(var(--primary)/0.1),transparent)] dark:bg-[radial-gradient(circle_500px_at_50%_200px,hsl(var(--primary)/0.05),transparent)]"></div>
            </div>
        </section>
        
        {/* Problem Section */}
        <section id="problem" className="py-20 md:py-28 bg-muted/40 border-b">
            <div className="container mx-auto max-w-4xl px-4 md:px-6 text-center">
                <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Running a Business Shouldn't Be This Messy</h2>
                <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
                    If you're juggling notebooks, spreadsheets, and messages just to keep track of everything, you're not alone.
                </p>
                <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-left">
                    {problems.map((problem) => (
                        <Card key={problem.text} className="p-4 bg-background/50">
                            <div className="flex items-center gap-3">
                                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-destructive/10 text-destructive">
                                    <problem.icon className="h-4 w-4" />
                                </div>
                                <span className="font-medium">{problem.text}</span>
                            </div>
                        </Card>
                    ))}
                </div>
                <p className="mt-12 text-xl font-semibold">Dulus Business Manager fixes all of this in one place.</p>
            </div>
        </section>

        {/* Solution Section */}
        <section id="solution" className="py-20 md:py-28">
            <div className="container mx-auto max-w-7xl px-4 md:px-6">
                <div className="text-center">
                    <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Everything Your Business Needs in One Place</h2>
                    <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
                       DBM is packed with features designed to save you time and give you a clear view of your business health.
                    </p>
                </div>
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mt-16">
                    {solutionFeatures.map((feature) => (
                        <div key={feature.title}>
                            <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10 text-primary mb-4">
                                <feature.icon className="w-6 h-6" />
                            </div>
                            <h3 className="text-xl font-bold">{feature.title}</h3>
                            <p className="mt-2 text-muted-foreground">{feature.description}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>

        {/* How It Works Section */}
        <section id="how-it-works" className="py-20 md:py-28  bg-muted/40 border-y">
            <div className="container mx-auto max-w-7xl px-4 md:px-6">
                <div className="text-center">
                    <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Get Started in Minutes</h2>
                    <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
                        From signup to sending your first invoice in under 5 minutes. It's that simple.
                    </p>
                </div>
                 <div className="relative mt-16 grid gap-16 md:gap-8 md:grid-cols-3">
                    <div className="absolute top-1/2 left-0 w-full h-px bg-border/50 hidden md:block" />
                    {howItWorksSteps.map((step) => (
                        <div key={step.number} className="relative text-center p-6 bg-background rounded-lg border shadow-sm">
                             <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-background px-2">
                                <div className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-primary bg-primary/10 font-bold text-primary">
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

        {/* AI Feature Section */}
        <section id="ai-features" className="py-20 md:py-28">
            <div className="container mx-auto max-w-4xl px-4 md:px-6 text-center">
                <Badge variant="outline" className="mb-4 py-1 px-3 rounded-full text-primary border-primary">Your Secret Weapon</Badge>
                <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Built with AI to Save You Time</h2>
                <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
                    DBM uses the latest AI technology to automate tasks and provide you with powerful, actionable insights, making your business smarter.
                </p>
                <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-6 text-left">
                    {aiFeatures.map((feature) => (
                        <Card key={feature.title} className="p-6 text-center bg-card">
                            <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10 text-primary mb-4">
                                <feature.icon className="w-6 h-6" />
                            </div>
                            <h3 className="font-bold">{feature.title}</h3>
                            <p className="text-sm text-muted-foreground mt-1">{feature.description}</p>
                        </Card>
                    ))}
                </div>
            </div>
        </section>
        
        {/* Who It's For Section */}
        <section id="who-its-for" className="py-20 md:py-28 bg-muted/40 border-y">
            <div className="container mx-auto max-w-4xl px-4 md:px-6 text-center">
                 <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Perfect for Businesses Like Yours</h2>
                 <div className="flex flex-wrap justify-center gap-x-6 gap-y-4 mt-8">
                    {whoIsItFor.map(who => (
                        <div key={who} className="flex items-center gap-2 text-lg">
                           <Check className="h-5 w-5 text-green-500" />
                           <span>{who}</span>
                        </div>
                    ))}
                 </div>
            </div>
        </section>

        {/* Social Proof Section */}
        <section className="py-20 md:py-28">
             <div className="container mx-auto max-w-3xl px-4 md:px-6 text-center">
                <blockquote className="text-xl italic md:text-2xl text-foreground">
                    “DBM made managing my invoices so much easier and saved me hours every week. I finally feel in control of my business finances.”
                </blockquote>
                <p className="mt-6 font-semibold">- Small Business Owner</p>
             </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="py-20 md:py-28 bg-muted/40 border-y">
            <div className="container mx-auto flex max-w-7xl justify-center px-4 md:px-6">
                <div className="w-full max-w-md rounded-2xl border-2 border-primary bg-card p-8 text-center shadow-2xl shadow-primary/10">
                    <h3 className="text-3xl font-bold">Simple, Transparent Pricing</h3>
                    <p className="mt-2 text-muted-foreground">Start with a 1-month free trial. No credit card required.</p>
                    <div className="my-8">
                        <span className="text-5xl font-extrabold">R99</span>
                        <span className="text-lg text-muted-foreground">/month</span>
                    </div>
                     <p className="text-sm text-muted-foreground mb-6">(approx. $5 USD, billed monthly)</p>
                    <Button size="lg" className="w-full" asChild>
                        <Link href="/signup">Start Your 1-Month Trial</Link>
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
                               <Check className="h-5 w-5 text-green-500" />
                               <span>{text}</span>
                           </li>
                        ))}
                    </ul>
                </div>
            </div>
        </section>

        {/* FAQ Section */}
        <section id="faq" className="py-20 md:py-28">
            <div className="container mx-auto max-w-3xl px-4 md:px-6">
                <div className="text-center">
                    <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Frequently Asked Questions</h2>
                </div>
                <Accordion type="single" collapsible className="w-full mt-12">
                   {faqItems.map((item, index) => (
                      <AccordionItem value={`item-${index}`} key={index}>
                        <AccordionTrigger className="text-lg text-left">{item.question}</AccordionTrigger>
                        <AccordionContent className="text-muted-foreground text-base">
                          {item.answer}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                </Accordion>
            </div>
        </section>
        
        {/* Final CTA Section */}
        <section className="py-20 md:py-32 border-t bg-muted/40">
             <div className="container mx-auto max-w-7xl px-4 md:px-6 text-center">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                    Start Managing Your Business Smarter Today
                </h2>
                <p className="mx-auto mt-4 max-w-xl text-lg text-muted-foreground">
                    Join hundreds of small businesses who have taken control of their finances and operations with Dulus Business Manager.
                </p>
                <div className="mt-8">
                    <Button size="lg" asChild>
                        <Link href="/signup">Start Your Free Trial Now <ArrowRight className="ml-2 h-4 w-4" /></Link>
                    </Button>
                </div>
            </div>
        </section>
      </main>

      <footer className="w-full border-t">
        <div className="container mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 px-4 py-8 sm:flex-row md:px-6">
            <div className="flex flex-col items-center text-center sm:items-start sm:text-left">
                <Logo />
                <p className="mt-2 text-sm text-muted-foreground">&copy; {new Date().getFullYear()} Dulus Data Dynamics. All rights reserved.</p>
            </div>
            <div className="flex flex-col items-center gap-4 sm:items-end">
              <nav className="flex gap-4 sm:gap-6">
                  <Link href="/terms" className="text-sm text-muted-foreground hover:text-foreground">Terms</Link>
                  <Link href="/privacy" className="text-sm text-muted-foreground hover:text-foreground">Privacy</Link>
                  <a href="https://dulusdatadynamics.netlify.app" target="_blank" rel="noopener noreferrer" className="text-sm text-muted-foreground hover:text-foreground">Website</a>
              </nav>
              <div className="flex gap-4">
                  <a href="https://youtube.com/@dbm_sa?si=2xb6bp08eN_28GuO" target="_blank" rel="noopener noreferrer" aria-label="Youtube" className="text-muted-foreground transition-colors hover:text-foreground">
                      <Youtube className="h-5 w-5" />
                  </a>
                  <a href="https://www.instagram.com/dbm_sa?igsh=b2tpamVtNTg4Nmtk" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="text-muted-foreground transition-colors hover:text-foreground">
                      <Instagram className="h-5 w-5" />
                  </a>
                  <a href="https://www.linkedin.com/in/keshav-dulu-1b65a53b3?utm_source=share_via&utm_content=profile&utm_medium=member_android" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className="text-muted-foreground transition-colors hover:text-foreground">
                      <Linkedin className="h-5 w-5" />
                  </a>
              </div>
            </div>
        </div>
      </footer>
    </div>
  );
}

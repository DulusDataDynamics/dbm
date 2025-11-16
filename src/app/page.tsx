'use client';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/logo';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/hooks/use-auth';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Zap, ClipboardCheck, FileText, Users, Shield, BookUser, Check } from 'lucide-react';

const features = [
    {
        icon: Zap,
        title: 'AI Assistant',
        description: 'Leverage AI to get daily summaries, business insights, and execute commands with natural language.',
    },
    {
        icon: ClipboardCheck,
        title: 'Task Management',
        description: 'Organize, assign, and track tasks to keep your projects on schedule.',
    },
    {
        icon: FileText,
        title: 'Invoice Management',
        description: 'Create, send, and track invoices effortlessly. Get paid faster with automated reminders.',
    },
];

const secondaryFeatures = [
    {
        icon: FileText,
        title: 'Invoice Tracking',
        description: 'Create and manage invoices with ease, and keep track of payments.',
    },
    {
        icon: Users,
        title: 'Client Management',
        description: 'Maintain a complete directory of your clients and their information.',
    },
    {
        icon: Shield,
        title: 'Secure & Private',
        description: 'Built with security in mind, with data protection and privacy at its core.',
    },
    {
        icon: BookUser,
        title: 'Legal Documents',
        description: 'Includes templates for your Privacy Policy and Terms of Service.',
    },
];

const planFeatures = [
    "Unlimited Clients",
    "Unlimited Invoices",
    "AI-Powered Insights",
    "Task & Inventory Management",
    "Email & WhatsApp Support",
];


export default function LandingPage() {
  const { user, initializing } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!initializing && user) {
      router.replace('/dashboard');
    }
  }, [user, initializing, router]);

  if (initializing || user) {
    return null; 
  }

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <header className="sticky top-0 z-50 w-full bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
          <Logo />
          <nav className="flex items-center gap-4">
            <Button variant="ghost" asChild>
                <Link href="/login">Login</Link>
            </Button>
            <Button asChild>
              <Link href="/signup">Get Started</Link>
            </Button>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        <section className="container mx-auto flex flex-col items-center justify-center px-4 py-16 text-center md:px-6 md:py-24 lg:py-32">
            <h1 className="text-4xl font-extrabold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl">
                Streamline Your Business with an AI-Powered Manager
            </h1>
            <p className="mx-auto mt-6 max-w-[700px] text-lg text-muted-foreground md:text-xl">
                DBM helps you manage tasks, invoices, and clients effortlessly. Automate your workflow, get smart insights, and focus on what matters most: growing your business.
            </p>
            <div className="mt-8 flex gap-4">
                <Button size="lg" asChild>
                    <Link href="/signup">Sign Up for Free</Link>
                </Button>
            </div>
        </section>

        <section className="container mx-auto px-4 pb-16 md:px-6 md:pb-24">
             <Image
                src="https://images.unsplash.com/photo-1644088379091-d574269d422f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwyfHxhYnN0cmFjdCUyMHRlY2h8ZW58MHx8fHwxNzYyNzAzMzk2fDA&ixlib=rb-4.1.0&q=80&w=1080"
                alt="Abstract hero image for business software"
                width={1200}
                height={600}
                className="rounded-lg shadow-2xl"
                data-ai-hint="abstract tech"
            />
        </section>

        <section className="container mx-auto flex flex-col items-center justify-center px-4 py-16 text-center md:px-6 md:py-24 lg:py-32">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                The Ultimate Toolkit for Small Business
            </h2>
            <p className="mx-auto mt-6 max-w-[700px] text-lg text-muted-foreground md:text-xl">
                From intelligent automation to comprehensive management, Dulus provides everything you need to succeed.
            </p>
        </section>

        <section className="bg-muted/40 py-16 md:py-24">
            <div className="container mx-auto px-4 md:px-6">
                <div className="text-center mb-12">
                    <p className="font-semibold text-primary">Key Features</p>
                    <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Why Choose Dulus?</h2>
                </div>
                <div className="mx-auto grid max-w-5xl gap-12 md:grid-cols-3 text-center">
                    {features.map((feature) => (
                        <div key={feature.title} className="flex flex-col items-center">
                            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
                               <feature.icon className="h-7 w-7" />
                            </div>
                            <h3 className="mb-2 text-2xl font-bold">{feature.title}</h3>
                            <p className="max-w-md text-muted-foreground">{feature.description}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
        
        <section className="container mx-auto px-4 py-16 md:px-6 md:py-24">
             <div className="mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 text-center">
                {secondaryFeatures.map((feature) => (
                    <div key={feature.title} className="flex flex-col items-center p-4">
                        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                           <feature.icon className="h-6 w-6" />
                        </div>
                        <h3 className="mb-2 text-xl font-bold">{feature.title}</h3>
                        <p className="max-w-md text-muted-foreground text-sm">{feature.description}</p>
                    </div>
                ))}
            </div>
        </section>
        
        <section className="bg-background py-16 md:py-24">
            <div className="container mx-auto flex justify-center px-4 md:px-6">
                <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-8 shadow-2xl shadow-primary/10">
                    <h3 className="text-3xl font-bold">Unlimited Plan</h3>
                    <p className="mt-2 text-muted-foreground">14-day free trial (up to 20 clients + 20 invoices).</p>
                    <div className="my-6">
                        <span className="text-5xl font-extrabold">R349</span>
                        <span className="text-muted-foreground">/month</span>
                    </div>
                    <p className="text-muted-foreground text-sm mb-6">or approx. $20/month</p>
                    <Button size="lg" className="w-full" asChild>
                        <Link href="/signup">Get Started</Link>
                    </Button>
                    <ul className="mt-8 space-y-3 text-foreground/80">
                        {planFeatures.map((text, i) => (
                           <li key={i} className="flex items-center gap-3">
                               <Check className="h-5 w-5 text-green-500" />
                               <span>{text}</span>
                           </li>
                        ))}
                    </ul>
                </div>
            </div>
        </section>

      </main>

      <footer className="w-full bg-background py-6 mt-16 border-t">
        <div className="container mx-auto flex flex-col items-center justify-between gap-4 px-4 text-center md:flex-row md:px-6">
            <p className="text-sm text-muted-foreground">&copy; {new Date().getFullYear()} Dulus Data Dynamics. All rights reserved.</p>
            <div className="flex gap-4">
                <Link href="/terms" className="text-sm text-muted-foreground hover:underline">Terms of Service</Link>
                <Link href="/privacy" className="text-sm text-muted-foreground hover:underline">Privacy Policy</Link>
                 <a href="https://dulusdatadynamics.netlify.app" target="_blank" rel="noopener noreferrer" className="text-sm text-muted-foreground hover:underline">Website</a>
            </div>
        </div>
      </footer>
    </div>
  );
}

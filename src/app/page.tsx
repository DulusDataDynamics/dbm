'use client';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/logo';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/hooks/use-auth';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Zap, ClipboardCheck, FileText } from 'lucide-react';

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
    <div className="flex min-h-screen flex-col bg-[#0B122A] text-white">
      <header className="sticky top-0 z-50 w-full bg-[#0B122A]/80 backdrop-blur-sm">
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
          <p className="font-semibold text-primary">Key Features</p>
          <h1 className="text-4xl font-extrabold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl">
            The Ultimate Toolkit for Small Business
          </h1>
          <p className="mx-auto mt-6 max-w-[700px] text-lg text-gray-300 md:text-xl">
            From intelligent automation to comprehensive management, Dulus provides everything you need to succeed.
          </p>
        </section>

        <section className="container mx-auto px-4 py-16 md:px-6 md:py-24">
            <div className="mx-auto grid max-w-3xl gap-16 text-center">
                {features.map((feature) => (
                    <div key={feature.title} className="flex flex-col items-center">
                        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                           <feature.icon className="h-6 w-6" />
                        </div>
                        <h3 className="mb-2 text-2xl font-bold">{feature.title}</h3>
                        <p className="max-w-md text-gray-400">{feature.description}</p>
                    </div>
                ))}
            </div>
        </section>
      </main>

      <footer className="w-full bg-[#0B122A]/80 py-6">
        <div className="container mx-auto flex flex-col items-center justify-between gap-4 px-4 text-center md:flex-row md:px-6">
            <p className="text-sm text-gray-400">&copy; {new Date().getFullYear()} Dulus Business Manager. All rights reserved.</p>
            <div className="flex gap-4">
                <Link href="/terms" className="text-sm text-gray-400 hover:underline">Terms of Service</Link>
                <Link href="/privacy" className="text-sm text-gray-400 hover:underline">Privacy Policy</Link>
            </div>
        </div>
      </footer>
    </div>
  );
}

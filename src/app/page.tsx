'use client';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/logo';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/hooks/use-auth';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function LandingPage() {
  const { user, initializing } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!initializing && user) {
      router.replace('/dashboard');
    }
  }, [user, initializing, router]);

  // Don't render the landing page if we are still checking for a user
  // or if the user is already logged in.
  if (initializing || user) {
    return null; 
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#0B122A] text-white">
      {/* Header */}
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

      {/* Hero Section */}
      <main className="flex-1">
        <section className="container mx-auto flex flex-col items-center justify-center px-4 py-16 text-center md:px-6 md:py-24 lg:py-32">
          <h1 className="text-4xl font-extrabold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl">
            Streamline Your Business with an AI-Powered Manager
          </h1>
          <p className="mx-auto mt-6 max-w-[700px] text-lg text-gray-300 md:text-xl">
            DBM helps you manage tasks, invoices, and clients effortlessly.
            Automate your workflow, get smart insights, and focus on what matters
            most: growing your business.
          </p>
          <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:gap-6">
            <Button size="lg" asChild>
              <Link href="/signup">Sign Up for Free</Link>
            </Button>
            <Button size="lg" variant="outline" className="border-gray-600 bg-transparent hover:bg-white/10">
              Learn More
            </Button>
          </div>
          <div className="relative mt-12 w-full max-w-4xl">
             <Image
                src="https://picsum.photos/seed/tech-abstract/1200/600"
                alt="Abstract digital network"
                width={1200}
                height={600}
                className="rounded-xl object-cover"
                data-ai-hint="abstract network"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0B122A] to-transparent"></div>
          </div>
        </section>
      </main>

      {/* Footer */}
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

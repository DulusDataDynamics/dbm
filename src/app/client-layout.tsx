'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/firebase';
import { Protected } from '@/components/auth/protected';
import { Logo } from '@/components/logo';
import Link from 'next/link';
import { NAV_LINKS, SUPPORT_LINKS } from '@/lib/constants';
import { UserNav } from '@/components/app/user-nav';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarTrigger,
  SidebarInset,
  SidebarSeparator,
} from '@/components/ui/sidebar';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, isUserLoading } = useAuth();
  
  // Determine if the current page is an auth page (login, signup) or a public page
  const isAuthPage = pathname.startsWith('/login') || pathname.startsWith('/signup');
  const isPublicPage = !pathname.startsWith('/dashboard') && !pathname.startsWith('/clients') && !pathname.startsWith('/invoices') && !pathname.startsWith('/tasks') && !pathname.startsWith('/inventory') && !pathname.startsWith('/reports') && !pathname.startsWith('/settings') && !pathname.startsWith('/support');

  // If it's a public or auth page, render children directly without the main app layout
  if (isUserLoading) {
     return (
        <div className="flex min-h-screen w-full items-center justify-center bg-background">
          <div className="flex flex-col items-center gap-4">
            <Logo />
            <div className="text-center">
                <p className="text-lg font-medium text-foreground">
                    Getting things ready...
                </p>
                <p className="text-sm text-muted-foreground">Please wait a moment while we load the app.</p>
            </div>
          </div>
        </div>
    );
  }

  if (!user && !isPublicPage) {
     return <Protected>{children}</Protected>;
  }

  if (isAuthPage || isPublicPage) {
    return <>{children}</>;
  }


  return (
    <Protected>
      <SidebarProvider>
        <Sidebar collapsible="icon">
          <SidebarHeader>
            <Logo />
          </SidebarHeader>
          <SidebarSeparator />
          <SidebarContent>
            <SidebarMenu>
              {NAV_LINKS.map((link) => (
                <SidebarMenuItem key={link.href}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname.startsWith(link.href)}
                    tooltip={{ children: link.label }}
                  >
                    <Link href={link.href}>
                      <link.icon />
                      <span>{link.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarContent>
          <SidebarFooter className="flex-col !items-stretch">
            <SidebarSeparator />
            <SidebarMenu>
              {SUPPORT_LINKS.map((link) => (
                <SidebarMenuItem key={link.href}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname.startsWith(link.href)}
                    tooltip={{ children: link.label }}
                  >
                    <Link href={link.href}>
                      <link.icon />
                      <span>{link.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarFooter>
        </Sidebar>
        <SidebarInset>
          <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b bg-background/80 px-4 backdrop-blur-sm">
             <div className="flex items-center gap-4">
                <SidebarTrigger />
             </div>
             <div className="flex items-center gap-4">
                <UserNav />
             </div>
          </header>
          <main className="flex-1 p-4 md:p-6 lg:p-8">
            {children}
          </main>
        </SidebarInset>
      </SidebarProvider>
    </Protected>
  );
}

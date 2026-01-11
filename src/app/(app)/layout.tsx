'use client';

import React from 'react';
import { Protected } from '@/components/auth/protected';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { NAV_LINKS, SUPPORT_LINKS } from '@/lib/constants';
import { Logo } from '@/components/logo';
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

function AppClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
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
  );
}


export default function AppLayout({ children }: { children: React.ReactNode }) {
  
  return (
    <Protected>
        <AppClientLayout>
            {children}
        </AppClientLayout>
    </Protected>
  );
}

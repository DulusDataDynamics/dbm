'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/firebase';
import { Protected } from '@/components/auth/protected';
import { Logo } from '@/components/logo';
import Link from 'next/link';
import { MAIN_NAV, TRANSPORT_NAV, SUPPORT_LINKS } from '@/lib/constants';
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
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
} from '@/components/ui/sidebar';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronRight, Truck } from 'lucide-react';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, isUserLoading } = useAuth();

  // Create a list of all protected app routes from the constants.
  const appRoutes = [
    ...MAIN_NAV.map((link) => link.href),
    ...TRANSPORT_NAV.map((link) => link.href),
    ...SUPPORT_LINKS.map((link) => link.href),
  ];

  // Determine the page type based on the current path.
  const isAppPage = appRoutes.some((route) => pathname.startsWith(route)) || pathname.includes('/invoices/');
  const isAuthPage = pathname.startsWith('/login') || pathname.startsWith('/signup');
  const isPrintPage = pathname.endsWith('/print');
  const isPublicPage = !isAppPage && !isAuthPage;

  if (isUserLoading) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Logo />
          <div className="text-center">
            <p className="text-lg font-medium text-foreground">
              Getting things ready...
            </p>
            <p className="text-sm text-muted-foreground">
              Please wait a moment while we load the app.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // If it's a print page, we want a clean view without sidebars or headers.
  if (isPrintPage) {
    return <Protected>{children}</Protected>;
  }

  // If user is not logged in and is trying to access an app page,
  // the Protected component will handle the redirect to the login page.
  if (!user && isAppPage) {
    return <Protected>{children}</Protected>;
  }

  // If it's a public or auth page, render children directly without the main app layout.
  if (isPublicPage || isAuthPage) {
    return <>{children}</>;
  }

  const isTransportActive = TRANSPORT_NAV.some(item => pathname.startsWith(item.href));

  // If the user is logged in, render the main app layout for app pages.
  return (
    <Protected>
      <SidebarProvider>
        <Sidebar collapsible="icon">
          <SidebarHeader>
            <Logo />
          </SidebarHeader>
          <SidebarSeparator />
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>WORKSPACE</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {MAIN_NAV.map((link) => (
                    <SidebarMenuItem key={link.href}>
                      <SidebarMenuButton
                        asChild
                        isActive={pathname === link.href}
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
              </SidebarGroupContent>
            </SidebarGroup>

            <SidebarGroup>
              <SidebarMenu>
                <Collapsible defaultOpen={isTransportActive} className="group/collapsible">
                  <SidebarMenuItem>
                    <CollapsibleTrigger asChild>
                      <SidebarMenuButton tooltip="Transport" isActive={isTransportActive}>
                        <Truck />
                        <span>Transport</span>
                        <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                      </SidebarMenuButton>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <SidebarMenuSub>
                        {TRANSPORT_NAV.map((item) => (
                          <SidebarMenuSubItem key={item.href}>
                            <SidebarMenuSubButton asChild isActive={pathname === item.href}>
                              <Link href={item.href}>
                                <item.icon />
                                <span>{item.label}</span>
                              </Link>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        ))}
                      </SidebarMenuSub>
                    </CollapsibleContent>
                  </SidebarMenuItem>
                </Collapsible>
              </SidebarMenu>
            </SidebarGroup>
          </SidebarContent>
          <SidebarFooter className="flex-col !items-stretch">
            <SidebarSeparator />
            <SidebarMenu>
              {SUPPORT_LINKS.map((link) => (
                <SidebarMenuItem key={link.href}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === link.href}
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
          <main className="flex-1 p-4 md:p-6 lg:p-8">{children}</main>
        </SidebarInset>
      </SidebarProvider>
    </Protected>
  );
}

"use client";

import type { ReactNode } from 'react';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarInset,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { Navigation } from '@/components/navigation';
import { Button } from '@/components/ui/button';
import { Dumbbell, UserCircle } from 'lucide-react';
import Link from 'next/link';

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <SidebarProvider defaultOpen={true}>
      <Sidebar collapsible="icon" className="border-r">
        <SidebarHeader className="p-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <Dumbbell className="h-7 w-7 text-primary" />
            <h1 className="text-xl font-headline font-semibold group-data-[collapsible=icon]:hidden">
              Workout Forge
            </h1>
          </Link>
          <div className="group-data-[collapsible=icon]:hidden">
             <SidebarTrigger />
          </div>
        </SidebarHeader>
        <SidebarContent>
          <Navigation />
        </SidebarContent>
        <SidebarFooter className="p-2">
          <Button variant="ghost" className="w-full justify-start gap-2 group-data-[collapsible=icon]:justify-center">
            <UserCircle size={18} />
            <span className="group-data-[collapsible=icon]:hidden">Profile</span>
          </Button>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b bg-background/80 backdrop-blur-sm px-4 md:px-6 md:hidden">
            <SidebarTrigger />
            <Link href="/" className="flex items-center gap-2 font-semibold">
                <Dumbbell className="h-6 w-6 text-primary" />
                <span>Workout Forge</span>
            </Link>
        </header>
        <main className="flex-1 p-4 md:p-6 lg:p-8">
            {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}

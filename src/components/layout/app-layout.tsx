
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
import { Weight, UserCircle } from 'lucide-react'; // Changed Dumbbell to Weight
import Link from 'next/link';
import { ThemeToggle } from '@/components/ThemeToggle';

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <SidebarProvider defaultOpen={true}>
      <Sidebar collapsible="icon" className="border-r">
        <SidebarHeader className="p-4 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <Weight className="h-7 w-7 text-primary" /> {/* Changed Dumbbell to Weight */}
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
            <span className="group-data-[collapsible=icon]:hidden">Perfil</span>
          </Button>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="sticky top-0 z-10 flex h-14 items-center justify-between gap-4 border-b bg-background/80 backdrop-blur-sm px-4 md:px-6">
            <div className="flex items-center gap-2 md:hidden"> {/* Conteúdo esquerdo do cabeçalho (móvel) */}
                <SidebarTrigger />
                <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
                    <Weight className="h-6 w-6 text-primary" /> {/* Changed Dumbbell to Weight */}
                    <span>Workout Forge</span>
                </Link>
            </div>
            <div className="hidden flex-1 md:block" /> {/* Espaçador para empurrar o ThemeToggle para a direita no desktop */}
            
            <ThemeToggle /> {/* Botão de alternância de tema */}
        </header>
        <main className="flex-1 p-4 md:p-6 lg:p-8">
            {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}

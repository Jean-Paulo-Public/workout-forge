"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from '@/components/ui/sidebar';
import {
  LayoutDashboard,
  PlusSquare,
  LibraryBig,
  BarChart3,
  CalendarClock,
} from 'lucide-react';

const navItems = [
  { href: '/dashboard', label: 'Painel', icon: LayoutDashboard },
  { href: '/builder', label: 'Construtor de Treinos', icon: PlusSquare },
  { href: '/library', label: 'Biblioteca de Treinos', icon: LibraryBig },
  { href: '/progress', label: 'Acompanhamento', icon: BarChart3 },
  { href: '/scheduler', label: 'Agendador', icon: CalendarClock },
];

export function Navigation() {
  const pathname = usePathname();

  return (
    <SidebarMenu>
      {navItems.map((item) => (
        <SidebarMenuItem key={item.href}>
          <SidebarMenuButton
            asChild
            isActive={pathname === item.href || (item.href === "/dashboard" && pathname === "/")}
            tooltip={{ children: item.label, side: 'right', align: 'center' }}
          >
            <Link href={item.href}>
              <item.icon size={18} />
              <span>{item.label}</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  );
}

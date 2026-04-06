'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator } from '@/components/ui/command';
import { LayoutDashboard, Search, Network, Bell, Settings, FileText, User, Building2, Shield } from 'lucide-react';
import { useUIStore } from '@/stores/ui-store';

const PAGES = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Investigations', href: '/investigations', icon: Search },
  { name: 'Network Graph', href: '/network', icon: Network },
  { name: 'Alerts', href: '/alerts', icon: Bell },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export function SearchCommand() {
  const router = useRouter();
  const open = useUIStore((s) => s.commandPaletteOpen);
  const setOpen = useUIStore((s) => s.setCommandPaletteOpen);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setOpen(!open);
      }
    }
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [open, setOpen]);

  function navigate(href: string) {
    router.push(href);
    setOpen(false);
  }

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Search pages, entities, cases..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Pages">
          {PAGES.map((page) => (
            <CommandItem key={page.href} onSelect={() => navigate(page.href)}>
              <page.icon className="mr-2 h-4 w-4" />
              {page.name}
            </CommandItem>
          ))}
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Quick Actions">
          <CommandItem onSelect={() => navigate('/investigations')}>
            <FileText className="mr-2 h-4 w-4" />
            New Investigation
          </CommandItem>
          <CommandItem onSelect={() => navigate('/network')}>
            <Network className="mr-2 h-4 w-4" />
            Explore Network
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}

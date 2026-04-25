'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/components/providers/AuthProvider';
import { signOut } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import {
  LayoutDashboard,
  CheckSquare,
  Calendar,
  Folder,
  BarChart,
  Settings,
  LogOut,
  Wallet,
  Focus,
  BookOpen,
} from 'lucide-react';

const navItems = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Tasks', href: '/tasks', icon: CheckSquare },
  { name: 'Focus', href: '/focus', icon: Focus },
  { name: 'Journal', href: '/journal', icon: BookOpen },
  { name: 'Projects', href: '/projects', icon: Folder },
  { name: 'Finance', href: '/finance', icon: Wallet },
  { name: 'Analytics', href: '/analytics', icon: BarChart },
  { name: 'Settings', href: '/settings', icon: Settings },
];

interface SidebarProps {
  onItemClick?: () => void;
}

export function Sidebar({ onItemClick }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handlePrefetch = (href: string) => {
    router.prefetch(href);
  };

  const handleLinkClick = () => {
    onItemClick?.();
  };

  return (
    <div className="flex h-full w-64 flex-col border-r bg-white dark:bg-slate-950">
      {/* Header */}
      <div className="flex h-16 items-center border-b px-6">
        <Link href="/" className="flex items-center gap-3" onClick={handleLinkClick}>
          <Image
            src="/logo.png"
            alt="Taskpaz"
            width={32}
            height={32}
            className="h-8 w-8 object-contain"
          />
          <span className="text-xl font-bold text-blue-600 italic tracking-tighter">Taskpaz</span>
        </Link>
      </div>

      {/* Nav Links */}
      <nav className="flex-1 space-y-1 overflow-y-auto p-4">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              prefetch={true}
              onMouseEnter={() => handlePrefetch(item.href)}
              onClick={handleLinkClick}
            >
              <span
                className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200 ${isActive
                  ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400'
                  : 'text-slate-700 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
                  }`}
              >
                <item.icon className="h-4 w-4" />
                {item.name}
              </span>
            </Link>
          );
        })}
      </nav>

      <div className="border-t p-4">
        <div className="flex items-center gap-3 mb-4">
          {/* Fallback avatar simply using first letter */}
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-600 font-bold dark:bg-blue-900 dark:text-blue-300">
            {mounted ? (user?.user_metadata?.full_name?.[0] || user?.email?.[0]?.toUpperCase() || 'U') : 'U'}
          </div>
          <div className="overflow-hidden">
            <p className="truncate text-sm font-medium text-slate-900 dark:text-white">
              {mounted ? (user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User') : 'User'}
            </p>
            <p className="truncate text-xs text-slate-500">
              {mounted ? user?.email : ''}
            </p>
          </div>
        </div>
        <Button
          variant="ghost"
          className="w-full justify-start text-red-600 hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-900/20"
          onClick={() => {
            handleLinkClick();
            signOut();
          }}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Log out
        </Button>
      </div>
    </div>
  );
}

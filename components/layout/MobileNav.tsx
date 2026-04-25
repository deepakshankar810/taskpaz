'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, Calendar, Plus, Folder, Wallet, Focus, BookOpen } from 'lucide-react';
import { QuickActionPopup } from './QuickActionPopup';

const mobileItems = [
  { name: 'Home', href: '/', icon: LayoutDashboard },
  { name: 'Focus', href: '/focus', icon: Focus },
  { name: 'Journal', href: '/journal', icon: BookOpen },
  { name: 'Calendar', href: '/tasks?view=calendar', icon: Calendar },
];

export function MobileNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [showQuickActions, setShowQuickActions] = useState(false);

  const handlePrefetch = (href: string) => {
    router.prefetch(href);
  };

  return (
    <>
      <div className="fixed bottom-0 left-0 right-0 z-50 border-t bg-white pb-safe dark:bg-slate-950 md:hidden">
        <div className="flex h-16 items-center justify-around px-2">
          {/* First half of items */}
          {mobileItems.slice(0, 2).map((item) => {
            const isActive = pathname === (item.href.split('?')[0]);

            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex flex-col items-center justify-center p-2 flex-1"
                onMouseEnter={() => handlePrefetch(item.href)}
                onTouchStart={() => handlePrefetch(item.href)}
              >
                <item.icon
                  className={`h-5 w-5 ${isActive ? 'text-blue-600' : 'text-slate-500'}`}
                />
                <span className={`text-[10px] ${isActive ? 'font-medium text-blue-600' : 'text-slate-500'}`}>
                  {item.name}
                </span>
              </Link>
            );
          })}

          {/* Centered Quick Action Button */}
          <div className="flex flex-col items-center justify-center p-2 -mt-8 flex-1">
            <button
              onClick={() => setShowQuickActions(true)}
              className="group relative"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-600 text-white shadow-lg transition-transform hover:scale-110 active:scale-95">
                <Plus className="h-6 w-6" />
              </div>
              <span className="mt-1 block text-[10px] text-slate-500 font-medium">New</span>
            </button>
          </div>

          {/* Second half of items */}
          {mobileItems.slice(2).map((item) => {
            const isActive = pathname === item.href.split('?')[0];

            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex flex-col items-center justify-center p-2 flex-1"
                onMouseEnter={() => handlePrefetch(item.href)}
                onTouchStart={() => handlePrefetch(item.href)}
              >
                <item.icon
                  className={`h-5 w-5 ${isActive ? 'text-blue-600' : 'text-slate-500'}`}
                />
                <span className={`text-[10px] ${isActive ? 'font-medium text-blue-600' : 'text-slate-500'}`}>
                  {item.name}
                </span>
              </Link>
            );
          })}
        </div>
      </div>

      <QuickActionPopup open={showQuickActions} onOpenChange={setShowQuickActions} />
    </>
  );
}

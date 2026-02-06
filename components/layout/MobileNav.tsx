'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, Calendar, Plus } from 'lucide-react';
import { QuickActionPopup } from './QuickActionPopup';

const mobileItems = [
  { name: 'Home', href: '/', icon: LayoutDashboard },
  { name: 'Calendar', href: '/tasks', icon: Calendar },
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
          {mobileItems.map((item) => {
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex flex-col items-center justify-center p-2"
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

          {/* Quick Action Button */}
          <button
            onClick={() => setShowQuickActions(true)}
            className="flex flex-col items-center justify-center p-2"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-600 text-white shadow-lg">
              <Plus className="h-6 w-6" />
            </div>
          </button>
        </div>
      </div>

      <QuickActionPopup open={showQuickActions} onOpenChange={setShowQuickActions} />
    </>
  );
}

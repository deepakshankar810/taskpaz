'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, CheckSquare, Calendar, Plus } from 'lucide-react';

const mobileItems = [
  { name: 'Home', href: '/', icon: LayoutDashboard },
  { name: 'Tasks', href: '/tasks', icon: CheckSquare },
  { name: 'New', href: '/tasks?new=true', icon: Plus, highlight: true },
  { name: 'Calendar', href: '/calendar', icon: Calendar },
];

export function MobileNav() {
  const pathname = usePathname();
  const router = useRouter();

  const handlePrefetch = (href: string) => {
    router.prefetch(href);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t bg-white pb-safe dark:bg-slate-950 md:hidden">
      <div className="flex h-16 items-center justify-around px-2">
        {mobileItems.map((item) => {
          const isActive = pathname === item.href;

          if (item.highlight) {
            return (
              <Link
                key={item.href}
                href={item.href}
                onMouseEnter={() => handlePrefetch(item.href)}
                onTouchStart={() => handlePrefetch(item.href)}
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-600 text-white shadow-lg">
                  <item.icon className="h-6 w-6" />
                </div>
              </Link>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex flex-col items-center justify-center p-2"
              onMouseEnter={() => handlePrefetch(item.href)}
              onTouchStart={() => handlePrefetch(item.href)}
            >
              <item.icon
                className={`h-5 w-5 ${isActive ? 'text-blue-600' : 'text-slate-500'
                  }`}
              />
              <span className={`text-[10px] ${isActive ? 'font-medium text-blue-600' : 'text-slate-500'
                }`}
              >
                {item.name}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

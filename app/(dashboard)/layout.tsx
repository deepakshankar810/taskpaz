'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/components/providers/AuthProvider';
import { Sidebar } from '@/components/layout/Sidebar';
import { TopBar } from '@/components/layout/TopBar';
import { MobileNav } from '@/components/layout/MobileNav';
import { useIsMobile } from '@/hooks/use-mobile';
import { Loader2 } from 'lucide-react';
import { ProjectsProvider } from '@/components/providers/ProjectsProvider';
import { TasksProvider } from '@/components/providers/TasksProvider';
import { FinanceProvider } from '@/components/providers/FinanceProvider';
import { NotificationProvider } from '@/components/providers/NotificationProvider';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const isMobile = useIsMobile();

  // Auto-close sidebar on mobile when navigating
  useEffect(() => {
    if (isMobile) {
      setSidebarOpen(false);
    }
  }, [pathname, isMobile]);

  // Warm up navigation cache for instant feel
  useEffect(() => {
    if (user) {
      router.prefetch('/');
      router.prefetch('/tasks');
      router.prefetch('/projects');
      router.prefetch('/settings');
    }
  }, [user, router]);

  // Protect Dashboard Routes: Redirect only when we are NOT loading and NO user is found
  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth');
    }
  }, [loading, user, router]);

  // While loading auth, we show a subtle loading state for the main content area
  // but we can render the shell structure.
  const showContent = !loading && user;

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-slate-900">
      {/* Desktop Sidebar */}
      {!isMobile && (
        <div className="hidden md:flex">
          <Sidebar />
        </div>
      )}

      {/* Mobile Sidebar */}
      {isMobile && sidebarOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setSidebarOpen(false)}
          />
          <div className="relative w-64">
            <Sidebar onItemClick={() => setSidebarOpen(false)} />
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <TopBar onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
        <main className="flex-1 overflow-auto relative pb-24 md:pb-0">
          <ProjectsProvider>
            <TasksProvider>
              <FinanceProvider>
                <NotificationProvider>
                  {/* Ensure children render instantly within the pre-fetched layout */}
                  <div className="animate-in fade-in duration-300">
                    {children}
                  </div>
                </NotificationProvider>
              </FinanceProvider>
            </TasksProvider>
          </ProjectsProvider>
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      {isMobile && <MobileNav />}
    </div>
  );
}

'use client';

import { Menu, Search, Bell, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useState } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';

interface TopBarProps {
  onMenuClick: () => void;
}

const MOCK_NOTIFICATIONS = [
  { id: 1, title: 'Welcome to Taskpaz!', description: 'Get started by creating your first project.', time: '2m ago', read: false },
  { id: 2, title: 'Task Due Soon', description: '"Update Portfolio" is due tomorrow.', time: '1h ago', read: false },
  { id: 3, title: 'New Feature', description: 'Check out the new Analytics dashboard.', time: '1d ago', read: true },
];

export function TopBar({ onMenuClick }: TopBarProps) {
  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);
  const unreadCount = notifications.filter(n => !n.read).length;

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  return (
    <header className="flex h-16 items-center justify-between border-b bg-white px-4 dark:bg-slate-950 md:px-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={onMenuClick}
        >
          <Menu className="h-5 w-5" />
        </Button>
        <div className="relative hidden md:block w-96">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
          <Input
            type="search"
            placeholder="Search tasks..."
            className="w-full bg-slate-50 pl-9 dark:bg-slate-900 focus-visible:ring-1"
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5 text-slate-500" />
              {unreadCount > 0 && (
                <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white dark:ring-slate-950" />
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-0" align="end">
            <div className="flex items-center justify-between p-4 border-b">
              <h4 className="font-semibold text-sm">Notifications</h4>
              {unreadCount > 0 && (
                <Button variant="ghost" size="sm" className="h-auto text-xs text-blue-500 p-0 hover:bg-transparent" onClick={markAllRead}>
                  Mark all read
                </Button>
              )}
            </div>
            <ScrollArea className="h-[300px]">
              {notifications.length === 0 ? (
                <div className="p-4 text-center text-sm text-slate-500">No notifications.</div>
              ) : (
                <div className="divide-y">
                  {notifications.map(n => (
                    <div key={n.id} className={`p-4 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors ${!n.read ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''}`}>
                      <div className="flex justify-between items-start mb-1">
                        <h5 className={`text-sm ${!n.read ? 'font-semibold text-slate-900 dark:text-slate-100' : 'font-medium text-slate-700 dark:text-slate-300'}`}>
                          {n.title}
                        </h5>
                        <span className="text-[10px] text-slate-400">{n.time}</span>
                      </div>
                      <p className="text-xs text-slate-500 line-clamp-2">{n.description}</p>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </PopoverContent>
        </Popover>
      </div>
    </header>
  );
}

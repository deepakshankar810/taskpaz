'use client';

import React, { createContext, useContext, useEffect, useCallback } from 'react';
import { useAuth } from './AuthProvider';
import { useTasksContext } from './TasksProvider';
import { useFinanceContext } from './FinanceProvider';
import { isToday, differenceInDays } from 'date-fns';

type NotificationContextType = {
    requestPermission: () => Promise<void>;
    sendNotification: (title: string, options?: NotificationOptions) => void;
};

const NotificationContext = createContext<NotificationContextType>({} as NotificationContextType);

export const useNotification = () => useContext(NotificationContext);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
    const { user } = useAuth();
    const { tasks } = useTasksContext();
    const { subscriptions } = useFinanceContext();

    const requestPermission = useCallback(async () => {
        if (!('Notification' in window)) return;
        if (Notification.permission === 'default') {
            await Notification.requestPermission();
        }
    }, []);

    const sendNotification = useCallback((title: string, options?: NotificationOptions) => {
        if (!user?.id) return;

        // Check local storage for browser notification toggle
        const browserNotifsEnabled = localStorage.getItem(`notif_browser_${user.id}`) !== 'false';
        if (!browserNotifsEnabled) return;

        if (Notification.permission === 'granted') {
            new Notification(title, {
                icon: '/favicon.ico', // Fallback to favicon
                ...options,
            });
        }
    }, [user?.id]);

    // Request permission on mount
    useEffect(() => {
        requestPermission();
    }, [requestPermission]);

    // Background monitor for urgent changes or deadlines
    useEffect(() => {
        if (!tasks) return;

        // 1. Urgent Tasks
        const urgentTasks = tasks.filter(t => t.priority === 'urgent' && t.status !== 'completed');
        const lastUrgentId = localStorage.getItem(`last_urgent_${user?.id}`);
        if (urgentTasks.length > 0 && urgentTasks[0].id !== lastUrgentId) {
            sendNotification('High Priority Task', {
                body: `You have an urgent task: ${urgentTasks[0].title}`,
            });
            localStorage.setItem(`last_urgent_${user?.id}`, urgentTasks[0].id);
        }

        // 2. Due Date Near (due today or tomorrow)
        const dueSoonTasks = tasks.filter(t => {
            if (!t.dueDate || t.status === 'completed') return false;
            const daysLeft = differenceInDays(new Date(t.dueDate), new Date());
            return daysLeft >= 0 && daysLeft <= 1;
        });

        const lastDueSoonId = localStorage.getItem(`last_due_soon_${user?.id}`);
        if (dueSoonTasks.length > 0 && dueSoonTasks[0].id !== lastDueSoonId) {
            sendNotification('Task Deadline Approaching', {
                body: `"${dueSoonTasks[0].title}" is due soon!`,
            });
            localStorage.setItem(`last_due_soon_${user?.id}`, dueSoonTasks[0].id);
        }
    }, [tasks, user?.id, sendNotification]);

    // Monitor subscriptions
    useEffect(() => {
        if (!subscriptions) return;

        const billingSoon = subscriptions.filter(s => {
            if (!s.active) return false;
            const daysLeft = differenceInDays(new Date(s.nextBillingDate), new Date());
            return daysLeft >= 0 && daysLeft <= 2;
        });

        const lastSubNotifId = localStorage.getItem(`last_sub_notif_${user?.id}`);
        if (billingSoon.length > 0 && billingSoon[0].id !== lastSubNotifId) {
            sendNotification('Subscription Renewal', {
                body: `${billingSoon[0].name} is due for billing in ${differenceInDays(new Date(billingSoon[0].nextBillingDate), new Date())} days.`,
            });
            localStorage.setItem(`last_sub_notif_${user?.id}`, billingSoon[0].id);
        }
    }, [subscriptions, user?.id, sendNotification]);

    return (
        <NotificationContext.Provider value={{ requestPermission, sendNotification }}>
            {children}
        </NotificationContext.Provider>
    );
}

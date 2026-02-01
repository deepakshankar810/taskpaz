import { useState, useEffect, useMemo } from 'react';
import {
    collection,
    query,
    where,
    orderBy,
    onSnapshot,
    Timestamp,
    type Unsubscribe
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Task, TaskStatus, TaskPriority, TaskCategory } from '@/lib/types';

// Helper to match `docToTask` in lib/db/tasks.ts but safely inside the hook
const docToTask = (docSnap: any): Task => {
    const data = docSnap.data();
    // Safe robust fallback
    return {
        id: docSnap.id,
        ...data,
        // Convert Timestamps to Dates safely
        createdAt: data.createdAt?.toDate?.() || new Date(),
        updatedAt: data.updatedAt?.toDate?.() || new Date(),
        dueDate: data.dueDate?.toDate?.() || undefined,
        completedAt: data.completedAt?.toDate?.() || undefined,
    } as Task;
};

export function useTasks(userId: string | undefined | null) {
    const [tasks, setTasks] = useState<Task[]>(() => {
        // Instant load from cache
        if (typeof window !== 'undefined' && userId) {
            const cached = localStorage.getItem(`tasks_${userId}`);
            if (cached) {
                try {
                    const parsed = JSON.parse(cached);
                    // Convert date strings back to Date objects
                    return parsed.map((t: any) => ({
                        ...t,
                        createdAt: new Date(t.createdAt),
                        updatedAt: new Date(t.updatedAt),
                        dueDate: t.dueDate ? new Date(t.dueDate) : undefined,
                        completedAt: t.completedAt ? new Date(t.completedAt) : undefined,
                    }));
                } catch (e) {
                    return [];
                }
            }
        }
        return [];
    });
    const [loading, setLoading] = useState(!tasks.length);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        if (!userId) {
            setLoading(false);
            setTasks([]);
            return;
        }

        // 1. Try to load from cache IMMEDIATELY when we have a userId
        // This covers the case where the hook mounted before auth was ready
        const cached = localStorage.getItem(`tasks_${userId}`);
        if (cached) {
            try {
                const parsed = JSON.parse(cached);
                if (parsed && parsed.length > 0) {
                    const hydrated = parsed.map((t: any) => ({
                        ...t,
                        createdAt: new Date(t.createdAt),
                        updatedAt: new Date(t.updatedAt),
                        dueDate: t.dueDate ? new Date(t.dueDate) : undefined,
                        completedAt: t.completedAt ? new Date(t.completedAt) : undefined,
                    }));
                    setTasks(hydrated);
                    setLoading(false); // Show content immediately
                }
            } catch (e) {
                // Ignore cache errors
            }
        } else {
            setLoading(true);
        }

        // Create query
        const tasksRef = collection(db, 'tasks');
        const q = query(
            tasksRef,
            where('userId', '==', userId),
            // We do NOT add orderBy here initially to avoid "requires index" errors 
            // that might crash the app. We sort in memory.
            // If you are sure you have the index, you can add: orderBy('createdAt', 'desc')
        );

        let unsubscribe: Unsubscribe;

        try {
            unsubscribe = onSnapshot(q, {
                next: (snapshot) => {
                    const userTasks = snapshot.docs.map(docToTask);

                    // Sort in memory to be safe and fast
                    userTasks.sort((a, b) => {
                        const timeA = a.createdAt?.getTime() || 0;
                        const timeB = b.createdAt?.getTime() || 0;
                        return timeB - timeA; // Newest first
                    });

                    setTasks(userTasks);

                    // Update cache
                    if (userId) {
                        localStorage.setItem(`tasks_${userId}`, JSON.stringify(userTasks));
                    }

                    setLoading(false);
                    setError(null);
                },
                error: (err) => {
                    console.error('[useTasks] Snapshot error:', err);
                    // Don't wipe data on error if we had some; graceful degradation
                    // If "client offline" error happens, onSnapshot usually handles it by using cache
                    // effectively suppressing the explicit error for the user.
                    // However, if we do get a real error (permission etc), we set it.
                    if (err.code !== 'unavailable') {
                        setError(err);
                    }
                    setLoading(false);
                }
            });
        } catch (err: any) {
            console.error('[useTasks] Error setting up listener:', err);
            setError(err);
            setLoading(false);
        }

        return () => {
            if (unsubscribe) unsubscribe();
        };
    }, [userId]);

    // Optimistic state
    const [optimisticTasks, setOptimisticTasks] = useState<Task[]>([]);
    const [optimisticUpdates, setOptimisticUpdates] = useState<Record<string, Partial<Task>>>({});

    const addOptimisticTask = (task: Task) => {
        setOptimisticTasks(prev => [task, ...prev]);
    };

    const removeOptimisticTask = (taskId: string) => {
        setOptimisticTasks(prev => prev.filter(t => t.id !== taskId));
    };

    const optimisticUpdateTask = (taskId: string, updates: Partial<Task>) => {
        setOptimisticUpdates(prev => ({
            ...prev,
            [taskId]: { ...(prev[taskId] || {}), ...updates }
        }));
    };

    // Derived state: Combined and sorted tasks
    const allTasks = useMemo(() => {
        const combined = [...optimisticTasks, ...tasks];
        // Filter out any duplicates if a task moved from optimistic to server
        const unique = combined.filter((task, index, self) =>
            index === self.findIndex((t) => t.id === task.id)
        );

        // Apply optimistic updates
        const updated = unique.map(task => {
            if (optimisticUpdates[task.id]) {
                return { ...task, ...optimisticUpdates[task.id] };
            }
            return task;
        });

        return updated.sort((a, b) => {
            const timeA = a.createdAt instanceof Date ? a.createdAt.getTime() : new Date(a.createdAt).getTime();
            const timeB = b.createdAt instanceof Date ? b.createdAt.getTime() : new Date(b.createdAt).getTime();
            return (timeB || 0) - (timeA || 0);
        });
    }, [tasks, optimisticTasks, optimisticUpdates]);

    // Derived state: Statistics
    const stats = useMemo(() => {
        const s = {
            total: allTasks.length,
            completed: 0,
            pending: 0,
            inProgress: 0,
            byCategory: {} as Record<string, number>,
            byPriority: {} as Record<string, number>,
        };

        allTasks.forEach(task => {
            if (task.status === 'completed') s.completed++;
            if (task.status === 'pending') s.pending++;
            if (task.status === 'in-progress') s.inProgress++;

            const cat = task.category || 'uncategorized';
            s.byCategory[cat] = (s.byCategory[cat] || 0) + 1;

            const prio = task.priority || 'medium';
            s.byPriority[prio] = (s.byPriority[prio] || 0) + 1;
        });

        return s;
    }, [allTasks]);

    return { tasks: allTasks, stats, loading, error, addOptimisticTask, removeOptimisticTask, optimisticUpdateTask };
}

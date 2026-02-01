import { useState, useEffect, useMemo } from 'react';
import {
    collection,
    query,
    where,
    onSnapshot,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Task } from '@/lib/types';
import { updateTask, deleteTask } from '@/lib/db/tasks';

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
    const [userProfile, setUserProfile] = useState<any>(null);

    // Fetch user profile to check preferences
    useEffect(() => {
        if (!userId) return;
        import('@/lib/auth').then(({ getUserProfile }) => {
            getUserProfile(userId).then(setUserProfile);
        });
    }, [userId]);

    useEffect(() => {
        if (!userId) {
            setTasks([]);
            setLoading(false);
            return;
        }

        setLoading(true);
        setError(null);

        // Tasks are in a top-level 'tasks' collection, filtered by userId
        const q = query(
            collection(db, 'tasks'),
            where('userId', '==', userId)
        );

        const unsubscribe = onSnapshot(q, {
            next: (snapshot) => {
                const userTasks = snapshot.docs.map(doc => docToTask(doc));

                // Sort in memory to avoid needing a composite index for where+orderBy
                userTasks.sort((a, b) => {
                    const timeA = a.createdAt instanceof Date ? a.createdAt.getTime() : new Date(a.createdAt).getTime();
                    const timeB = b.createdAt instanceof Date ? b.createdAt.getTime() : new Date(b.createdAt).getTime();
                    return (timeB || 0) - (timeA || 0);
                });

                if (typeof window !== 'undefined') {
                    localStorage.setItem(`tasks_${userId}`, JSON.stringify(userTasks));
                }

                setTasks(userTasks);
                setLoading(false);
                setError(null);
            },
            error: (err) => {
                console.error('Error fetching tasks:', err);
                setError(new Error('Failed to load tasks.'));
                setLoading(false);
            }
        });

        return () => unsubscribe();
    }, [userId]);

    // Optimistic state
    const [optimisticTasks, setOptimisticTasks] = useState<Task[]>([]);
    const [optimisticUpdates, setOptimisticUpdates] = useState<Record<string, Partial<Task>>>({});

    const addOptimisticTask = (task: Task) => {
        setOptimisticTasks(prev => [task, ...prev]);
    };

    const removeOptimisticTask = (taskId: string) => {
        setOptimisticTasks(prev => prev.filter(t => t.id !== taskId));
        deleteTask(taskId).catch(err => {
            console.error("Failed to delete task", err);
        });
    };

    const optimisticUpdateTask = (taskId: string, updates: Partial<Task>) => {
        setOptimisticUpdates(prev => ({
            ...prev,
            [taskId]: { ...(prev[taskId] || {}), ...updates }
        }));

        updateTask(taskId, updates).catch(err => {
            console.error("Failed to update task", err);
        });
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

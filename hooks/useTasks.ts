import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import type { Task } from '@/lib/types';
import { updateTask, deleteTask } from '@/lib/db/tasks';

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
            setTasks([]);
            setLoading(false);
            return;
        }

        const fetchTasks = async () => {
            if (!tasks.length) setLoading(true);

            const { data, error: err } = await supabase
                .from('tasks')
                .select('*')
                .eq('user_id', userId)
                .order('created_at', { ascending: false });

            if (err) {
                console.error('Error fetching tasks:', err);
                setError(new Error('Failed to load tasks.'));
            } else {
                const userTasks = data.map(task => ({
                    id: task.id,
                    userId: task.user_id,
                    title: task.title,
                    description: task.description,
                    status: task.status,
                    priority: task.priority,
                    category: task.category,
                    dueDate: task.due_date ? new Date(task.due_date) : undefined,
                    projectId: task.project_id,
                    completedAt: task.completed_at ? new Date(task.completed_at) : undefined,
                    createdAt: new Date(task.created_at),
                    updatedAt: new Date(task.updated_at),
                } as Task));

                if (typeof window !== 'undefined') {
                    localStorage.setItem(`tasks_${userId}`, JSON.stringify(userTasks));
                }
                setTasks(userTasks);
            }
            setLoading(false);
        };

        fetchTasks();

        // Real-time incremental updates
        const channel = supabase
            .channel(`tasks_${userId}`)
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'tasks',
                    filter: `user_id=eq.${userId}`,
                },
                (payload) => {
                    if (payload.eventType === 'INSERT') {
                        const newTask = {
                            id: payload.new.id,
                            userId: payload.new.user_id,
                            title: payload.new.title,
                            description: payload.new.description,
                            status: payload.new.status,
                            priority: payload.new.priority,
                            category: payload.new.category,
                            dueDate: payload.new.due_date ? new Date(payload.new.due_date) : undefined,
                            projectId: payload.new.project_id,
                            completedAt: payload.new.completed_at ? new Date(payload.new.completed_at) : undefined,
                            createdAt: new Date(payload.new.created_at),
                            updatedAt: new Date(payload.new.updated_at),
                        } as Task;
                        setTasks(prev => [newTask, ...prev]);
                    } else if (payload.eventType === 'UPDATE') {
                        setTasks(prev => prev.map(t => t.id === payload.new.id ? {
                            ...t,
                            title: payload.new.title,
                            description: payload.new.description,
                            status: payload.new.status,
                            priority: payload.new.priority,
                            category: payload.new.category,
                            dueDate: payload.new.due_date ? new Date(payload.new.due_date) : undefined,
                            projectId: payload.new.project_id,
                            completedAt: payload.new.completed_at ? new Date(payload.new.completed_at) : undefined,
                            updatedAt: new Date(payload.new.updated_at),
                        } : t));
                    } else if (payload.eventType === 'DELETE') {
                        setTasks(prev => prev.filter(t => t.id === payload.old.id));
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
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
            // 1. Status priority: Active (pending/in-progress) first, then Completed
            const isAActive = a.status !== 'completed';
            const isBActive = b.status !== 'completed';

            if (isAActive && !isBActive) return -1;
            if (!isAActive && isBActive) return 1;

            if (isAActive && isBActive) {
                // 2. Both active: sort by due date (closest first)
                if (a.dueDate && b.dueDate) {
                    return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
                }
                if (a.dueDate) return -1;
                if (b.dueDate) return 1;
                // Fallback to createdAt
                return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
            } else {
                // 3. Both completed: sort by updatedAt or completedAt (most recent first)
                const timeA = a.completedAt ? new Date(a.completedAt).getTime() : new Date(a.updatedAt).getTime();
                const timeB = b.completedAt ? new Date(b.completedAt).getTime() : new Date(b.updatedAt).getTime();
                return (timeB || 0) - (timeA || 0);
            }
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

'use client';

import { createContext, useContext, ReactNode, useMemo } from 'react';
import { useAuth } from '@/components/providers/AuthProvider';
import { useTasks } from '@/hooks/useTasks';
import { Task } from '@/lib/types';

interface TasksContextType {
    tasks: Task[];
    stats: {
        total: number;
        completed: number;
        pending: number;
        inProgress: number;
        byCategory: Record<string, number>;
        byPriority: Record<string, number>;
    };
    loading: boolean;
    error: Error | null;
    addOptimisticTask: (task: Task) => void;
    removeOptimisticTask: (taskId: string) => void;
}

const TasksContext = createContext<TasksContextType | undefined>(undefined);

export function TasksProvider({ children }: { children: ReactNode }) {
    const { user } = useAuth();
    const tasksData = useTasks(user?.uid);

    return (
        <TasksContext.Provider value={tasksData}>
            {children}
        </TasksContext.Provider>
    );
}

export function useTasksContext() {
    const context = useContext(TasksContext);
    if (context === undefined) {
        throw new Error('useTasksContext must be used within a TasksProvider');
    }
    return context;
}

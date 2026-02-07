'use client';

import { createContext, useContext, ReactNode, useCallback } from 'react';
import { useAuth } from '@/components/providers/AuthProvider';
import { useProjects as useProjectsHook } from '@/hooks/useProjects';
import { Project } from '@/lib/types';
import { updateProject } from '@/lib/db/projects';

interface ProjectsContextType {
    projects: Project[];
    loading: boolean;
    error: Error | null;
    addOptimisticProject: (project: Project) => void;
    removeOptimisticProject: (projectId: string) => void;
    optimisticUpdateProject: (projectId: string, data: Partial<Project>) => void;
}

const ProjectsContext = createContext<ProjectsContextType>({
    projects: [],
    loading: true,
    error: null,
    addOptimisticProject: () => { },
    removeOptimisticProject: () => { },
    optimisticUpdateProject: () => { },
});

export function ProjectsProvider({ children }: { children: ReactNode }) {
    const { user } = useAuth();
    // Lift the hook up here so it runs once per session/user
    const { projects, loading, error, setProjectsOptimistic } = useProjectsHook(user?.id);

    // Optimistic creation
    const addOptimisticProject = useCallback((project: Project) => {
        if (!user?.id) return;
        setProjectsOptimistic((prev: Project[]) => {
            const updated = [project, ...prev];
            localStorage.setItem(`projects_${user.id}`, JSON.stringify(updated));
            return updated;
        });
    }, [user?.id, setProjectsOptimistic]);

    // Optimistic deletion
    const removeOptimisticProject = useCallback((projectId: string) => {
        if (!user?.id) return;
        setProjectsOptimistic((prev: Project[]) => {
            const updated = prev.filter(p => p.id !== projectId);
            localStorage.setItem(`projects_${user.id}`, JSON.stringify(updated));
            return updated;
        });
    }, [user?.id, setProjectsOptimistic]);

    // Optimistic update: immediately update local state & cache, fire Firestore in background
    const optimisticUpdateProject = useCallback((projectId: string, data: Partial<Project>) => {
        if (!user?.id) return;

        // 1. Immediately update local state
        setProjectsOptimistic((prev: Project[]) => {
            const updated = prev.map(p =>
                p.id === projectId
                    ? { ...p, ...data, updatedAt: new Date() }
                    : p
            );
            // 2. Immediately update localStorage cache
            localStorage.setItem(`projects_${user.id}`, JSON.stringify(updated));
            return updated;
        });

        // 3. Fire Firestore update in background (fire-and-forget)
        updateProject(projectId, data).catch(err => {
            console.error('Background save failed:', err);
            // Could add toast notification here for error recovery
        });
    }, [user?.id, setProjectsOptimistic]);

    return (
        <ProjectsContext.Provider value={{
            projects,
            loading,
            error,
            addOptimisticProject,
            removeOptimisticProject,
            optimisticUpdateProject
        }}>
            {children}
        </ProjectsContext.Provider>
    );
}

export function useProjectsContext() {
    return useContext(ProjectsContext);
}

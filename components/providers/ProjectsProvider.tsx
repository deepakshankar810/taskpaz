'use client';

import { createContext, useContext, ReactNode } from 'react';
import { useAuth } from '@/components/providers/AuthProvider';
import { useProjects as useProjectsHook } from '@/hooks/useProjects';
import { Project } from '@/lib/types';

interface ProjectsContextType {
    projects: Project[];
    loading: boolean;
    error: Error | null;
}

const ProjectsContext = createContext<ProjectsContextType>({
    projects: [],
    loading: true,
    error: null,
});

export function ProjectsProvider({ children }: { children: ReactNode }) {
    const { user } = useAuth();
    // Lift the hook up here so it runs once per session/user
    const { projects, loading, error } = useProjectsHook(user?.uid);

    return (
        <ProjectsContext.Provider value={{ projects, loading, error }}>
            {children}
        </ProjectsContext.Provider>
    );
}

export function useProjectsContext() {
    return useContext(ProjectsContext);
}

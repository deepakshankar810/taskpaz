'use client';

import { useState, useEffect, Dispatch, SetStateAction } from 'react';
import { supabase } from '@/lib/supabase';
import { Project } from '@/lib/types';

export function useProjects(userId: string | undefined) {
    const [projects, setProjects] = useState<Project[]>(() => {
        // Instant load from cache if available
        if (typeof window !== 'undefined' && userId) {
            const cached = localStorage.getItem(`projects_${userId}`);
            if (cached) {
                try {
                    return JSON.parse(cached);
                } catch (e) {
                    return [];
                }
            }
        }
        return [];
    });
    const [loading, setLoading] = useState(!projects.length);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        if (!userId) {
            setProjects([]);
            setLoading(false);
            return;
        }

        const fetchProjects = async () => {
            const { data, error: err } = await supabase
                .from('projects')
                .select('*')
                .eq('user_id', userId)
                .order('updated_at', { ascending: false });

            if (err) {
                console.error('Error fetching projects:', err);
                setError(err);
            } else {
                const userProjects = data.map(project => ({
                    id: project.id,
                    userId: project.user_id,
                    name: project.name,
                    description: project.description,
                    content: project.content,
                    color: project.color,
                    createdAt: new Date(project.created_at),
                    updatedAt: new Date(project.updated_at),
                } as Project));

                setProjects(userProjects);
                // Update cache for next instant load
                localStorage.setItem(`projects_${userId}`, JSON.stringify(userProjects));
            }
            setLoading(false);
        };

        fetchProjects();

        // Real-time incremental updates
        const channel = supabase
            .channel(`projects_${userId}`)
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'projects',
                    filter: `user_id=eq.${userId}`,
                },
                (payload) => {
                    if (payload.eventType === 'INSERT') {
                        const newProject = {
                            id: payload.new.id,
                            userId: payload.new.user_id,
                            name: payload.new.name,
                            description: payload.new.description,
                            content: payload.new.content,
                            color: payload.new.color,
                            createdAt: new Date(payload.new.created_at),
                            updatedAt: new Date(payload.new.updated_at),
                        } as Project;
                        setProjects(prev => [newProject, ...prev]);
                    } else if (payload.eventType === 'UPDATE') {
                        setProjects(prev => prev.map(p => p.id === payload.new.id ? {
                            ...p,
                            name: payload.new.name,
                            description: payload.new.description,
                            content: payload.new.content,
                            color: payload.new.color,
                            updatedAt: new Date(payload.new.updated_at),
                        } : p));
                    } else if (payload.eventType === 'DELETE') {
                        setProjects(prev => prev.filter(p => p.id === payload.old.id));
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [userId]);

    return {
        projects,
        loading,
        error,
        // Expose setter for optimistic updates
        setProjectsOptimistic: setProjects as Dispatch<SetStateAction<Project[]>>
    };
}

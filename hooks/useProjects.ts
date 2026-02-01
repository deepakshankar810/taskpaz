'use client';

import { useState, useEffect, Dispatch, SetStateAction } from 'react';
import {
    collection,
    query,
    where,
    onSnapshot,
    orderBy
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Project } from '@/lib/types';
import { docToProject } from '@/lib/db/projects';

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

        // 1. Try to load from cache IMMEDIATELY when we have a userId
        // This covers the case where the hook mounted before auth was ready
        const cached = localStorage.getItem(`projects_${userId}`);
        if (cached) {
            try {
                const parsed = JSON.parse(cached);
                if (parsed && parsed.length > 0) {
                    setProjects(parsed);
                    setLoading(false); // Show content immediately
                }
            } catch (e) {
                // Ignore cache errors
            }
        }

        const q = query(
            collection(db, 'projects'),
            where('userId', '==', userId),
            orderBy('createdAt', 'desc')
        );

        const unsubscribe = onSnapshot(q, {
            next: (snapshot) => {
                const userProjects = snapshot.docs.map(docToProject);
                setProjects(userProjects);

                // Update cache for next instant load
                localStorage.setItem(`projects_${userId}`, JSON.stringify(userProjects));

                setLoading(false);
                setError(null);
            },
            error: (err) => {
                console.error('Error fetching projects:', err);
                // Handle offline graceful degradation
                if (err.code !== 'unavailable') {
                    setError(err);
                }
                setLoading(false);
            }
        });

        return () => unsubscribe();
    }, [userId]);

    return {
        projects,
        loading,
        error,
        // Expose setter for optimistic updates
        setProjectsOptimistic: setProjects as Dispatch<SetStateAction<Project[]>>
    };
}

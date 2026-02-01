'use client';

import { use, useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import { useProjectsContext } from '@/components/providers/ProjectsProvider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ChevronLeft, Pencil, X } from 'lucide-react';
import Link from 'next/link';

// Lazy-load the heavy Editor component
const Editor = dynamic(() => import('@/components/editor/Editor'), {
    ssr: false,
    loading: () => <div className="h-full flex items-center justify-center p-12">
        <div className="space-y-4 w-full max-w-2xl">
            <div className="h-8 bg-slate-100 dark:bg-slate-800 animate-pulse rounded w-1/2" />
            <div className="h-4 bg-slate-50 dark:bg-slate-900 animate-pulse rounded w-full" />
            <div className="h-4 bg-slate-50 dark:bg-slate-900 animate-pulse rounded w-3/4" />
        </div>
    </div>
});

export default function ProjectPage({ params }: { params: any }) {
    const { id } = use(params) as { id: string };
    const { projects, loading, optimisticUpdateProject } = useProjectsContext();
    const project = projects.find(p => p.id === id);

    const [isEditing, setIsEditing] = useState(false);
    const [name, setName] = useState('');
    const [content, setContent] = useState('');
    const [color, setColor] = useState('');

    // Track what we've already saved to avoid duplicate saves
    const lastSavedState = useRef({ name: '', content: '' });
    // Track if we have pending changes for UI feedback
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

    useEffect(() => {
        if (project && !isEditing) {
            setName(project.name);
            setContent(project.content || project.description || '');
            setColor(project.color);
            lastSavedState.current = {
                name: project.name,
                content: project.content || project.description || ''
            };
            setHasUnsavedChanges(false);
        }
    }, [project, isEditing]);

    // Track unsaved changes for UI feedback
    useEffect(() => {
        if (!isEditing) return;
        const hasChanges = name !== lastSavedState.current.name || content !== lastSavedState.current.content;
        setHasUnsavedChanges(hasChanges);
    }, [name, content, isEditing]);

    // We don't block on 'loading' anymore because we have instant-load cache
    if (!project && loading) return (
        <div className="space-y-6 animate-pulse p-4">
            <div className="flex items-center gap-4">
                <div className="h-10 w-10 bg-slate-200 dark:bg-slate-800 rounded" />
                <div className="h-8 w-64 bg-slate-200 dark:bg-slate-800 rounded" />
            </div>
            <div className="h-[500px] w-full bg-slate-100 dark:bg-slate-900 rounded-lg" />
        </div>
    );

    if (!project) return (
        <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
            <h1 className="text-2xl font-bold">Project not found</h1>
            <Link href="/projects">
                <Button>Back to Projects</Button>
            </Link>
        </div>
    );

    // ULTRA-FAST Auto-save: Fire-and-forget with short debounce
    useEffect(() => {
        if (!project || !isEditing) return;

        // Skip if nothing changed
        if (name === lastSavedState.current.name && content === lastSavedState.current.content) return;

        // Short debounce - just enough to batch rapid keystrokes
        const timer = setTimeout(() => {
            if (name === lastSavedState.current.name && content === lastSavedState.current.content) return;

            // INSTANT: Update local state + cache, fire Firestore in background
            optimisticUpdateProject(id, { name, content, color });
            lastSavedState.current = { name, content };
            setHasUnsavedChanges(false);
        }, 500); // 500ms debounce - fast but avoids saving on every keystroke

        return () => clearTimeout(timer);
    }, [name, content, color, id, project, isEditing, optimisticUpdateProject]);

    const handleFinishEditing = () => {
        // Instant - no waiting
        setIsEditing(false);

        // Save any remaining changes immediately (fire-and-forget)
        if (name !== lastSavedState.current.name || content !== lastSavedState.current.content) {
            optimisticUpdateProject(id, { name, content, color });
            lastSavedState.current = { name, content };
        }
        setHasUnsavedChanges(false);
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/projects">
                        <Button variant="ghost" size="icon">
                            <ChevronLeft className="h-5 w-5" />
                        </Button>
                    </Link>
                    <div
                        className="h-4 w-4 rounded-full"
                        style={{ backgroundColor: project.color }}
                    />
                    {isEditing ? (
                        <Input
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="text-xl font-bold h-9 w-64 border-indigo-200 focus:border-indigo-500"
                            placeholder="Project Name"
                        />
                    ) : (
                        <h1 className="text-2xl font-bold">{project.name}</h1>
                    )}
                </div>

                <div className="flex items-center gap-2">
                    <div className="text-xs text-slate-400 mr-2 italic">
                        {hasUnsavedChanges ? 'Typing...' : 'Saved'}
                    </div>
                    {isEditing ? (
                        <Button onClick={handleFinishEditing} className="bg-indigo-600 hover:bg-indigo-700">
                            <X className="mr-2 h-4 w-4" /> Stop Editing
                        </Button>
                    ) : (
                        <Button variant="outline" onClick={() => setIsEditing(true)}>
                            <Pencil className="mr-2 h-4 w-4" /> Edit Content
                        </Button>
                    )}
                </div>
            </div>

            <div className="bg-white dark:bg-slate-950 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm min-h-[600px] flex flex-col">
                <Editor
                    content={content}
                    onChange={setContent}
                    editable={isEditing}
                />
            </div>
        </div>
    );
}


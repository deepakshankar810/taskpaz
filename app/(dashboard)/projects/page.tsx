'use client';

import { useState } from 'react';
import { useAuth } from '@/components/providers/AuthProvider';
import { useProjectsContext } from '@/components/providers/ProjectsProvider';
import { createProject, deleteProject } from '@/lib/db/projects';
import { CreateProjectInput } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Folder, Trash2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ProjectForm } from '@/components/project/ProjectForm';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { toDate } from '@/lib/utils';

export default function ProjectsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const { projects, loading } = useProjectsContext();
  const [isNewProjectOpen, setIsNewProjectOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleCreateProject = (data: CreateProjectInput) => {
    if (!user) return;

    setIsSaving(true);
    setIsNewProjectOpen(false);
    toast.success('Project created');

    createProject(user.id, data)
      .catch((err) => {
        console.error(err);
        toast.error('Failed to sync project to server');
      })
      .finally(() => {
        setIsSaving(false);
      });
  };

  const handleDeleteProject = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this project?')) return;

    toast.success('Project deleted');
    deleteProject(id).catch(() => {
      toast.error('Failed to delete project');
    });
  };

  return (
    <div className="space-y-10 p-6 md:p-10 lg:p-14">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Projects</h1>
        <Dialog open={isNewProjectOpen} onOpenChange={setIsNewProjectOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> New Project
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Project</DialogTitle>
            </DialogHeader>
            <ProjectForm onSubmit={handleCreateProject} isLoading={isSaving} />
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          <>
            <Skeleton className="h-40 w-full" />
            <Skeleton className="h-40 w-full" />
            <Skeleton className="h-40 w-full" />
          </>
        ) : projects.length === 0 ? (
          <div className="col-span-full">
            <Card className="border-dashed flex flex-col items-center justify-center p-8 text-center bg-slate-50/50 dark:bg-slate-900/50">
              <div className="h-12 w-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
                <Folder className="h-6 w-6 text-slate-400" />
              </div>
              <CardTitle className="text-lg">No Projects Yet</CardTitle>
              <CardDescription className="max-w-[200px] mt-2 mb-4">
                Groups your tasks into projects to stay organized.
              </CardDescription>
              <Button variant="outline" size="sm" onClick={() => setIsNewProjectOpen(true)}>
                Create First Project
              </Button>
            </Card>
          </div>
        ) : (
          projects.map(project => (
            <Card
              key={project.id}
              className="hover:shadow-md transition-shadow group relative cursor-pointer h-full"
              onClick={() => router.push(`/projects/${project.id}`)}
            >
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="h-3 w-12 rounded-full mb-2" style={{ backgroundColor: project.color }} />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-slate-400 opacity-0 group-hover:opacity-100 hover:text-red-500 transition-opacity"
                    onClick={(e) => handleDeleteProject(project.id, e)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <CardTitle className="truncate">{project.name}</CardTitle>
                {project.content ? (
                  <div
                    className="text-sm text-muted-foreground line-clamp-3 prose dark:prose-invert prose-sm"
                    dangerouslySetInnerHTML={{
                      __html: project.content
                    }}
                  />
                ) : (
                  project.description && <CardDescription className="line-clamp-2">{project.description}</CardDescription>
                )}
              </CardHeader>
              <CardFooter className="pt-0">
                <div className="text-xs text-slate-400">
                  Created {toDate(project.createdAt)?.toLocaleDateString() || 'Recently'}
                </div>
              </CardFooter>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}

'use client';

import { Task } from '@/lib/types';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock, Tag, Trash2, CheckCircle, Pencil, ListTodo, Timer, RepeatIcon, Link as LinkIcon, AlertTriangle, Users } from 'lucide-react';
import { PriorityBadge } from './PriorityBadge';
import { CategoryBadge } from './CategoryBadge';
import { Badge } from '@/components/ui/badge';
import { useTasksContext } from '@/components/providers/TasksProvider';
import { CollaboratorModal } from './CollaboratorModal';
import { useState } from 'react';

interface TaskCardProps {
  task: Task;
  onComplete?: () => void;
  onDelete?: () => void;
  onEdit?: () => void;
}

export function TaskCard({ task, onComplete, onDelete, onEdit }: TaskCardProps) {
  const { tasks } = useTasksContext();
  const [isShareOpen, setIsShareOpen] = useState(false);

  // Check if blocked by other tasks
  const blockedBy = tasks.filter(t => task.dependencies?.includes(t.id) && t.status !== 'completed');
  const isBlocked = blockedBy.length > 0;

  return (
    <>
      <Card className={`group hover:shadow-xl transition-all duration-300 border-l-4 ${
        task.priority === 'urgent' ? 'border-l-red-500' : 
        task.priority === 'high' ? 'border-l-orange-500' : 
        task.priority === 'medium' ? 'border-l-blue-500' : 'border-l-slate-300'
      }`}>
        <CardContent className="p-5 space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1.5 flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <PriorityBadge priority={task.priority} />
                <CategoryBadge category={task.category} />
                {isBlocked && (
                  <Badge variant="destructive" className="h-5 px-1.5 gap-1 text-[10px] animate-pulse">
                    <AlertTriangle className="h-3 w-3" />
                    Blocked
                  </Badge>
                )}
              </div>
              <h3 className={`text-base font-bold leading-tight truncate ${task.status === 'completed' ? 'line-through text-slate-400' : 'text-slate-900 dark:text-slate-100'}`}>
                {task.title}
              </h3>
            </div>
            <div className="flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20" 
                onClick={() => setIsShareOpen(true)}
                title="Share / Collaborate"
              >
                <Users className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20" onClick={onEdit}>
                <Pencil className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20" onClick={onDelete}>
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>

        {task.description && (
          <div 
            className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2 prose prose-sm dark:prose-invert max-w-none border-l-2 border-slate-100 dark:border-slate-800 pl-3"
            dangerouslySetInnerHTML={{ __html: task.description }}
          />
        )}

        {/* Tags Row */}
        {task.tags && task.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {task.tags.map(tag => (
              <span key={tag} className="text-[10px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-2 py-0.5 rounded-full">
                #{tag}
              </span>
            ))}
          </div>
        )}

        <div className="flex items-center gap-3 flex-wrap pt-1">
          {task.dueDate && (
            <div className="flex items-center text-[11px] font-medium text-slate-500 bg-slate-50 dark:bg-slate-900 px-2 py-1 rounded border border-slate-100 dark:border-slate-800" title="Due Date">
              <Clock className="w-3 h-3 mr-1.5 text-blue-500" />
              {new Date(task.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
            </div>
          )}
          
          {task.subtasks && task.subtasks.length > 0 && (
            <div className="flex items-center text-[11px] font-medium text-slate-500 bg-slate-50 dark:bg-slate-900 px-2 py-1 rounded border border-slate-100 dark:border-slate-800" title="Subtasks">
              <ListTodo className="w-3 h-3 mr-1.5 text-green-500" />
              {task.subtasks.filter(s => s.completed).length}/{task.subtasks.length}
            </div>
          )}

          {(task.estimatedMinutes || (task.timeSpent && task.timeSpent > 0)) && (
            <div className="flex items-center text-[11px] font-medium text-slate-500 bg-slate-50 dark:bg-slate-900 px-2 py-1 rounded border border-slate-100 dark:border-slate-800" title="Time (Estimated / Spent)">
              <Timer className="w-3 h-3 mr-1.5 text-orange-500" />
              {task.timeSpent ? Math.floor(task.timeSpent / 60) : 0} / {task.estimatedMinutes || '—'}m
            </div>
          )}

          {task.recurringPattern && task.recurringPattern !== 'none' && (
            <div className="flex items-center text-[11px] font-medium text-purple-600 bg-purple-50 dark:bg-purple-900/20 px-2 py-1 rounded border border-purple-100 dark:border-purple-900/30" title={`Recurring: ${task.recurringPattern}`}>
              <RepeatIcon className="w-3 h-3 mr-1.5" />
              {task.recurringPattern}
            </div>
          )}

          {task.dependencies && task.dependencies.length > 0 && (
            <div className={`flex items-center text-[11px] font-medium px-2 py-1 rounded border ${
              isBlocked 
                ? 'text-red-600 bg-red-50 border-red-100 dark:bg-red-900/20 dark:border-red-900/30' 
                : 'text-slate-500 bg-slate-50 border-slate-100 dark:bg-slate-900 dark:border-slate-800'
            }`} title="Dependencies">
              <LinkIcon className="w-3 h-3 mr-1.5" />
              {task.dependencies.length} {isBlocked ? 'Blocked' : 'Linked'}
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="px-5 py-3 bg-slate-50/50 dark:bg-slate-900/30 flex justify-end">
        {task.status !== 'completed' && (
          <Button 
            size="sm" 
            className="h-8 px-4 rounded-full shadow-sm hover:shadow-md transition-shadow" 
            onClick={onComplete}
            disabled={isBlocked}
          >
            <CheckCircle className="w-4 h-4 mr-2" /> 
            {isBlocked ? 'Blocked' : 'Complete'}
          </Button>
        )}
      </CardFooter>
    </Card>

    <CollaboratorModal 
      taskId={task.id} 
      isOpen={isShareOpen} 
      onClose={() => setIsShareOpen(false)} 
    />
    </>
  );
}

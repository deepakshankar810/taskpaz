'use client';

import { Task } from '@/lib/types';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock, Tag, Trash2, CheckCircle, Pencil, ListTodo, Timer, RepeatIcon } from 'lucide-react';
import { PriorityBadge } from './PriorityBadge';
import { CategoryBadge } from './CategoryBadge';
interface TaskCardProps {
  task: Task;
  onComplete?: () => void;
  onDelete?: () => void;
  onEdit?: () => void;
}

export function TaskCard({ task, onComplete, onDelete, onEdit }: TaskCardProps) {

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4 space-y-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <h3 className={`font-medium ${task.status === 'completed' ? 'line-through text-slate-500' : ''}`}>
              {task.title}
            </h3>
            {task.description && (
              <div 
                className="text-sm text-slate-500 line-clamp-2 prose dark:prose-invert prose-sm max-w-none"
                dangerouslySetInnerHTML={{ __html: task.description }}
              />
            )}
          </div>
          <PriorityBadge priority={task.priority} />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <CategoryBadge category={task.category} />
          {task.dueDate && (
            <div className="flex items-center text-xs text-slate-500 bg-slate-100 rounded px-2 py-1 dark:bg-slate-800" title="Due Date">
              <Clock className="w-3 h-3 mr-1" />
              {new Date(task.dueDate).toLocaleDateString()}
            </div>
          )}
          {task.subtasks && task.subtasks.length > 0 && (
            <div className="flex items-center text-xs text-slate-500 bg-slate-100 rounded px-2 py-1 dark:bg-slate-800" title="Subtasks">
              <ListTodo className="w-3 h-3 mr-1" />
              {task.subtasks.filter(s => s.completed).length}/{task.subtasks.length}
            </div>
          )}
          {task.timeSpent !== undefined && task.timeSpent > 0 && (
            <div className="flex items-center text-xs text-slate-500 bg-blue-50 text-blue-600 rounded px-2 py-1 dark:bg-blue-900/30 dark:text-blue-400" title="Time Spent">
              <Timer className="w-3 h-3 mr-1" />
              {Math.floor(task.timeSpent / 60)}m
            </div>
          )}
          {task.recurringPattern && task.recurringPattern !== 'none' && (
            <div className="flex items-center text-xs text-slate-500 bg-purple-50 text-purple-600 rounded px-2 py-1 dark:bg-purple-900/30 dark:text-purple-400" title={`Recurring: ${task.recurringPattern}`}>
              <RepeatIcon className="w-3 h-3 mr-1" />
              {task.recurringPattern}
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="px-4 py-3 bg-slate-50 dark:bg-slate-900/50 flex justify-end gap-2">
        <div className="flex-1 flex gap-2">
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-slate-500" onClick={onEdit}>
            <Pencil className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-red-500" onClick={onDelete}>
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
        {task.status !== 'completed' && (
          <Button size="sm" className="h-8" onClick={onComplete}>
            <CheckCircle className="w-4 h-4 mr-1" /> Complete
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}

'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Play, Pause, RotateCcw, Timer } from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useTasksContext } from '@/components/providers/TasksProvider';

export function PomodoroTimer() {
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [mode, setMode] = useState<'work' | 'break'>('work');
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  
  const { tasks, optimisticUpdateTask } = useTasksContext();
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const pendingTasks = tasks.filter(t => t.status !== 'completed');

  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            setIsRunning(false);
            
            // Auto switch modes or just notify
            if (Notification.permission === 'granted') {
              new Notification(mode === 'work' ? 'Work session complete!' : 'Break over!', {
                body: mode === 'work' ? 'Time for a break.' : 'Back to work!',
              });
            }
            
            // If we finished a work session and a task was selected, add 25m to timeSpent
            if (mode === 'work' && selectedTaskId) {
              const task = tasks.find(t => t.id === selectedTaskId);
              if (task) {
                const currentSpent = task.timeSpent || 0;
                optimisticUpdateTask(selectedTaskId, { timeSpent: currentSpent + 25 * 60 });
                // Note: Background sync should ideally happen here, 
                // but we rely on the user editing the task later or we can call updateTask here.
              }
            }
            
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning, mode, selectedTaskId, tasks, optimisticUpdateTask]);

  const toggleTimer = () => setIsRunning(!isRunning);

  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(mode === 'work' ? 25 * 60 : 5 * 60);
  };

  const switchMode = (newMode: 'work' | 'break') => {
    setMode(newMode);
    setIsRunning(false);
    setTimeLeft(newMode === 'work' ? 25 * 60 : 5 * 60);
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2 font-mono">
          <Timer className="h-4 w-4" />
          {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="end">
        <div className="space-y-4">
          <h4 className="font-medium flex items-center justify-between">
            Pomodoro Timer
            <span className="text-xs px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded-full capitalize">
              {mode}
            </span>
          </h4>
          
          <div className="flex justify-center gap-2">
            <Button 
              variant={mode === 'work' ? 'default' : 'outline'} 
              size="sm"
              onClick={() => switchMode('work')}
            >
              Work (25m)
            </Button>
            <Button 
              variant={mode === 'break' ? 'default' : 'outline'} 
              size="sm"
              onClick={() => switchMode('break')}
            >
              Break (5m)
            </Button>
          </div>

          <div className="text-5xl font-mono text-center py-4 tabular-nums">
            {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
          </div>

          <div className="flex justify-center gap-4">
            <Button size="icon" variant="outline" onClick={toggleTimer}>
              {isRunning ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </Button>
            <Button size="icon" variant="outline" onClick={resetTimer}>
              <RotateCcw className="h-4 w-4" />
            </Button>
          </div>
          
          {mode === 'work' && (
            <div className="pt-2 border-t mt-4">
              <label className="text-sm text-slate-500 mb-2 block">Track time for task:</label>
              <select 
                className="w-full text-sm p-2 rounded-md border bg-transparent"
                value={selectedTaskId || ''}
                onChange={(e) => setSelectedTaskId(e.target.value || null)}
              >
                <option value="">-- None --</option>
                {pendingTasks.map(t => (
                  <option key={t.id} value={t.id}>{t.title}</option>
                ))}
              </select>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}

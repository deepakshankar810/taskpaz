'use client';

import { useState, useMemo } from 'react';
import { Task } from '@/lib/types';
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval, 
  isSameMonth, 
  isSameDay, 
  addMonths, 
  subMonths 
} from 'date-fns';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CalendarGridProps {
  tasks: Task[];
  onDateClick: (date: Date) => void;
  onTaskClick: (task: Task) => void;
}

export function CalendarGrid({ tasks, onDateClick, onTaskClick }: CalendarGridProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const days = useMemo(() => {
    const start = startOfWeek(startOfMonth(currentMonth));
    const end = endOfWeek(endOfMonth(currentMonth));
    return eachDayOfInterval({ start, end });
  }, [currentMonth]);

  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

  const getTasksForDay = (day: Date) => {
    return tasks.filter(task => task.dueDate && isSameDay(new Date(task.dueDate), day));
  };

  return (
    <div className="bg-white dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden animate-in fade-in zoom-in-95 duration-300">
      <div className="flex items-center justify-between p-4 border-b dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
          {format(currentMonth, 'MMMM yyyy')}
        </h2>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={prevMonth} className="h-8 w-8">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setCurrentMonth(new Date())} className="text-xs h-8">
            Today
          </Button>
          <Button variant="ghost" size="icon" onClick={nextMonth} className="h-8 w-8">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-7 border-b dark:border-slate-800">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
          <div key={day} className="py-2 text-center text-xs font-bold text-slate-400 uppercase tracking-widest">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7">
        {days.map((day, i) => {
          const dayTasks = getTasksForDay(day);
          const isCurrentMonth = isSameMonth(day, currentMonth);
          const isTodayDate = isSameDay(day, new Date());

          return (
            <div
              key={day.toString()}
              className={cn(
                "min-h-[120px] p-2 border-r border-b dark:border-slate-800 transition-colors group relative",
                !isCurrentMonth && "bg-slate-50/50 dark:bg-slate-900/20 opacity-50"
              )}
            >
              <div className="flex items-center justify-between mb-2">
                <span className={cn(
                  "text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center",
                  isTodayDate ? "bg-blue-600 text-white shadow-md shadow-blue-500/30" : "text-slate-500"
                )}>
                  {format(day, 'd')}
                </span>
                <button 
                  onClick={() => onDateClick(day)}
                  className="opacity-0 group-hover:opacity-100 p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-all"
                >
                  <Plus className="h-3 w-3 text-blue-500" />
                </button>
              </div>

              <div className="space-y-1 overflow-y-auto max-h-[80px] scrollbar-hide">
                {dayTasks.map((task) => (
                  <div
                    key={task.id}
                    onClick={() => onTaskClick(task)}
                    className={cn(
                      "text-[10px] px-1.5 py-0.5 rounded-sm truncate cursor-pointer transition-all border-l-2 hover:brightness-95 active:scale-95",
                      task.status === 'completed' 
                        ? "bg-slate-100 text-slate-500 border-l-slate-400 dark:bg-slate-800 dark:text-slate-500"
                        : task.priority === 'urgent'
                        ? "bg-red-50 text-red-700 border-l-red-500 dark:bg-red-900/20 dark:text-red-400"
                        : task.priority === 'high'
                        ? "bg-orange-50 text-orange-700 border-l-orange-500 dark:bg-orange-900/20 dark:text-orange-400"
                        : "bg-blue-50 text-blue-700 border-l-blue-500 dark:bg-blue-900/20 dark:text-blue-400"
                    )}
                    title={task.title}
                  >
                    {task.title}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

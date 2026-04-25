'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Play, Pause, RotateCcw, Timer } from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useRouter } from 'next/navigation';
import * as timerStore from '@/lib/focusTimerStore';

export function PomodoroTimer() {
  const router = useRouter();
  const [timerState, setTimerState] = useState(timerStore.getState());

  useEffect(() => {
    const unsub = timerStore.subscribe(setTimerState);
    return () => { unsub(); };
  }, []);

  const { timeLeft, isRunning, totalSeconds } = timerState;
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const progress = totalSeconds > 0 ? ((totalSeconds - timeLeft) / totalSeconds) * 100 : 0;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={`gap-2 font-mono transition-colors ${isRunning ? 'border-blue-400 text-blue-600 dark:text-blue-400' : ''}`}
        >
          <Timer className={`h-4 w-4 ${isRunning ? 'animate-pulse' : ''}`} />
          {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-72" align="end">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold">Focus Timer</h4>
            <span className="text-xs px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded-full text-slate-500">
              {timerState.label}
            </span>
          </div>

          {/* Progress bar */}
          <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-500 rounded-full transition-all duration-1000"
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="text-4xl font-mono text-center py-3 tabular-nums font-bold">
            {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
          </div>

          <div className="flex justify-center gap-3">
            <Button
              size="icon"
              variant={isRunning ? 'default' : 'outline'}
              onClick={() => isRunning ? timerStore.pauseTimer() : timerStore.startTimer()}
            >
              {isRunning ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </Button>
            <Button size="icon" variant="outline" onClick={timerStore.resetTimer}>
              <RotateCcw className="h-4 w-4" />
            </Button>
          </div>

          <Button
            variant="ghost"
            size="sm"
            className="w-full text-blue-600 dark:text-blue-400 text-xs"
            onClick={() => router.push('/focus')}
          >
            Open full Focus Mode →
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}

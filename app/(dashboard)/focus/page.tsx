'use client';

import { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, Plus, Minus, Flame, Coffee, BookOpen, Code2, Dumbbell, Music, Pencil, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import * as timerStore from '@/lib/focusTimerStore';
import { FocusMusicPlayer } from '@/components/focus/FocusMusicPlayer';
import { useTasksContext } from '@/components/providers/TasksProvider';
import { WellnessTips } from '@/components/focus/WellnessTips';
import { updateTask } from '@/lib/db/tasks';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const PRESETS = [
  { label: 'Quick Focus', minutes: 15, icon: Flame, color: 'bg-orange-100 text-orange-600 border-orange-200 dark:bg-orange-900/20 dark:text-orange-400 dark:border-orange-800' },
  { label: 'Pomodoro', minutes: 25, icon: Flame, color: 'bg-red-100 text-red-600 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800' },
  { label: 'Deep Work', minutes: 50, icon: Code2, color: 'bg-blue-100 text-blue-600 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800' },
  { label: 'Short Break', minutes: 5, icon: Coffee, color: 'bg-teal-100 text-teal-600 border-teal-200 dark:bg-teal-900/20 dark:text-teal-400 dark:border-teal-800' },
  { label: 'Long Break', minutes: 15, icon: Coffee, color: 'bg-green-100 text-green-600 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800' },
  { label: 'Reading', minutes: 30, icon: BookOpen, color: 'bg-purple-100 text-purple-600 border-purple-200 dark:bg-purple-900/20 dark:text-purple-400 dark:border-purple-800' },
  { label: 'Workout', minutes: 45, icon: Dumbbell, color: 'bg-pink-100 text-pink-600 border-pink-200 dark:bg-pink-900/20 dark:text-pink-400 dark:border-pink-800' },
  { label: 'Creative', minutes: 60, icon: Music, color: 'bg-yellow-100 text-yellow-600 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800' },
];

const SESSION_LOG_KEY = 'focus_session_log';

interface SessionEntry {
  label: string;
  minutes: number;
  completedAt: string;
}

function formatTime(seconds: number) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

import { BreathingGuide } from '@/components/focus/BreathingGuide';
import { Eye, EyeOff } from 'lucide-react';

export default function FocusPage() {
  const [timerState, setTimerState] = useState(timerStore.getState());
  const [customMinutes, setCustomMinutes] = useState(25);
  const [customLabel, setCustomLabel] = useState('Focus Session');
  const [sessionLog, setSessionLog] = useState<SessionEntry[]>([]);
  const [zenMode, setZenMode] = useState(false);
  const { tasks } = useTasksContext();
  const [selectedTaskId, setSelectedTaskId] = useState<string>('none');

  const activeTasks = tasks.filter(t => t.status !== 'completed');
  const selectedTask = tasks.find(t => t.id === selectedTaskId);

  useEffect(() => {
    const unsub = timerStore.subscribe((s) => {
      setTimerState(s);
      if (s.timeLeft === 0 && !s.isRunning && s.totalSeconds > 0) {
        const entry: SessionEntry = {
          label: s.label,
          minutes: Math.round(s.totalSeconds / 60),
          completedAt: new Date().toISOString(),
        };
        setSessionLog(prev => {
          const updated = [entry, ...prev].slice(0, 20);
          localStorage.setItem(SESSION_LOG_KEY, JSON.stringify(updated));
          return updated;
        });

        // Sync to database if a task is selected
        if (selectedTaskId && selectedTaskId !== 'none') {
            const task = tasks.find(t => t.id === selectedTaskId);
            if (task) {
                const newTimeSpent = (task.timeSpent || 0) + s.totalSeconds;
                updateTask(task.id, { timeSpent: newTimeSpent }).catch(err => {
                    console.error('Failed to update task focus time:', err);
                });
            }
        }
      }
    });

    const saved = localStorage.getItem(SESSION_LOG_KEY);
    if (saved) setSessionLog(JSON.parse(saved));

    return () => { unsub(); };
  }, []);

  const applyPreset = (preset: typeof PRESETS[0]) => {
    timerStore.setTimer(preset.minutes * 60, preset.label, 'custom');
    setCustomMinutes(preset.minutes);
    setCustomLabel(preset.label);
  };

  const applyCustom = () => {
    const secs = Math.max(1, customMinutes) * 60;
    timerStore.setTimer(secs, customLabel || 'Focus Session', 'custom');
  };

  const { timeLeft, totalSeconds, isRunning, label } = timerState;
  const isBreak = label.toLowerCase().includes('break');
  const progress = totalSeconds > 0 ? ((totalSeconds - timeLeft) / totalSeconds) * 100 : 0;
  const totalFocused = sessionLog.reduce((acc, s) => acc + s.minutes, 0);

  return (
    <div className={`space-y-6 p-6 md:p-10 lg:p-14 transition-all duration-500 ${zenMode ? 'max-w-4xl mx-auto' : ''}`}>
      {/* Header */}
      {!zenMode && (
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Focus Mode</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">Set your intention, start the timer, get things done.</p>
          </div>
          <Button variant="outline" size="sm" onClick={() => setZenMode(true)} className="gap-2">
            <EyeOff className="h-4 w-4" /> Zen Mode
          </Button>
        </div>
      )}

      <div className={`grid grid-cols-1 ${zenMode ? 'lg:grid-cols-1' : 'lg:grid-cols-3'} gap-6 transition-all duration-500`}>
        {/* Left: Timer + Controls */}
        <div className={`${zenMode ? 'lg:col-span-1' : 'lg:col-span-2'} space-y-6`}>

          {/* Main Timer Card */}
          <Card className={`relative overflow-hidden transition-all duration-700 ${zenMode ? 'border-none shadow-none bg-transparent py-20' : ''}`}>
            {zenMode && (
                <div className="absolute top-4 right-4 z-50">
                    <Button variant="ghost" size="icon" onClick={() => setZenMode(false)}>
                        <Eye className="h-5 w-5 text-slate-400" />
                    </Button>
                </div>
            )}

            <CardContent className="flex flex-col items-center gap-6 py-10">
              {/* Task Selector */}
              {!zenMode && (
                <div className="w-full max-w-xs space-y-2">
                    <Label className="text-[10px] uppercase font-bold text-slate-400 tracking-widest text-center block">Focus Target</Label>
                    <Select value={selectedTaskId} onValueChange={setSelectedTaskId}>
                        <SelectTrigger className="w-full bg-white/50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800">
                            <SelectValue placeholder="Select a task..." />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="none">General Focus</SelectItem>
                            {activeTasks.map(task => (
                                <SelectItem key={task.id} value={task.id}>
                                    {task.title}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
              )}

              {zenMode && selectedTask && (
                  <div className="text-center animate-in fade-in slide-in-from-top-2 duration-1000">
                      <h2 className="text-xl font-bold text-blue-600 dark:text-blue-400 mb-1">{selectedTask.title}</h2>
                      <p className="text-xs text-slate-400 uppercase tracking-widest font-semibold">Current Mission</p>
                  </div>
              )}

              {/* Session label */}
              <span className={`text-sm font-medium tracking-wide uppercase transition-colors ${zenMode ? 'text-blue-500 font-bold' : 'text-slate-500 dark:text-slate-400'}`}>
                {label}
              </span>

              {/* Breathing Guide / Timer */}
              <div className="relative flex flex-col items-center">
                {isBreak && isRunning ? (
                    <BreathingGuide />
                ) : (
                    <div className="relative">
                        <svg width="300" height="300" className="-rotate-90">
                        <circle
                            cx="150" cy="150" r={130}
                            stroke="currentColor"
                            strokeWidth="8"
                            fill="none"
                            className="text-slate-100 dark:text-slate-800/50"
                        />
                        <circle
                            cx="150" cy="150" r={130}
                            stroke="url(#focusGrad)"
                            strokeWidth="8"
                            fill="none"
                            strokeLinecap="round"
                            strokeDasharray={2 * Math.PI * 130}
                            strokeDashoffset={2 * Math.PI * 130 * (1 - progress / 100)}
                            style={{ transition: 'stroke-dashoffset 1s linear' }}
                        />
                        <defs>
                            <linearGradient id="focusGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#6366f1" />
                            <stop offset="100%" stopColor="#3b82f6" />
                            </linearGradient>
                        </defs>
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className={`text-6xl font-mono font-bold tabular-nums tracking-tight ${isRunning ? 'text-blue-600 dark:text-blue-400' : ''}`}>
                            {formatTime(timeLeft)}
                        </span>
                        {!zenMode && <span className="text-slate-400 text-xs mt-1">{Math.round(progress)}% complete</span>}
                        </div>
                    </div>
                )}
              </div>

              {/* Controls */}
              <div className={`flex items-center gap-6 transition-all ${zenMode ? 'scale-110' : ''}`}>
                {!zenMode && (
                    <Button size="icon" variant="outline" className="h-12 w-12 rounded-full" onClick={timerStore.resetTimer}>
                        <RotateCcw className="h-5 w-5" />
                    </Button>
                )}
                <Button
                  className={`h-20 w-20 rounded-full font-bold shadow-xl transition-all ${
                    isRunning
                      ? 'bg-slate-200 hover:bg-slate-300 text-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-white'
                      : 'bg-gradient-to-br from-blue-500 to-indigo-600 hover:from-blue-400 hover:to-indigo-500 text-white shadow-blue-500/20'
                  }`}
                  onClick={() => isRunning ? timerStore.pauseTimer() : timerStore.startTimer()}
                >
                  {isRunning ? <Pause className="h-8 w-8" /> : <Play className="h-8 w-8 ml-1" />}
                </Button>
                {zenMode && (
                    <Button size="icon" variant="ghost" className="h-12 w-12 rounded-full" onClick={timerStore.resetTimer}>
                        <RotateCcw className="h-5 w-5 text-slate-400" />
                    </Button>
                )}
                {!zenMode && <div className="h-12 w-12" />}
              </div>
            </CardContent>
          </Card>

          {/* Custom Timer */}
          {!zenMode && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Pencil className="h-4 w-4 text-blue-500" />
                  Set Custom Timer
                </CardTitle>
              </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs text-slate-500 uppercase tracking-wider">Label</Label>
                  <Input
                    value={customLabel}
                    onChange={e => setCustomLabel(e.target.value)}
                    placeholder="e.g. Deep Work"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs text-slate-500 uppercase tracking-wider">Duration (minutes)</Label>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="icon" className="h-9 w-9 flex-shrink-0"
                      onClick={() => setCustomMinutes(m => Math.max(1, m - 5))}>
                      <Minus className="h-3 w-3" />
                    </Button>
                    <Input
                      type="number"
                      value={customMinutes}
                      onChange={e => setCustomMinutes(Number(e.target.value))}
                      min={1}
                      className="text-center h-9"
                    />
                    <Button variant="outline" size="icon" className="h-9 w-9 flex-shrink-0"
                      onClick={() => setCustomMinutes(m => m + 5)}>
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
                <div className="flex items-end">
                  <Button onClick={applyCustom} className="w-full h-9">Set Timer</Button>
                </div>
              </div>
            </CardContent>
          </Card>
          )}

          {/* Presets */}
          {!zenMode && (
            <div className="space-y-3">
              <h3 className="font-semibold text-sm text-slate-600 dark:text-slate-300 uppercase tracking-wider">Quick Presets</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {PRESETS.map(preset => (
                  <button
                    key={preset.label}
                    onClick={() => applyPreset(preset)}
                    className={`flex flex-col gap-2 rounded-xl p-4 text-left border transition-all hover:scale-105 active:scale-95 ${preset.color}`}
                  >
                    <preset.icon className="h-5 w-5" />
                    <div>
                      <p className="text-sm font-semibold">{preset.label}</p>
                      <p className="text-xs opacity-70">{preset.minutes}m</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right: Stats & Session Log */}
        <div className="space-y-6">
          <WellnessTips />
          
          <div className="transition-all duration-700">
            <FocusMusicPlayer />
          </div>
          
          {/* Stats & Log (Blurred in Zen Mode) */}
          {!zenMode && (
            <div className="space-y-6 animate-in fade-in duration-700">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Session Stats</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="text-4xl font-bold text-blue-600 dark:text-blue-400">{totalFocused}m</div>
                    <p className="text-slate-500 text-sm mt-1">Total focused time</p>
                  </div>
                  <div className="h-px bg-slate-100 dark:bg-slate-800" />
                  <div className="text-slate-600 dark:text-slate-400 text-sm">
                    <span className="font-semibold text-slate-900 dark:text-white">{sessionLog.length}</span> session{sessionLog.length !== 1 ? 's' : ''} completed
                  </div>
                </CardContent>
              </Card>

              {/* Session Log */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Session Log</CardTitle>
                </CardHeader>
                <CardContent>
                  {sessionLog.length === 0 ? (
                    <p className="text-slate-400 text-sm text-center py-8">
                      No sessions yet.<br />Start your first focus session!
                    </p>
                  ) : (
                    <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                      {sessionLog.map((entry, i) => (
                        <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800">
                          <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{entry.label}</p>
                            <p className="text-xs text-slate-400">
                              {entry.minutes}m · {new Date(entry.completedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
          
          {zenMode && (
            <div className="hidden lg:block blur-xl opacity-10 pointer-events-none select-none space-y-4">
                <div className="h-32 w-full bg-slate-200 dark:bg-slate-800 rounded-xl" />
                <div className="h-64 w-full bg-slate-200 dark:bg-slate-800 rounded-xl" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

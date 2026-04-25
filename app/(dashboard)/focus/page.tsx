'use client';

import { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, Plus, Minus, Flame, Coffee, BookOpen, Code2, Dumbbell, Music, Pencil, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import * as timerStore from '@/lib/focusTimerStore';

const PRESETS = [
  { label: 'Quick Focus', minutes: 15, icon: Flame, color: 'from-orange-400 to-amber-500' },
  { label: 'Deep Work', minutes: 50, icon: Code2, color: 'from-blue-500 to-indigo-600' },
  { label: 'Pomodoro', minutes: 25, icon: Flame, color: 'from-red-400 to-rose-500' },
  { label: 'Short Break', minutes: 5, icon: Coffee, color: 'from-teal-400 to-cyan-500' },
  { label: 'Long Break', minutes: 15, icon: Coffee, color: 'from-green-400 to-emerald-500' },
  { label: 'Reading', minutes: 30, icon: BookOpen, color: 'from-purple-400 to-violet-500' },
  { label: 'Workout', minutes: 45, icon: Dumbbell, color: 'from-pink-400 to-fuchsia-500' },
  { label: 'Creative', minutes: 60, icon: Music, color: 'from-yellow-400 to-orange-500' },
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

export default function FocusPage() {
  const [timerState, setTimerState] = useState(timerStore.getState());
  const [customMinutes, setCustomMinutes] = useState(25);
  const [customLabel, setCustomLabel] = useState('Focus Session');
  const [sessionLog, setSessionLog] = useState<SessionEntry[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const unsub = timerStore.subscribe((s) => {
      setTimerState(s);
      // When timer hits zero, log the session
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
      }
    });

    // Load session log
    const saved = localStorage.getItem(SESSION_LOG_KEY);
    if (saved) setSessionLog(JSON.parse(saved));
    setMounted(true);

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
  const progress = totalSeconds > 0 ? ((totalSeconds - timeLeft) / totalSeconds) * 100 : 0;
  const circumference = 2 * Math.PI * 110; // radius 110
  const strokeDashoffset = circumference * (1 - progress / 100);

  const totalFocused = sessionLog.reduce((acc, s) => acc + s.minutes, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 text-white">
      <div className="max-w-6xl mx-auto px-6 py-10 space-y-10">

        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Focus Mode</h1>
          <p className="text-slate-400 mt-1">Set your intention, start your timer, get things done.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* --- Left: Timer --- */}
          <div className="lg:col-span-2 space-y-8">

            {/* Circular Timer */}
            <div className="flex flex-col items-center gap-6 bg-white/5 border border-white/10 rounded-2xl p-10 backdrop-blur-sm">
              {/* Label */}
              <div className="text-slate-300 font-medium text-lg tracking-wide">{label}</div>

              {/* SVG Circle */}
              <div className="relative">
                <svg width="260" height="260" className="-rotate-90">
                  <circle cx="130" cy="130" r="110" stroke="rgba(255,255,255,0.08)" strokeWidth="12" fill="none" />
                  <circle
                    cx="130" cy="130" r="110"
                    stroke="url(#timerGradient)"
                    strokeWidth="12"
                    fill="none"
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    style={{ transition: 'stroke-dashoffset 1s linear' }}
                  />
                  <defs>
                    <linearGradient id="timerGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#6366f1" />
                      <stop offset="100%" stopColor="#3b82f6" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-5xl font-mono font-bold tabular-nums tracking-tight">
                    {formatTime(timeLeft)}
                  </span>
                  <span className="text-slate-400 text-sm mt-1">{Math.round(progress)}% complete</span>
                </div>
              </div>

              {/* Controls */}
              <div className="flex items-center gap-4">
                <Button
                  size="icon"
                  variant="outline"
                  className="h-12 w-12 rounded-full border-white/20 bg-white/5 hover:bg-white/10 text-white"
                  onClick={timerStore.resetTimer}
                >
                  <RotateCcw className="h-5 w-5" />
                </Button>
                <Button
                  className={`h-16 w-16 rounded-full text-white font-bold shadow-lg shadow-blue-500/30 ${
                    isRunning
                      ? 'bg-white/20 hover:bg-white/30'
                      : 'bg-gradient-to-br from-blue-500 to-indigo-600 hover:from-blue-400 hover:to-indigo-500'
                  }`}
                  onClick={() => isRunning ? timerStore.pauseTimer() : timerStore.startTimer()}
                >
                  {isRunning ? <Pause className="h-7 w-7" /> : <Play className="h-7 w-7 ml-0.5" />}
                </Button>
                <div className="h-12 w-12" /> {/* Spacer for centering */}
              </div>
            </div>

            {/* Custom Timer Settings */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm space-y-5">
              <h3 className="font-semibold text-slate-200 flex items-center gap-2">
                <Pencil className="h-4 w-4 text-blue-400" />
                Set Custom Timer
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-slate-400 text-xs uppercase tracking-wider">Label</Label>
                  <Input
                    value={customLabel}
                    onChange={e => setCustomLabel(e.target.value)}
                    placeholder="e.g. Deep Work"
                    className="bg-white/5 border-white/10 text-white placeholder:text-slate-600"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-slate-400 text-xs uppercase tracking-wider">Duration (minutes)</Label>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      className="border-white/10 bg-white/5 hover:bg-white/10 text-white h-9 w-9"
                      onClick={() => setCustomMinutes(m => Math.max(1, m - 5))}
                    >
                      <Minus className="h-3 w-3" />
                    </Button>
                    <Input
                      type="number"
                      value={customMinutes}
                      onChange={e => setCustomMinutes(Number(e.target.value))}
                      min={1}
                      className="bg-white/5 border-white/10 text-white text-center w-16 h-9"
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      className="border-white/10 bg-white/5 hover:bg-white/10 text-white h-9 w-9"
                      onClick={() => setCustomMinutes(m => m + 5)}
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
                <div className="flex items-end">
                  <Button
                    onClick={applyCustom}
                    className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-400 hover:to-indigo-500 h-9"
                  >
                    Set Timer
                  </Button>
                </div>
              </div>
            </div>

            {/* Presets */}
            <div className="space-y-3">
              <h3 className="font-semibold text-slate-200">Quick Presets</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {PRESETS.map(preset => (
                  <button
                    key={preset.label}
                    onClick={() => applyPreset(preset)}
                    className={`group relative overflow-hidden rounded-xl p-4 text-left bg-white/5 border border-white/10 hover:border-white/20 transition-all hover:scale-105 cursor-pointer`}
                  >
                    <div className={`absolute inset-0 bg-gradient-to-br ${preset.color} opacity-0 group-hover:opacity-20 transition-opacity`} />
                    <preset.icon className="h-5 w-5 mb-2 text-slate-300" />
                    <p className="text-sm font-medium text-white">{preset.label}</p>
                    <p className="text-xs text-slate-400">{preset.minutes}m</p>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* --- Right: Stats & Log --- */}
          <div className="space-y-6">
            {/* Stats */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm space-y-4">
              <h3 className="font-semibold text-slate-200">Today's Stats</h3>
              <div className="text-4xl font-bold text-blue-400">{totalFocused}m</div>
              <p className="text-slate-400 text-sm">Total focused time</p>
              <div className="text-slate-400 text-sm">
                {sessionLog.length} session{sessionLog.length !== 1 ? 's' : ''} completed
              </div>
            </div>

            {/* Session Log */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm space-y-3">
              <h3 className="font-semibold text-slate-200">Session Log</h3>
              {sessionLog.length === 0 ? (
                <p className="text-slate-500 text-sm text-center py-6">
                  No sessions yet. Start your first focus session!
                </p>
              ) : (
                <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
                  {sessionLog.map((entry, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-3 p-3 bg-white/5 rounded-lg"
                    >
                      <CheckCircle2 className="h-4 w-4 text-green-400 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white truncate">{entry.label}</p>
                        <p className="text-xs text-slate-400">
                          {entry.minutes}m · {new Date(entry.completedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

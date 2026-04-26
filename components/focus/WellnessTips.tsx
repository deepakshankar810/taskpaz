'use client';

import { useState } from 'react';
import { Wind, StretchHorizontal, Sparkles, ChevronRight, ChevronLeft } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const TIPS = [
  {
    category: 'Breathing',
    title: 'Box Breathing',
    description: 'Inhale 4s, Hold 4s, Exhale 4s, Hold 4s. Resets the nervous system.',
    icon: Wind,
    color: 'text-blue-500 bg-blue-50 dark:bg-blue-900/20'
  },
  {
    category: 'Breathing',
    title: '4-7-8 Technique',
    description: 'Inhale 4s, Hold 7s, Exhale 8s. Deeply relaxing for stressful tasks.',
    icon: Wind,
    color: 'text-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
  },
  {
    category: 'Exercise',
    title: 'Neck Rolls',
    description: 'Gently roll your neck in circles for 30s to release tension.',
    icon: StretchHorizontal,
    color: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20'
  },
  {
    category: 'Exercise',
    title: 'Shoulder Shrugs',
    description: 'Lift shoulders to ears, hold, and drop. Repeat 5 times.',
    icon: StretchHorizontal,
    color: 'text-amber-500 bg-amber-50 dark:bg-amber-900/20'
  },
  {
    category: 'Mindset',
    title: 'The 20-20-20 Rule',
    description: 'Every 20 mins, look at something 20 feet away for 20 seconds.',
    icon: Sparkles,
    color: 'text-rose-500 bg-rose-50 dark:bg-rose-900/20'
  }
];

export function WellnessTips() {
  const [index, setIndex] = useState(0);
  const tip = TIPS[index];

  const next = () => setIndex((index + 1) % TIPS.length);
  const prev = () => setIndex((index - 1 + TIPS.length) % TIPS.length);

  return (
    <Card className="overflow-hidden border-none shadow-lg bg-gradient-to-br from-white to-slate-50 dark:from-slate-950 dark:to-slate-900">
      <CardHeader className="pb-2 flex flex-row items-center justify-between">
        <CardTitle className="text-sm font-bold uppercase tracking-wider text-slate-500">Wellness Corner</CardTitle>
        <div className="flex gap-1">
          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={prev}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={next}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex gap-4 items-start">
          <div className={`p-3 rounded-xl ${tip.color}`}>
            <tip.icon className="h-5 w-5" />
          </div>
          <div className="space-y-1">
            <p className="text-[10px] font-bold uppercase tracking-widest opacity-60">{tip.category}</p>
            <h4 className="font-bold text-sm">{tip.title}</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              {tip.description}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

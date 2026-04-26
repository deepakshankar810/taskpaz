'use client';

import { useState, useEffect, useCallback } from 'react';
import { Wind, StretchHorizontal, Sparkles, ChevronRight, ChevronLeft, Droplets, Eye, Brain, Moon, Coffee } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const TIPS = [
  { category: 'Breathing', title: 'Box Breathing', description: 'Inhale 4s, Hold 4s, Exhale 4s, Hold 4s. Resets the nervous system.', icon: Wind, color: 'text-blue-500 bg-blue-50 dark:bg-blue-900/20' },
  { category: 'Exercise', title: 'Neck Rolls', description: 'Gently roll your neck in circles for 30s to release tension.', icon: StretchHorizontal, color: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20' },
  { category: 'Hydration', title: 'Water Break', description: 'Take a few sips of water. Dehydration leads to mental fatigue.', icon: Droplets, color: 'text-cyan-500 bg-cyan-50 dark:bg-cyan-900/20' },
  { category: 'Eye Care', title: '20-20-20 Rule', description: 'Every 20 mins, look 20 feet away for 20s to reduce eye strain.', icon: Eye, color: 'text-rose-500 bg-rose-50 dark:bg-rose-900/20' },
  { category: 'Posture', title: 'Shoulder Shrugs', description: 'Lift shoulders to ears, hold, and drop. Repeat 5 times.', icon: StretchHorizontal, color: 'text-amber-500 bg-amber-50 dark:bg-amber-900/20' },
  { category: 'Mindset', title: 'Power Pause', description: 'Close your eyes and take 3 deep breaths before starting the next task.', icon: Brain, color: 'text-purple-500 bg-purple-50 dark:bg-purple-900/20' },
  { category: 'Breathing', title: '4-7-8 Technique', description: 'Inhale 4s, Hold 7s, Exhale 8s. Deeply relaxing.', icon: Wind, color: 'text-indigo-500 bg-indigo-50 dark:bg-indigo-900/20' },
  { category: 'Exercise', title: 'Wrist Circles', description: 'Rotate your wrists both ways to prevent carpal tunnel strain.', icon: StretchHorizontal, color: 'text-teal-500 bg-teal-50 dark:bg-teal-900/20' },
  { category: 'Posture', title: 'Chin Tucks', description: 'Pull your chin back slightly as if making a double chin to realign your neck.', icon: StretchHorizontal, color: 'text-blue-400 bg-blue-50 dark:bg-blue-900/10' },
  { category: 'Mindset', title: 'Single Tasking', description: 'Focus on one thing only. Multitasking is a productivity myth.', icon: Sparkles, color: 'text-orange-500 bg-orange-50 dark:bg-orange-900/20' },
  { category: 'Hydration', title: 'Lemon Water', description: 'Add a slice of lemon to your water for a natural energy boost.', icon: Droplets, color: 'text-yellow-500 bg-yellow-50 dark:bg-yellow-900/20' },
  { category: 'Eye Care', title: 'Palming', description: 'Rub hands together and place warm palms over closed eyes for 1 minute.', icon: Eye, color: 'text-slate-500 bg-slate-50 dark:bg-slate-800/50' },
  { category: 'Breathing', title: 'Belly Breathing', description: 'Place a hand on your stomach and feel it rise as you inhale.', icon: Wind, color: 'text-green-500 bg-green-50 dark:bg-green-900/20' },
  { category: 'Exercise', title: 'Desk Pushups', description: 'Lean on your desk and do 10 quick pushups to get blood flowing.', icon: StretchHorizontal, color: 'text-red-500 bg-red-50 dark:bg-red-900/20' },
  { category: 'Mindset', title: 'Gratitude', description: 'Think of one thing you are grateful for today to boost mood.', icon: Brain, color: 'text-pink-500 bg-pink-50 dark:bg-pink-900/20' },
  { category: 'Breathing', title: 'Alternate Nostril', description: 'Breathe through one nostril at a time for balanced focus.', icon: Wind, color: 'text-violet-500 bg-violet-50 dark:bg-violet-900/20' },
  { category: 'Exercise', title: 'Seated Twists', description: 'Twist your torso to each side while seated to relieve back tension.', icon: StretchHorizontal, color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20' },
  { category: 'Posture', title: 'Spine Stretch', description: 'Interlace fingers and push palms toward the ceiling.', icon: StretchHorizontal, color: 'text-indigo-400 bg-indigo-50 dark:bg-indigo-900/10' },
  { category: 'Hydration', title: 'Herbal Tea', description: 'Sip on peppermint or chamomile tea to stay hydrated and calm.', icon: Coffee, color: 'text-amber-700 bg-amber-50 dark:bg-amber-900/20' },
  { category: 'Eye Care', title: 'Blink Often', description: 'Deliberately blink 10 times to re-moisturize your eyes.', icon: Eye, color: 'text-blue-300 bg-blue-50 dark:bg-blue-900/10' },
  { category: 'Mindset', title: 'Small Wins', description: 'Celebrate completing a small subtask to keep momentum.', icon: Sparkles, color: 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20' },
  { category: 'Breathing', title: 'Equal Breath', description: 'Inhale for 5s, Exhale for 5s. Simple and effective.', icon: Wind, color: 'text-sky-500 bg-sky-50 dark:bg-sky-900/20' },
  { category: 'Exercise', title: 'Ankle Circles', description: 'Rotate your ankles under your desk to improve circulation.', icon: StretchHorizontal, color: 'text-orange-400 bg-orange-50 dark:bg-orange-900/10' },
  { category: 'Posture', title: 'Feet Flat', description: 'Ensure your feet are flat on the floor to support your lower back.', icon: StretchHorizontal, color: 'text-slate-600 bg-slate-100 dark:bg-slate-800' },
  { category: 'Hydration', title: 'Full Glass', description: 'Finish a full glass of water every 2 hours.', icon: Droplets, color: 'text-blue-600 bg-blue-50 dark:bg-blue-900/20' },
  { category: 'Eye Care', title: 'Distance Look', description: 'Look out a window at the furthest possible point for 30s.', icon: Eye, color: 'text-green-400 bg-green-50 dark:bg-green-900/10' },
  { category: 'Mindset', title: 'Nature Sound', description: 'Briefly listen to rain or bird sounds to lower stress levels.', icon: Brain, color: 'text-teal-600 bg-teal-50 dark:bg-teal-900/20' },
  { category: 'Breathing', title: 'Sigh of Relief', description: 'Inhale deeply and let out a loud, audible sigh to release stress.', icon: Wind, color: 'text-rose-400 bg-rose-50 dark:bg-rose-900/10' },
  { category: 'Exercise', title: 'Leg Extensions', description: 'Straighten your legs under the desk and hold for 5s.', icon: StretchHorizontal, color: 'text-blue-500 bg-blue-50 dark:bg-blue-900/20' },
  { category: 'Posture', title: 'Screen Height', description: 'Ensure the top third of your monitor is at eye level.', icon: StretchHorizontal, color: 'text-purple-400 bg-purple-50 dark:bg-purple-900/10' },
  { category: 'Hydration', title: 'Coconut Water', description: 'Great for electrolytes and mental clarity.', icon: Droplets, color: 'text-emerald-400 bg-emerald-50 dark:bg-emerald-900/10' },
  { category: 'Eye Care', title: 'Brightness Check', description: 'Adjust your screen brightness to match your room lighting.', icon: Eye, color: 'text-yellow-500 bg-yellow-50 dark:bg-yellow-900/20' },
  { category: 'Mindset', title: 'Unplugged Break', description: 'During your break, don\'t look at any screen—not even your phone.', icon: Moon, color: 'text-indigo-600 bg-indigo-50 dark:bg-indigo-900/20' },
  { category: 'Exercise', title: 'Finger Stretches', description: 'Spread fingers wide and then make a tight fist. Repeat.', icon: StretchHorizontal, color: 'text-pink-400 bg-pink-50 dark:bg-pink-900/10' },
  { category: 'Posture', title: 'Back Support', description: 'Place a small pillow behind your lower back for lumbar support.', icon: StretchHorizontal, color: 'text-amber-600 bg-amber-50 dark:bg-amber-900/20' },
  { category: 'Breathing', title: 'Humming Breath', description: 'Inhale, then hum as you exhale to vibrate and calm the brain.', icon: Wind, color: 'text-blue-700 bg-blue-50 dark:bg-blue-900/20' },
  { category: 'Mindset', title: 'I Am Capable', description: 'Repeat a positive affirmation to overcome procrastination.', icon: Sparkles, color: 'text-gold-500 bg-yellow-50 dark:bg-yellow-900/10' },
  { category: 'Exercise', title: 'Doorway Stretch', description: 'Stand in a doorway and lean forward to stretch your chest.', icon: StretchHorizontal, color: 'text-orange-600 bg-orange-50 dark:bg-orange-900/20' },
  { category: 'Hydration', title: 'Avoid Soda', description: 'Sugary drinks cause energy crashes; stick to water or tea.', icon: Droplets, color: 'text-red-400 bg-red-50 dark:bg-red-900/10' },
  { category: 'Eye Care', title: 'Eye Circles', description: 'Slowly roll your eyes in a large circle to each side.', icon: Eye, color: 'text-cyan-600 bg-cyan-50 dark:bg-cyan-900/20' },
  { category: 'Mindset', title: 'Focus Music', description: 'Try Lo-fi or binaural beats to help enter a flow state.', icon: Brain, color: 'text-indigo-500 bg-indigo-50 dark:bg-indigo-900/20' },
  { category: 'Exercise', title: 'Standing Desk', description: 'If possible, stand for 15 mins every hour to boost energy.', icon: StretchHorizontal, color: 'text-green-600 bg-green-50 dark:bg-green-900/20' },
  { category: 'Posture', title: 'Elbow Angle', description: 'Keep elbows at a 90-degree angle while typing.', icon: StretchHorizontal, color: 'text-slate-400 bg-slate-50 dark:bg-slate-800' },
  { category: 'Breathing', title: 'Straw Breath', description: 'Exhale through pursed lips as if through a straw.', icon: Wind, color: 'text-blue-400 bg-blue-50 dark:bg-blue-900/10' },
  { category: 'Mindset', title: '5-Minute Tidy', description: 'Clean your desk for 5 minutes for a clearer mind.', icon: Sparkles, color: 'text-amber-500 bg-amber-50 dark:bg-amber-900/20' },
  { category: 'Exercise', title: 'Knee-to-Chest', description: 'While seated, pull one knee to your chest and hold.', icon: StretchHorizontal, color: 'text-indigo-600 bg-indigo-50 dark:bg-indigo-900/20' },
  { category: 'Hydration', title: 'Cucumber Slices', description: 'Infuse your water with cucumber for a refreshing twist.', icon: Droplets, color: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20' },
  { category: 'Eye Care', title: 'Warm Compress', description: 'Use a warm cloth over your eyes at the end of the day.', icon: Eye, color: 'text-rose-300 bg-rose-50 dark:bg-rose-900/10' },
  { category: 'Mindset', title: 'Deep Work Only', description: 'Silence all notifications during your focus blocks.', icon: Brain, color: 'text-red-600 bg-red-50 dark:bg-red-900/20' },
  { category: 'Posture', title: 'Head Alignment', description: 'Keep your head directly above your shoulders, not leaning forward.', icon: StretchHorizontal, color: 'text-blue-600 bg-blue-50 dark:bg-blue-900/20' }
];

export function WellnessTips() {
  const [index, setIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const tip = TIPS[index];

  const next = useCallback(() => setIndex((i) => (i + 1) % TIPS.length), []);
  const prev = useCallback(() => setIndex((i) => (i - 1 + TIPS.length) % TIPS.length), []);

  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(next, 2500); // Shuffle every 2.5 seconds
    return () => clearInterval(timer);
  }, [next, isPaused]);

  return (
    <Card 
      className="overflow-hidden border-none shadow-lg bg-gradient-to-br from-white to-slate-50 dark:from-slate-950 dark:to-slate-900 transition-all duration-500 hover:shadow-xl"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <CardHeader className="pb-2 flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
            <CardTitle className="text-sm font-bold uppercase tracking-wider text-slate-500">Wellness Corner</CardTitle>
            {isPaused && <span className="text-[10px] bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded uppercase font-bold text-slate-400">Paused</span>}
        </div>
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
        <div 
            key={index}
            className="flex gap-4 items-start min-h-[80px] animate-in fade-in duration-700 slide-in-from-bottom-1"
        >
          <div className={`p-3 rounded-xl transition-all duration-500 ${tip.color} shadow-sm`}>
            <tip.icon className="h-5 w-5" />
          </div>
          <div className="space-y-1">
            <p className="text-[10px] font-bold uppercase tracking-widest opacity-60">{tip.category}</p>
            <h4 className="font-bold text-sm transition-colors duration-500">{tip.title}</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed max-w-[200px]">
              {tip.description}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

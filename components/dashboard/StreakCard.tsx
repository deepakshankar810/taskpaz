'use client';

import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Flame, Target, TrendingUp, Trophy } from 'lucide-react';
import { Task } from '@/lib/types';
import { isSameDay, subDays, differenceInDays } from 'date-fns';

interface StreakCardProps {
  tasks: Task[];
}

export function StreakCard({ tasks }: StreakCardProps) {
  const { streak, productivityScore, weeklyProgress } = useMemo(() => {
    const completedTasks = tasks.filter(t => t.status === 'completed' && t.completedAt);
    
    // Calculate Streak
    let currentStreak = 0;
    let checkDate = new Date();
    
    // Sort completed tasks by date descending
    const sortedCompleted = [...completedTasks].sort((a, b) => 
      new Date(b.completedAt!).getTime() - new Date(a.completedAt!).getTime()
    );

    // If no tasks completed today, check if streak still alive from yesterday
    const completedToday = sortedCompleted.some(t => isSameDay(new Date(t.completedAt!), new Date()));
    const completedYesterday = sortedCompleted.some(t => isSameDay(new Date(t.completedAt!), subDays(new Date(), 1)));

    if (completedToday || completedYesterday) {
      if (!completedToday) checkDate = subDays(new Date(), 1);
      
      let dateIter = checkDate;
      while (true) {
        const hadTaskOnDate = sortedCompleted.some(t => isSameDay(new Date(t.completedAt!), dateIter));
        if (hadTaskOnDate) {
          currentStreak++;
          dateIter = subDays(dateIter, 1);
        } else {
          break;
        }
      }
    }

    // Calculate Productivity Score (0-100)
    // Formula: (Completed in last 7 days / (Completed + Pending Due in last 7 days)) * 100
    const sevenDaysAgo = subDays(new Date(), 7);
    const recentCompleted = completedTasks.filter(t => new Date(t.completedAt!) >= sevenDaysAgo).length;
    const recentPending = tasks.filter(t => 
      t.status !== 'completed' && 
      t.dueDate && 
      new Date(t.dueDate) >= sevenDaysAgo && 
      new Date(t.dueDate) <= new Date()
    ).length;

    const score = (recentCompleted + recentPending) === 0 ? 0 : 
      Math.round((recentCompleted / (recentCompleted + recentPending)) * 100);

    return { 
      streak: currentStreak, 
      productivityScore: score,
      weeklyProgress: recentCompleted 
    };
  }, [tasks]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card className="bg-gradient-to-br from-orange-500 to-red-600 text-white border-none shadow-lg shadow-orange-500/20">
        <CardHeader className="pb-2">
          <CardTitle className="text-xs font-medium uppercase tracking-wider opacity-80">Daily Streak</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="text-3xl font-bold">{streak} Days</div>
            <div className="bg-white/20 p-2 rounded-full backdrop-blur-sm">
              <Flame className="h-6 w-6 text-white animate-pulse" />
            </div>
          </div>
          <p className="text-[10px] mt-2 opacity-70">Complete tasks daily to grow your streak!</p>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white border-none shadow-lg shadow-blue-500/20">
        <CardHeader className="pb-2">
          <CardTitle className="text-xs font-medium uppercase tracking-wider opacity-80">Productivity Score</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="text-3xl font-bold">{productivityScore}%</div>
            <div className="bg-white/20 p-2 rounded-full backdrop-blur-sm">
              <Target className="h-6 w-6 text-white" />
            </div>
          </div>
          <div className="w-full bg-white/20 h-1.5 rounded-full mt-3 overflow-hidden">
            <div 
              className="bg-white h-full transition-all duration-1000" 
              style={{ width: `${productivityScore}%` }}
            />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white border-none shadow-lg shadow-emerald-500/20">
        <CardHeader className="pb-2">
          <CardTitle className="text-xs font-medium uppercase tracking-wider opacity-80">Weekly Completion</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="text-3xl font-bold">{weeklyProgress} Tasks</div>
            <div className="bg-white/20 p-2 rounded-full backdrop-blur-sm">
              <Trophy className="h-6 w-6 text-white" />
            </div>
          </div>
          <p className="text-[10px] mt-2 opacity-70">Tasks completed in the last 7 days.</p>
        </CardContent>
      </Card>
    </div>
  );
}

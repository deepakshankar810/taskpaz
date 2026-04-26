'use client';

import { useMemo } from 'react';
import { format, subYears, startOfYear, eachDayOfInterval, isSameDay, getDay, startOfWeek, endOfWeek } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface HeatmapProps {
    data: { date: Date; count: number }[];
}

export function ProductivityHeatmap({ data }: HeatmapProps) {
    const today = new Date();
    const startDate = subYears(today, 1);
    
    const days = useMemo(() => {
        return eachDayOfInterval({ start: startDate, end: today });
    }, [startDate, today]);

    const getIntensity = (count: number) => {
        if (count === 0) return 'bg-slate-100 dark:bg-slate-800';
        if (count < 3) return 'bg-blue-200 dark:bg-blue-900/40';
        if (count < 6) return 'bg-blue-400 dark:bg-blue-700/60';
        if (count < 10) return 'bg-blue-600 dark:bg-blue-500/80';
        return 'bg-blue-800 dark:bg-blue-300';
    };

    // Group days by weeks for the grid
    const weeks = useMemo(() => {
        const weeksArr: Date[][] = [];
        let currentWeek: Date[] = [];
        
        // Align with start of week
        const calendarStart = startOfWeek(startDate);
        const calendarDays = eachDayOfInterval({ start: calendarStart, end: today });

        calendarDays.forEach((day) => {
            currentWeek.push(day);
            if (currentWeek.length === 7) {
                weeksArr.push(currentWeek);
                currentWeek = [];
            }
        });
        if (currentWeek.length > 0) weeksArr.push(currentWeek);
        return weeksArr;
    }, [startDate, today]);

    return (
        <Card className="w-full overflow-hidden">
            <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Activity Heatmap</CardTitle>
            </CardHeader>
            <CardContent>
                <TooltipProvider>
                    <div className="flex gap-1 overflow-x-auto pb-4 scrollbar-hide">
                        {weeks.map((week, weekIdx) => (
                            <div key={weekIdx} className="flex flex-col gap-1">
                                {week.map((day) => {
                                    const dayData = data.find(d => isSameDay(d.date, day));
                                    const count = dayData?.count || 0;
                                    const isCurrentMonth = day.getMonth() === today.getMonth();

                                    return (
                                        <Tooltip key={day.toISOString()}>
                                            <TooltipTrigger asChild>
                                                <div
                                                    className={`w-3 h-3 rounded-sm transition-colors ${getIntensity(count)} ${
                                                        day > today ? 'opacity-0' : ''
                                                    }`}
                                                />
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                <p className="text-xs">
                                                    {format(day, 'MMM d, yyyy')}: {count} tasks
                                                </p>
                                            </TooltipContent>
                                        </Tooltip>
                                    );
                                })}
                            </div>
                        ))}
                    </div>
                </TooltipProvider>
                <div className="flex items-center justify-end gap-2 mt-2 text-[10px] text-slate-500">
                    <span>Less</span>
                    <div className="flex gap-1">
                        <div className="w-2 h-2 rounded-sm bg-slate-100 dark:bg-slate-800" />
                        <div className="w-2 h-2 rounded-sm bg-blue-200 dark:bg-blue-900/40" />
                        <div className="w-2 h-2 rounded-sm bg-blue-400 dark:bg-blue-700/60" />
                        <div className="w-2 h-2 rounded-sm bg-blue-600 dark:bg-blue-500/80" />
                        <div className="w-2 h-2 rounded-sm bg-blue-800 dark:bg-blue-300" />
                    </div>
                    <span>More</span>
                </div>
            </CardContent>
        </Card>
    );
}

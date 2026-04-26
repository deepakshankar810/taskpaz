'use client';

import { useMemo } from 'react';
import {
    ScatterChart,
    Scatter,
    XAxis,
    YAxis,
    ZAxis,
    Tooltip,
    ResponsiveContainer,
    Cell
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const MOOD_VALUES: Record<string, number> = {
    'great': 5,
    'good': 4,
    'neutral': 3,
    'bad': 2,
    'terrible': 1
};

const MOOD_COLORS: Record<string, string> = {
    'great': '#10b981',
    'good': '#34d399',
    'neutral': '#fbbf24',
    'bad': '#f87171',
    'terrible': '#ef4444'
};

interface MoodCorrelationProps {
    data: { mood: string; tasksCompleted: number; date: string }[];
}

export function MoodProductivityCorrelation({ data }: MoodCorrelationProps) {
    const chartData = useMemo(() => {
        return data
            .filter(d => d.mood && MOOD_VALUES[d.mood])
            .map(d => ({
                x: MOOD_VALUES[d.mood],
                y: d.tasksCompleted,
                mood: d.mood,
                date: d.date
            }));
    }, [data]);

    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle className="text-sm font-medium">Mood vs. Productivity</CardTitle>
                <p className="text-xs text-slate-500">How your mood affects your output</p>
            </CardHeader>
            <CardContent className="h-[300px]">
                {chartData.length === 0 ? (
                    <div className="h-full flex items-center justify-center text-slate-400">
                        Log your mood in the Journal to see trends
                    </div>
                ) : (
                    <ResponsiveContainer width="100%" height="100%">
                        <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                            <XAxis
                                type="number"
                                dataKey="x"
                                name="Mood"
                                domain={[0, 6]}
                                tick={{ fontSize: 12 }}
                                tickFormatter={(val) => {
                                    const entry = Object.entries(MOOD_VALUES).find(([_, v]) => v === val);
                                    return entry ? entry[0] : '';
                                }}
                            />
                            <YAxis
                                type="number"
                                dataKey="y"
                                name="Tasks"
                                tick={{ fontSize: 12 }}
                                label={{ value: 'Tasks Completed', angle: -90, position: 'insideLeft', fontSize: 12 }}
                            />
                            <Tooltip
                                cursor={{ strokeDasharray: '3 3' }}
                                content={({ active, payload }) => {
                                    if (active && payload && payload.length) {
                                        const d = payload[0].payload;
                                        return (
                                            <div className="bg-white dark:bg-slate-900 p-2 border rounded-lg shadow-lg text-xs">
                                                <p className="font-bold">{d.date}</p>
                                                <p>Mood: <span className="capitalize">{d.mood}</span></p>
                                                <p>Tasks Completed: {d.y}</p>
                                            </div>
                                        );
                                    }
                                    return null;
                                }}
                            />
                            <Scatter name="Mood/Tasks" data={chartData}>
                                {chartData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={MOOD_COLORS[entry.mood]} />
                                ))}
                            </Scatter>
                        </ScatterChart>
                    </ResponsiveContainer>
                )}
            </CardContent>
        </Card>
    );
}

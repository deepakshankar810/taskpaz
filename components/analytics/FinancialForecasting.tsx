'use client';

import { useMemo } from 'react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    ReferenceLine
} from 'recharts';
import { format, addMonths, startOfMonth } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface ForecastingProps {
    currentBalance: number;
    monthlyTrend: number; // average income - average expense
    currency: string;
}

export function FinancialForecasting({ currentBalance, monthlyTrend, currency }: ForecastingProps) {
    const forecastData = useMemo(() => {
        const data = [];
        const now = new Date();
        
        // Past month (for context)
        data.push({
            name: 'Current',
            balance: currentBalance,
            isForecast: false
        });

        // Forecast next 3 months
        for (let i = 1; i <= 3; i++) {
            const date = addMonths(now, i);
            data.push({
                name: format(date, 'MMM'),
                balance: currentBalance + (monthlyTrend * i),
                isForecast: true
            });
        }
        return data;
    }, [currentBalance, monthlyTrend]);

    const formatCurrency = (val: number) => {
        return `${currency}${val.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
    };

    const isPositive = monthlyTrend >= 0;

    return (
        <Card className="w-full">
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle className="text-sm font-medium">3-Month Forecast</CardTitle>
                    <p className="text-xs text-slate-500">Based on your spending habits</p>
                </div>
                <div className={`flex items-center gap-1 text-sm font-bold ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
                    {isPositive ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                    {formatCurrency(Math.abs(monthlyTrend))}/mo
                </div>
            </CardHeader>
            <CardContent className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={forecastData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                        <XAxis 
                            dataKey="name" 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{ fontSize: 12, fill: '#64748b' }}
                        />
                        <YAxis 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{ fontSize: 12, fill: '#64748b' }}
                            tickFormatter={(val) => `${currency}${val/1000}k`}
                        />
                        <Tooltip 
                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                            formatter={(val: number) => [formatCurrency(val), 'Projected Balance']}
                        />
                        <ReferenceLine x="Current" stroke="#64748b" strokeDasharray="3 3" />
                        <Line 
                            type="monotone" 
                            dataKey="balance" 
                            stroke={isPositive ? '#10b981' : '#ef4444'} 
                            strokeWidth={3}
                            dot={{ r: 4, strokeWidth: 2, fill: '#fff' }}
                            activeDot={{ r: 6 }}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
}

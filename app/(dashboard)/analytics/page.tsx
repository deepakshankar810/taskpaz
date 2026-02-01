'use client';

import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity } from 'lucide-react';
import { useTasksContext } from '@/components/providers/TasksProvider';
import { useFinance } from '@/hooks/useFinance';
import { useAuth } from '@/components/providers/AuthProvider';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  AreaChart,
  Area
} from 'recharts';
import { startOfDay, subDays, format, isSameDay, startOfMonth, subMonths, isSameMonth } from 'date-fns';
import { toDate } from '@/lib/utils';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658'];
const PRIORITY_COLORS = {
  high: '#ef4444',   // Red-500
  medium: '#eab308', // Yellow-500
  low: '#3b82f6',    // Blue-500
  urgent: '#7c3aed'  // Violet-600
};

export default function AnalyticsPage() {
  const { user } = useAuth();
  const { tasks, stats } = useTasksContext();
  const { transactions } = useFinance(user?.uid);
  const [currency, setCurrency] = useMemo(() => {
    if (typeof window !== 'undefined') {
      return [localStorage.getItem('finance_currency') || '$', () => { }];
    }
    return ['$', () => { }];
  }, []);

  const formatCurrency = (val: number) => {
    const prefix = currency.length > 1 ? `${currency} ` : currency;
    return `${prefix}${val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  // 1. Efficiency (Completion Rate)
  const completionRate = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;

  // 2. Task Trend Data (Last 30 Days)
  const taskTrendData = useMemo(() => {
    const last30Days = Array.from({ length: 30 }, (_, i) => {
      const d = subDays(new Date(), 29 - i);
      return startOfDay(d);
    });

    return last30Days.map(date => {
      const count = tasks.filter(t => {
        if (t.status !== 'completed') return false;

        const completionDate = toDate(t.completedAt) || toDate(t.updatedAt);
        if (!completionDate) return false;

        return isSameDay(completionDate, date);
      }).length;

      return {
        name: format(date, 'MMM d'), // e.g., "Feb 1"
        completed: count
      };
    });
  }, [tasks]);

  // 3. Category Data
  const categoryData = useMemo(() => {
    const counts: Record<string, number> = {};
    tasks.forEach(t => {
      const cat = t.category || 'Uncategorized';
      counts[cat] = (counts[cat] || 0) + 1;
    });

    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [tasks]);

  // 4. Priority Data
  const priorityData = useMemo(() => {
    const counts: Record<string, number> = { high: 0, medium: 0, low: 0, urgent: 0 };
    tasks.forEach(t => {
      const p = t.priority || 'low';
      if (counts[p] !== undefined) counts[p]++;
    });
    return Object.entries(counts)
      .filter(([_, value]) => value > 0)
      .map(([name, value]) => ({ name, value }));
  }, [tasks]);

  // 5. Financial Trend (Last 6 Months)
  const financialTrendData = useMemo(() => {
    const last6Months = Array.from({ length: 6 }, (_, i) => {
      const d = subMonths(new Date(), 5 - i);
      return startOfMonth(d);
    });

    return last6Months.map(date => {
      const monthlyTransactions = transactions.filter(t => {
        const transDate = toDate(t.date);
        return transDate && isSameMonth(transDate, date);
      });
      const income = monthlyTransactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + Number(t.amount), 0);
      const expense = monthlyTransactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + Number(t.amount), 0);

      return {
        name: format(date, 'MMM'),
        income,
        expense
      };
    });
  }, [transactions]);

  // 6. Expense Breakdown Data
  const categoryChartData = useMemo(() => {
    const categories: Record<string, number> = {};
    const details: Record<string, string[]> = {};
    const now = new Date();
    const expenses = transactions.filter(t => {
      if (t.type !== 'expense') return false;
      const d = toDate(t.date);
      return d && isSameMonth(d, now);
    });

    expenses.forEach(t => {
      const amount = Number(t.amount);
      categories[t.category] = (categories[t.category] || 0) + amount;

      if (t.description) {
        if (!details[t.category]) details[t.category] = [];
        if (!details[t.category].includes(t.description)) {
          details[t.category].push(t.description);
        }
      }
    });

    return Object.entries(categories)
      .map(([name, value]) => ({
        name,
        value,
        purpose: details[name] ? details[name].slice(0, 2).map(p => p.length > 20 ? p.substring(0, 17) + '...' : p).join(', ') : ''
      }))
      .sort((a, b) => b.value - a.value);
  }, [transactions]);

  const topCategories = categoryChartData.slice(0, 3);


  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Analytics</h1>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Efficiency Rate</CardTitle>
            <Activity className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completionRate}%</div>
            <p className="text-xs text-slate-500">of total tasks completed</p>
          </CardContent>
        </Card>
      </div>

      {/* Row 1: Task Trends & Priority */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
        {/* Task Trend Bar Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Task Completion (Last 30 Days)</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px] w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={taskTrendData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 10, fill: '#888888' }}
                  axisLine={false}
                  tickLine={false}
                  interval={4} // Show every 5th label to avoid crowding
                />
                <YAxis tick={{ fontSize: 12, fill: '#888888' }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Bar dataKey="completed" fill="#3b82f6" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Priority Donut Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Task Priority Breakdown</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px] w-full mt-4">
            {priorityData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-slate-400">No tasks found</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={priorityData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {priorityData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={PRIORITY_COLORS[entry.name as keyof typeof PRIORITY_COLORS] || COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend verticalAlign="bottom" height={36} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Row 2: Tasks vs Financial Overview */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
        {/* Category Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Task Category Distribution</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px] w-full mt-4">
            {categoryData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-slate-400">
                No data available
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend verticalAlign="bottom" height={36} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Financial Area Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Financial Health (Last 6 Months)</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px] w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={financialTrendData}>
                <defs>
                  <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22c55e" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#888888' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: '#888888' }} axisLine={false} tickLine={false} />
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Area type="monotone" dataKey="income" stroke="#22c55e" fillOpacity={1} fill="url(#colorIncome)" />
                <Area type="monotone" dataKey="expense" stroke="#ef4444" fillOpacity={1} fill="url(#colorExpense)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col pt-6 border-t">
        <h2 className="text-xl font-bold">Financial Insights</h2>
        <p className="text-sm text-slate-500">Breakdown for {format(new Date(), 'MMMM yyyy')}</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Expense Breakdown</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            {categoryChartData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-slate-400 font-medium">
                No expense data to display
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {categoryChartData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number) => formatCurrency(value)}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Legend verticalAlign="bottom" height={36} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Spending</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topCategories.length === 0 ? (
                <p className="text-slate-400 text-sm">Add expenses to see insights</p>
              ) : (
                topCategories.map((cat, i) => (
                  <div key={cat.name} className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                      <span className="font-medium truncate text-sm">
                        {cat.name} {cat.purpose && <span className="text-xs text-slate-400 font-normal">({cat.purpose})</span>}
                      </span>
                    </div>
                    <span className="text-sm text-slate-500 whitespace-nowrap flex-shrink-0">{formatCurrency(cat.value)}</span>
                  </div>
                ))
              )}
              {categoryChartData.length > 0 && (
                <div className="pt-4 mt-4 border-t text-sm text-slate-500 italic">
                  💡 Note: Your highest spend this month is in <strong>{topCategories[0].name}</strong>. Keeping an eye on this could help you stay on track!
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

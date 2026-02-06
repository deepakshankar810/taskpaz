import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import { isSameMonth } from 'date-fns';
import { Transaction, Subscription, SavingsGoal } from '@/lib/types';
import { docToTransaction, docToSubscription, docToSavingsGoal } from '@/lib/db/finance';
import { toDate } from '@/lib/utils';
import { toast } from 'sonner';

export function useFinance(userId: string | undefined | null) {
    const [transactions, setTransactions] = useState<Transaction[]>(() => {
        if (typeof window !== 'undefined' && userId) {
            const cached = localStorage.getItem(`finance_${userId}`);
            if (cached) {
                try {
                    const parsed = JSON.parse(cached);
                    return parsed.map((t: any) => ({
                        ...t,
                        date: new Date(t.date),
                        createdAt: new Date(t.createdAt),
                    }));
                } catch (e) {
                    return [];
                }
            }
        }
        return [];
    });

    const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
    const [savingsGoals, setSavingsGoals] = useState<SavingsGoal[]>([]);
    const [loading, setLoading] = useState(!transactions.length);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        if (!userId) {
            setTransactions([]);
            setLoading(false);
            return;
        }

        const fetchFinanceData = async () => {
            try {
                // Parallel fetch for speed
                const [transRes, subRes, goalRes] = await Promise.all([
                    supabase
                        .from('transactions')
                        .select('*')
                        .eq('user_id', userId)
                        .order('date', { ascending: false }),
                    supabase
                        .from('subscriptions')
                        .select('*')
                        .eq('user_id', userId)
                        .order('created_at', { ascending: false }),
                    supabase
                        .from('savings_goals')
                        .select('*')
                        .eq('user_id', userId)
                        .order('created_at', { ascending: false })
                ]);

                if (transRes.error) throw transRes.error;
                if (subRes.error) throw subRes.error;
                if (goalRes.error) throw goalRes.error;

                const mappedTrans = transRes.data.map(docToTransaction);
                setTransactions(mappedTrans);
                if (typeof window !== 'undefined') {
                    localStorage.setItem(`finance_${userId}`, JSON.stringify(mappedTrans));
                }

                setSubscriptions(subRes.data.map(docToSubscription));
                setSavingsGoals(goalRes.data.map(docToSavingsGoal));

                setLoading(false);
            } catch (err: any) {
                console.error('Error fetching finance data:', err);
                const msg = err.message || 'Check console for details';
                toast.error(`Failed to sync finance data: ${msg}`);
                setError(err);
                setLoading(false);
            }
        };

        fetchFinanceData();

        // Real-time incremental updates
        const transChannel = supabase
            .channel(`finance_trans_${userId}`)
            .on('postgres_changes', { event: '*', schema: 'public', table: 'transactions', filter: `user_id=eq.${userId}` }, (payload) => {
                if (payload.eventType === 'INSERT') {
                    setTransactions(prev => [docToTransaction(payload.new), ...prev]);
                } else if (payload.eventType === 'UPDATE') {
                    setTransactions(prev => prev.map(t => t.id === payload.new.id ? docToTransaction(payload.new) : t));
                } else if (payload.eventType === 'DELETE') {
                    setTransactions(prev => prev.filter(t => t.id === payload.old.id));
                }
            })
            .subscribe();

        const subChannel = supabase
            .channel(`finance_sub_${userId}`)
            .on('postgres_changes', { event: '*', schema: 'public', table: 'subscriptions', filter: `user_id=eq.${userId}` }, (payload) => {
                if (payload.eventType === 'INSERT') {
                    setSubscriptions(prev => [docToSubscription(payload.new), ...prev]);
                } else if (payload.eventType === 'UPDATE') {
                    setSubscriptions(prev => prev.map(s => s.id === payload.new.id ? docToSubscription(payload.new) : s));
                } else if (payload.eventType === 'DELETE') {
                    setSubscriptions(prev => prev.filter(s => s.id === payload.old.id));
                }
            })
            .subscribe();

        const goalChannel = supabase
            .channel(`finance_goal_${userId}`)
            .on('postgres_changes', { event: '*', schema: 'public', table: 'savings_goals', filter: `user_id=eq.${userId}` }, (payload) => {
                if (payload.eventType === 'INSERT') {
                    setSavingsGoals(prev => [docToSavingsGoal(payload.new), ...prev]);
                } else if (payload.eventType === 'UPDATE') {
                    setSavingsGoals(prev => prev.map(g => g.id === payload.new.id ? docToSavingsGoal(payload.new) : g));
                } else if (payload.eventType === 'DELETE') {
                    setSavingsGoals(prev => prev.filter(g => g.id === payload.old.id));
                }
            })
            .subscribe();

        return () => {
            supabase.removeChannel(transChannel);
            supabase.removeChannel(subChannel);
            supabase.removeChannel(goalChannel);
        };
    }, [userId]);

    const stats = useMemo(() => {
        const now = new Date();
        return transactions.reduce(
            (acc, curr) => {
                const amount = Number(curr.amount);
                const d = toDate(curr.date);
                const isCurrentMonth = d && isSameMonth(d, now);

                if (curr.type === 'income') {
                    acc.income += amount;
                    acc.balance += amount;
                    if (isCurrentMonth) {
                        acc.monthlyIncome += amount;
                        acc.monthlyBalance += amount;
                    }
                } else {
                    acc.expenses += amount;
                    acc.balance -= amount;
                    if (isCurrentMonth) {
                        acc.monthlyExpenses += amount;
                        acc.monthlyBalance -= amount;
                    }
                }
                return acc;
            },
            { income: 0, expenses: 0, balance: 0, monthlyIncome: 0, monthlyExpenses: 0, monthlyBalance: 0 }
        );
    }, [transactions]);

    return {
        transactions,
        subscriptions,
        savingsGoals,
        stats,
        loading,
        error,
        setTransactions,
        setSubscriptions,
        setSavingsGoals
    };
}

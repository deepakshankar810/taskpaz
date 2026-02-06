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
                // Fetch transactions
                const { data: transData, error: transErr } = await supabase
                    .from('transactions')
                    .select('*')
                    .eq('user_id', userId)
                    .order('date', { ascending: false });

                if (transErr) throw transErr;
                const mappedTrans = transData.map(docToTransaction);
                setTransactions(mappedTrans);
                if (typeof window !== 'undefined') {
                    localStorage.setItem(`finance_${userId}`, JSON.stringify(mappedTrans));
                }

                // Fetch subscriptions
                const { data: subData, error: subErr } = await supabase
                    .from('subscriptions')
                    .select('*')
                    .eq('user_id', userId)
                    .order('created_at', { ascending: false });

                if (subErr) throw subErr;
                setSubscriptions(subData.map(docToSubscription));

                // Fetch savings goals
                const { data: goalData, error: goalErr } = await supabase
                    .from('savings_goals')
                    .select('*')
                    .eq('user_id', userId)
                    .order('created_at', { ascending: false });

                if (goalErr) throw goalErr;
                setSavingsGoals(goalData.map(docToSavingsGoal));

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

        // Real-time subscriptions
        const transChannel = supabase
            .channel(`finance_trans_${userId}`)
            .on('postgres_changes', { event: '*', schema: 'public', table: 'transactions', filter: `user_id=eq.${userId}` }, fetchFinanceData)
            .subscribe();

        const subChannel = supabase
            .channel(`finance_sub_${userId}`)
            .on('postgres_changes', { event: '*', schema: 'public', table: 'subscriptions', filter: `user_id=eq.${userId}` }, fetchFinanceData)
            .subscribe();

        const goalChannel = supabase
            .channel(`finance_goal_${userId}`)
            .on('postgres_changes', { event: '*', schema: 'public', table: 'savings_goals', filter: `user_id=eq.${userId}` }, fetchFinanceData)
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

    return { transactions, subscriptions, savingsGoals, stats, loading, error };
}

import { useState, useEffect, useMemo } from 'react';
import {
    collection,
    query,
    where,
    orderBy,
    onSnapshot,
    Unsubscribe
} from 'firebase/firestore';
import { isSameMonth } from 'date-fns';
import { db } from '@/lib/firebase';
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
                    return JSON.parse(cached);
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

        if (!transactions.length) {
            setLoading(true);
        }

        const q = query(
            collection(db, 'transactions'),
            where('userId', '==', userId),
            orderBy('date', 'desc')
        );

        const subQ = query(
            collection(db, 'subscriptions'),
            where('userId', '==', userId),
            orderBy('createdAt', 'desc')
        );

        const goalQ = query(
            collection(db, 'savingsGoals'),
            where('userId', '==', userId),
            orderBy('createdAt', 'desc')
        );

        let unsubscribeTransactions: Unsubscribe;
        let unsubscribeSubscriptions: Unsubscribe;
        let unsubscribeGoals: Unsubscribe;

        try {
            unsubscribeTransactions = onSnapshot(q, {
                next: (snapshot) => {
                    const data = snapshot.docs.map(docToTransaction);
                    if (typeof window !== 'undefined') {
                        localStorage.setItem(`finance_${userId}`, JSON.stringify(data));
                    }
                    setTransactions(data);
                    setLoading(false);
                },
                error: (err) => {
                    console.error('Error fetching transactions:', err);
                    console.error('User ID:', userId);
                    toast.error('Failed to sync transactions. Check console for details.');
                    setError(err);
                    setLoading(false);
                }
            });

            unsubscribeSubscriptions = onSnapshot(subQ, {
                next: (snapshot) => {
                    const data = snapshot.docs.map(docToSubscription);
                    setSubscriptions(data);
                },
                error: (err) => {
                    console.error('Error fetching subscriptions:', err);
                    toast.error('Failed to sync subscriptions.');
                }
            });

            unsubscribeGoals = onSnapshot(goalQ, {
                next: (snapshot) => {
                    const data = snapshot.docs.map(docToSavingsGoal);
                    setSavingsGoals(data);
                },
                error: (err) => {
                    console.error('Error fetching savings goals:', err);
                    toast.error('Failed to sync savings goals.');
                }
            });
        } catch (err: any) {
            console.error('Error setting up finance listeners:', err);
            setError(err);
            setLoading(false);
        }

        return () => {
            if (unsubscribeTransactions) unsubscribeTransactions();
            if (unsubscribeSubscriptions) unsubscribeSubscriptions();
            if (unsubscribeGoals) unsubscribeGoals();
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

import { useState, useEffect, useMemo } from 'react';
import {
    collection,
    query,
    where,
    orderBy,
    onSnapshot,
    Unsubscribe
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Transaction } from '@/lib/types';
import { docToTransaction } from '@/lib/db/finance';

export function useFinance(userId: string | undefined | null) {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        if (!userId) {
            setTransactions([]);
            setLoading(false);
            return;
        }

        setLoading(true);

        const q = query(
            collection(db, 'transactions'),
            where('userId', '==', userId),
            orderBy('date', 'desc')
        );

        let unsubscribe: Unsubscribe;

        try {
            unsubscribe = onSnapshot(q, {
                next: (snapshot) => {
                    const data = snapshot.docs.map(docToTransaction);
                    setTransactions(data);
                    setLoading(false);
                    setError(null);
                },
                error: (err) => {
                    console.error('Error fetching transactions:', err);
                    setError(err);
                    setLoading(false);
                }
            });
        } catch (err: any) {
            console.error('Error setting up finance listener:', err);
            setError(err);
            setLoading(false);
        }

        return () => {
            if (unsubscribe) unsubscribe();
        };
    }, [userId]);

    const stats = useMemo(() => {
        return transactions.reduce(
            (acc, curr) => {
                const amount = Number(curr.amount);
                if (curr.type === 'income') {
                    acc.income += amount;
                    acc.balance += amount;
                } else {
                    acc.expenses += amount;
                    acc.balance -= amount;
                }
                return acc;
            },
            { income: 0, expenses: 0, balance: 0 }
        );
    }, [transactions]);

    return { transactions, stats, loading, error };
}

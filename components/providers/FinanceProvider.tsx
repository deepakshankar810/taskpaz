'use client';

import { createContext, useContext, ReactNode, useCallback, useMemo } from 'react';
import { useAuth } from '@/components/providers/AuthProvider';
import { useFinance as useFinanceHook } from '@/hooks/useFinance';
import { Transaction, Subscription, SavingsGoal } from '@/lib/types';

interface FinanceContextType {
    transactions: Transaction[];
    subscriptions: Subscription[];
    savingsGoals: SavingsGoal[];
    salaryDay: number;
    stats: {
        income: number;
        expenses: number;
        balance: number;
        monthlyIncome: number;
        monthlyExpenses: number;
        monthlyBalance: number;
    };
    loading: boolean;
    error: Error | null;
    setTransactions: React.Dispatch<React.SetStateAction<Transaction[]>>;
    setSubscriptions: React.Dispatch<React.SetStateAction<Subscription[]>>;
    setSavingsGoals: React.Dispatch<React.SetStateAction<SavingsGoal[]>>;
    setSalaryDay: React.Dispatch<React.SetStateAction<number>>;
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

export function FinanceProvider({ children }: { children: ReactNode }) {
    const { user } = useAuth();
    const financeData = useFinanceHook(user?.id);

    return (
        <FinanceContext.Provider value={financeData}>
            {children}
        </FinanceContext.Provider>
    );
}

export function useFinanceContext() {
    const context = useContext(FinanceContext);
    if (context === undefined) {
        throw new Error('useFinanceContext must be used within a FinanceProvider');
    }
    return context;
}

import { supabase } from '@/lib/supabase';
import { CreateTransactionInput, Transaction, Subscription, SavingsGoal } from '@/lib/types';
import { addMonths, addYears, isBefore, startOfDay } from 'date-fns';

// Transactions
export const addTransaction = async (userId: string, data: CreateTransactionInput) => {
    const { data: result, error } = await supabase
        .from('transactions')
        .insert([{
            user_id: userId,
            type: data.type,
            amount: data.amount,
            category: data.category,
            description: data.description,
            date: data.date.toISOString().split('T')[0],
        }])
        .select()
        .single();

    if (error) throw error;
    return result;
};

export const deleteTransaction = async (transactionId: string) => {
    const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('id', transactionId);

    if (error) throw error;
};

export const updateTransaction = async (transactionId: string, data: Partial<CreateTransactionInput>) => {
    const updateData: any = { ...data };
    if (data.date) {
        updateData.date = data.date.toISOString().split('T')[0];
    }

    const { error } = await supabase
        .from('transactions')
        .update(updateData)
        .eq('id', transactionId);

    if (error) throw error;
};

export const docToTransaction = (item: any): Transaction => {
    return {
        id: item.id,
        userId: item.user_id,
        type: item.type,
        amount: item.amount,
        category: item.category,
        description: item.description,
        date: new Date(item.date),
        createdAt: new Date(item.created_at),
    } as unknown as Transaction;
};

// Subscriptions
export const addSubscription = async (userId: string, data: Omit<Subscription, 'id' | 'userId' | 'createdAt'>) => {
    const { data: result, error } = await supabase
        .from('subscriptions')
        .insert([{
            user_id: userId,
            name: data.name,
            amount: data.amount,
            billing_cycle: (data as any).billingCycle || (data as any).billing_cycle,
            billing_interval: (data as any).billingInterval || (data as any).billing_interval || 1,
            category: data.category,
            next_billing_date: data.nextBillingDate ? data.nextBillingDate.toISOString().split('T')[0] : (data as any).next_billing_date,
            active: data.active !== undefined ? data.active : true,
        }])
        .select()
        .single();

    if (error) throw error;
    return result;
};

export const updateSubscription = async (id: string, data: Partial<Subscription>) => {
    const updateData: any = {
        updated_at: new Date().toISOString()
    };
    if (data.name) updateData.name = data.name;
    if (data.amount) updateData.amount = data.amount;
    if (data.billingCycle || (data as any).billing_cycle) updateData.billing_cycle = data.billingCycle || (data as any).billing_cycle;
    if (data.billingInterval || (data as any).billing_interval) updateData.billing_interval = data.billingInterval || (data as any).billing_interval;
    if (data.category) updateData.category = data.category;
    if (data.nextBillingDate) updateData.next_billing_date = data.nextBillingDate.toISOString().split('T')[0];
    else if ((data as any).next_billing_date) updateData.next_billing_date = (data as any).next_billing_date;
    if (data.active !== undefined) updateData.active = data.active;

    const { error } = await supabase
        .from('subscriptions')
        .update(updateData)
        .eq('id', id);

    if (error) throw error;
};

export const deleteSubscription = async (id: string) => {
    const { error } = await supabase
        .from('subscriptions')
        .delete()
        .eq('id', id);

    if (error) throw error;
};

export const docToSubscription = (item: any): Subscription => {
    return {
        id: item.id,
        userId: item.user_id,
        name: item.name,
        amount: item.amount,
        billingCycle: item.billing_cycle,
        billingInterval: item.billing_interval || 1,
        category: item.category,
        nextBillingDate: new Date(item.next_billing_date),
        active: item.active,
        createdAt: new Date(item.created_at),
        updatedAt: item.updated_at ? new Date(item.updated_at) : undefined,
    } as unknown as Subscription;
};

export const refreshSubscriptionDate = async (subscription: Subscription) => {
    let nextDate = new Date(subscription.nextBillingDate);
    const today = startOfDay(new Date());

    // If it's today or in the past, move to next cycle
    // Note: We use isBefore(nextDate, today) because if it's today, 
    // it's still technically valid until the day is over, 
    // but usually subscriptions refresh ON the billing date.
    // Let's check if it's before today.
    if (isBefore(nextDate, today)) {
        while (isBefore(nextDate, today)) {
            if (subscription.billingCycle === 'monthly') {
                nextDate = addMonths(nextDate, subscription.billingInterval || 1);
            } else {
                nextDate = addYears(nextDate, subscription.billingInterval || 1);
            }
        }

        await updateSubscription(subscription.id, { nextBillingDate: nextDate });
        return nextDate;
    }
    return null;
};

// Savings Goals
export const addSavingsGoal = async (userId: string, data: Omit<SavingsGoal, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
    const { data: result, error } = await supabase
        .from('savings_goals')
        .insert([{
            user_id: userId,
            name: data.name,
            target_amount: (data as any).targetAmount || (data as any).target_amount,
            current_amount: (data as any).currentAmount || (data as any).current_amount || 0,
            deadline: data.deadline ? data.deadline.toISOString().split('T')[0] : null,
            is_completed: (data as any).isCompleted || (data as any).is_completed || false,
        }])
        .select()
        .single();

    if (error) throw error;
    return result;
};

export const updateSavingsGoal = async (id: string, data: Partial<SavingsGoal>) => {
    const updateData: any = {
        updated_at: new Date().toISOString()
    };
    if (data.name) updateData.name = data.name;
    if ((data as any).targetAmount) updateData.target_amount = (data as any).targetAmount;
    if ((data as any).currentAmount !== undefined) updateData.current_amount = (data as any).currentAmount;
    if (data.deadline) updateData.deadline = data.deadline.toISOString().split('T')[0];
    if ((data as any).isCompleted !== undefined) updateData.is_completed = (data as any).isCompleted;

    const { error } = await supabase
        .from('savings_goals')
        .update(updateData)
        .eq('id', id);

    if (error) throw error;
};

export const deleteSavingsGoal = async (id: string) => {
    const { error } = await supabase
        .from('savings_goals')
        .delete()
        .eq('id', id);

    if (error) throw error;
};

export const docToSavingsGoal = (item: any): SavingsGoal => {
    return {
        id: item.id,
        userId: item.user_id,
        name: item.name,
        targetAmount: item.target_amount,
        currentAmount: item.current_amount,
        deadline: item.deadline ? new Date(item.deadline) : null,
        isCompleted: item.is_completed,
        createdAt: new Date(item.created_at),
        updatedAt: new Date(item.updated_at),
    } as unknown as SavingsGoal;
};

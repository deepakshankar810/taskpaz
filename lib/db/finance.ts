import { db } from '@/lib/firebase';
import {
    collection,
    doc,
    addDoc,
    deleteDoc,
    updateDoc,
    serverTimestamp,
    Timestamp
} from 'firebase/firestore';
import { CreateTransactionInput, Transaction, Subscription, SavingsGoal } from '@/lib/types';

export const addTransaction = async (userId: string, data: CreateTransactionInput) => {
    return addDoc(collection(db, 'transactions'), {
        userId,
        ...data,
        createdAt: serverTimestamp(),
        // Ensure date is a Timestamp for Firestore
        date: Timestamp.fromDate(data.date),
    });
};

export const deleteTransaction = async (transactionId: string) => {
    return deleteDoc(doc(db, 'transactions', transactionId));
};

export const updateTransaction = async (transactionId: string, data: Partial<CreateTransactionInput>) => {
    const updateData: any = { ...data };
    if (data.date) {
        updateData.date = Timestamp.fromDate(data.date);
    }
    return updateDoc(doc(db, 'transactions', transactionId), updateData);
};

export const docToTransaction = (docSnap: any): Transaction => {
    const data = docSnap.data();
    return {
        id: docSnap.id,
        ...data,
        date: data.date?.toDate() || new Date(),
        createdAt: data.createdAt?.toDate() || new Date(),
    } as Transaction;
};

// Subscriptions
export const addSubscription = async (userId: string, data: Omit<Subscription, 'id' | 'userId' | 'createdAt'>) => {
    return addDoc(collection(db, 'subscriptions'), {
        userId,
        ...data,
        nextBillingDate: Timestamp.fromDate(data.nextBillingDate),
        active: true,
        createdAt: serverTimestamp(),
    });
};

export const updateSubscription = async (id: string, data: Partial<Subscription>) => {
    const updateData: any = { ...data };
    if (data.nextBillingDate) {
        updateData.nextBillingDate = Timestamp.fromDate(data.nextBillingDate);
    }
    return updateDoc(doc(db, 'subscriptions', id), updateData);
};

export const deleteSubscription = async (id: string) => {
    return deleteDoc(doc(db, 'subscriptions', id));
};

export const docToSubscription = (docSnap: any): Subscription => {
    const data = docSnap.data();
    return {
        id: docSnap.id,
        ...data,
        nextBillingDate: data.nextBillingDate?.toDate() || new Date(),
        createdAt: data.createdAt?.toDate() || new Date(),
    } as Subscription;
};

// Savings Goals
export const addSavingsGoal = async (userId: string, data: Omit<SavingsGoal, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
    return addDoc(collection(db, 'savingsGoals'), {
        userId,
        ...data,
        deadline: data.deadline ? Timestamp.fromDate(data.deadline) : null,
        isCompleted: false,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
    });
};

export const updateSavingsGoal = async (id: string, data: Partial<SavingsGoal>) => {
    const updateData: any = { ...data, updatedAt: serverTimestamp() };
    if (data.deadline) {
        updateData.deadline = Timestamp.fromDate(data.deadline);
    }
    return updateDoc(doc(db, 'savingsGoals', id), updateData);
};

export const deleteSavingsGoal = async (id: string) => {
    return deleteDoc(doc(db, 'savingsGoals', id));
};

export const docToSavingsGoal = (docSnap: any): SavingsGoal => {
    const data = docSnap.data();
    return {
        id: docSnap.id,
        ...data,
        deadline: data.deadline?.toDate() || null,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
    } as SavingsGoal;
};

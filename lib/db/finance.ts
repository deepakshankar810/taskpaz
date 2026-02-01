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
import { CreateTransactionInput, Transaction } from '@/lib/types';

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

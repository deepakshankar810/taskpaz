import {
  collection,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  getDoc,
  query,
  where,
  orderBy,
  Timestamp,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Task, CreateTaskInput, UpdateTaskInput, TaskStatus, TaskPriority, TaskCategory } from '@/lib/types';

const TASKS_COLLECTION = 'tasks';

// Helper to convert Firestore doc to Task
const docToTask = (docSnap: any): Task => {
  const data = docSnap.data();
  if (!data) return {} as Task;
  return {
    id: docSnap.id,
    ...data,
    createdAt: data.createdAt?.toDate?.() || new Date(),
    updatedAt: data.updatedAt?.toDate?.() || new Date(),
    dueDate: data.dueDate?.toDate?.() || undefined,
    completedAt: data.completedAt?.toDate?.() || undefined,
  } as Task;
};

export const createTask = async (userId: string, input: CreateTaskInput, id?: string): Promise<Task> => {
  try {
    console.log('[createTask] Starting...', { userId, title: input.title });
    const tasksRef = collection(db, TASKS_COLLECTION);
    const docRef = id ? doc(tasksRef, id) : doc(tasksRef); // Use provided ID or generate one

    // Build task object
    const newTaskData = {
      userId,
      title: input.title,
      description: input.description || '',
      status: 'pending' as TaskStatus,
      priority: input.priority || 'medium' as TaskPriority,
      category: input.category || 'personal' as TaskCategory,
      dueDate: input.dueDate ? Timestamp.fromDate(input.dueDate) : null,
      projectId: input.projectId || null,
      tags: input.tags || [],
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    // Single write operation (async)
    // We don't await getDoc afterwards because it causes a heavy delay
    await setDoc(docRef, newTaskData);
    console.log('[createTask] Doc set:', docRef.id);

    // Return the task immediately with local fields for Optimistic UI support
    return {
      id: docRef.id,
      ...newTaskData,
      createdAt: new Date(),
      updatedAt: new Date(),
      dueDate: input.dueDate || undefined,
    } as unknown as Task;
  } catch (error) {
    console.error('[createTask] Error:', error);
    throw error;
  }
};

export const getUserTasks = async (
  userId: string,
  filters?: { status?: TaskStatus[], category?: TaskCategory[], priority?: TaskPriority[] }
): Promise<Task[]> => {
  try {
    const tasksRef = collection(db, TASKS_COLLECTION);

    // Simplified query for speed
    let q = query(
      tasksRef,
      where('userId', '==', userId)
    );

    const snapshot = await getDocs(q);
    let tasks = snapshot.docs.map(docToTask);

    // Filter in memory to avoid index hangs
    if (filters?.status && filters.status.length > 0) {
      tasks = tasks.filter(t => filters.status!.includes(t.status));
    }
    if (filters?.priority && filters.priority.length > 0) {
      tasks = tasks.filter(t => filters.priority!.includes(t.priority));
    }
    if (filters?.category && filters.category.length > 0) {
      tasks = tasks.filter(t => filters.category!.includes(t.category));
    }

    // Sort in memory
    return tasks.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  } catch (error) {
    console.error('[getUserTasks] Error:', error);
    return [];
  }
};

export const updateTask = async (taskId: string, updates: UpdateTaskInput): Promise<void> => {
  try {
    const taskRef = doc(db, TASKS_COLLECTION, taskId);

    const updateData: any = {
      ...updates,
      updatedAt: serverTimestamp(),
    };

    if (updates.dueDate) {
      updateData.dueDate = Timestamp.fromDate(updates.dueDate);
    }

    if (updates.status === 'completed') {
      updateData.completedAt = serverTimestamp();
    }

    await updateDoc(taskRef, updateData);
  } catch (error) {
    console.error('Error updating task:', error);
    throw error;
  }
};

export const completeTask = async (taskId: string): Promise<void> => {
  return updateTask(taskId, { status: 'completed' });
};

export const deleteTask = async (taskId: string): Promise<void> => {
  try {
    const taskRef = doc(db, TASKS_COLLECTION, taskId);
    await deleteDoc(taskRef);
  } catch (error) {
    console.error('Error deleting task:', error);
    throw error;
  }
};

export const getTaskStats = async (userId: string) => {
  try {
    const tasks = await getUserTasks(userId);

    const stats = {
      total: tasks.length,
      completed: 0,
      pending: 0,
      inProgress: 0,
      byCategory: {} as Record<string, number>,
      byPriority: {} as Record<string, number>,
    };

    tasks.forEach(task => {
      if (task.status === 'completed') stats.completed++;
      if (task.status === 'pending') stats.pending++;
      if (task.status === 'in-progress') stats.inProgress++;

      stats.byCategory[task.category] = (stats.byCategory[task.category] || 0) + 1;
      stats.byPriority[task.priority] = (stats.byPriority[task.priority] || 0) + 1;
    });

    return stats;
  } catch (error) {
    console.error('Error fetching stats:', error);
    return {
      total: 0, completed: 0, pending: 0, inProgress: 0,
      byCategory: {}, byPriority: {}
    };
  }
};

import { supabase } from '@/lib/supabase';
import type { Task, CreateTaskInput, UpdateTaskInput, TaskStatus, TaskPriority, TaskCategory } from '@/lib/types';

const TASKS_TABLE = 'tasks';

export const createTask = async (userId: string, input: CreateTaskInput, id?: string): Promise<Task> => {
  try {
    console.log('[createTask] Starting...', { userId, title: input.title });

    const newTaskData = {
      id: id || undefined, // Let Supabase generate if not provided
      user_id: userId,
      title: input.title,
      description: input.description || '',
      status: 'pending' as TaskStatus,
      priority: input.priority || 'medium' as TaskPriority,
      category: input.category || 'personal' as TaskCategory,
      due_date: input.dueDate ? input.dueDate.toISOString().split('T')[0] : null,
      project_id: input.projectId || null,
      order_index: input.orderIndex || 0,
      subtasks: input.subtasks || [],
      recurring_pattern: input.recurringPattern || null,
      time_spent: 0,
    };

    const { data, error } = await supabase
      .from(TASKS_TABLE)
      .insert([newTaskData])
      .select()
      .single();

    if (error) throw error;

    console.log('[createTask] Task created:', data.id);

    return {
      id: data.id,
      userId: data.user_id,
      title: data.title,
      description: data.description,
      status: data.status,
      priority: data.priority,
      category: data.category,
      dueDate: data.due_date ? new Date(data.due_date) : undefined,
      projectId: data.project_id,
      completedAt: data.completed_at ? new Date(data.completed_at) : undefined,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
      orderIndex: data.order_index,
      subtasks: data.subtasks || [],
      recurringPattern: data.recurring_pattern,
      timeSpent: data.time_spent,
    } as Task;
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
    let query = supabase
      .from(TASKS_TABLE)
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    // Apply filters
    if (filters?.status && filters.status.length > 0) {
      query = query.in('status', filters.status);
    }
    if (filters?.category && filters.category.length > 0) {
      query = query.in('category', filters.category);
    }
    if (filters?.priority && filters.priority.length > 0) {
      query = query.in('priority', filters.priority);
    }

    const { data, error } = await query;

    if (error) throw error;

    return (data || []).map(task => ({
      id: task.id,
      userId: task.user_id,
      title: task.title,
      description: task.description,
      status: task.status,
      priority: task.priority,
      category: task.category,
      dueDate: task.due_date ? new Date(task.due_date) : undefined,
      projectId: task.project_id,
      completedAt: task.completed_at ? new Date(task.completed_at) : undefined,
      createdAt: new Date(task.created_at),
      updatedAt: new Date(task.updated_at),
      orderIndex: task.order_index,
      subtasks: task.subtasks || [],
      recurringPattern: task.recurring_pattern,
      timeSpent: task.time_spent,
    } as Task));
  } catch (error) {
    console.error('[getUserTasks] Error:', error);
    return [];
  }
};

export const updateTask = async (taskId: string, updates: UpdateTaskInput): Promise<void> => {
  try {
    const updateData: any = {
      updated_at: new Date().toISOString(),
    };

    // Explicitly map allowed fields from UpdateTaskInput to database columns
    if (updates.title !== undefined) updateData.title = updates.title;
    if (updates.description !== undefined) updateData.description = updates.description;
    if (updates.status !== undefined) {
      updateData.status = updates.status;
      if (updates.status === 'completed') {
        updateData.completed_at = new Date().toISOString();
      }
    }
    if (updates.priority !== undefined) updateData.priority = updates.priority;
    if (updates.category !== undefined) updateData.category = updates.category;

    if (updates.dueDate !== undefined) {
      updateData.due_date = updates.dueDate ? updates.dueDate.toISOString().split('T')[0] : null;
    }

    if (updates.projectId !== undefined) {
      updateData.project_id = updates.projectId;
    }

    if (updates.orderIndex !== undefined) updateData.order_index = updates.orderIndex;
    if (updates.subtasks !== undefined) updateData.subtasks = updates.subtasks;
    if (updates.recurringPattern !== undefined) updateData.recurring_pattern = updates.recurringPattern;
    if (updates.timeSpent !== undefined) updateData.time_spent = updates.timeSpent;

    const { error } = await supabase
      .from(TASKS_TABLE)
      .update(updateData)
      .eq('id', taskId);

    if (error) throw error;
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
    const { error } = await supabase
      .from(TASKS_TABLE)
      .delete()
      .eq('id', taskId);

    if (error) throw error;
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

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  createdAt: Date;
  updatedAt: Date;
  preferences?: UserPreferences;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  notifications: boolean;
}

export type TaskStatus = 'pending' | 'in-progress' | 'completed' | 'archived';
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';
export type TaskCategory = 'work' | 'personal' | 'health' | 'finance' | 'shopping' | 'other';

export interface Task {
  id: string;
  userId: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  category: TaskCategory;
  dueDate?: Date;
  createdAt: Date;
  updatedAt: Date;
  projectId?: string;
  tags?: string[];
  completedAt?: Date;
}

export interface CreateTaskInput {
  title: string;
  description?: string;
  priority?: TaskPriority;
  category?: TaskCategory;
  dueDate?: Date;
  projectId?: string;
  tags?: string[];
}

export interface UpdateTaskInput extends Partial<CreateTaskInput> {
  status?: TaskStatus;
}

export interface Project {
  id: string;
  userId: string;
  name: string;
  description?: string;
  content?: string; // HTML content from TipTap
  color: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateProjectInput {
  name: string;
  description?: string;
  content?: string;
  color?: string;
}

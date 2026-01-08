import { Task, TaskPriority } from '../types';
import { fileStorage } from './fileStorageService';

let tasksCache: Task[] = [];

async function loadCache() {
  tasksCache = await fileStorage.loadTasks();
}

loadCache();

function generateId(): number {
  const maxId = tasksCache.reduce((max, task) => Math.max(max, task.id || 0), 0);
  return maxId + 1;
}

export async function addTask(task: Omit<Task, 'id' | 'createdAt'>): Promise<number> {
  const newTask: Task = {
    ...task,
    id: generateId(),
    createdAt: new Date().toISOString()
  };
  
  tasksCache.push(newTask);
  await fileStorage.saveTasks(tasksCache);
  
  return newTask.id!;
}

export async function updateTask(id: number, updates: Partial<Task>): Promise<void> {
  const index = tasksCache.findIndex(t => t.id === id);
  if (index !== -1) {
    tasksCache[index] = { ...tasksCache[index], ...updates };
    await fileStorage.saveTasks(tasksCache);
  }
}

export async function completeTask(id: number): Promise<void> {
  const index = tasksCache.findIndex(t => t.id === id);
  if (index !== -1) {
    tasksCache[index] = {
      ...tasksCache[index],
      status: 'completed',
      completedAt: new Date().toISOString()
    };
    await fileStorage.saveTasks(tasksCache);
  }
}

export async function getAllTasks(): Promise<Task[]> {
  tasksCache = await fileStorage.loadTasks();
  return [...tasksCache];
}

export async function getTasksByPriority(priority: TaskPriority): Promise<Task[]> {
  tasksCache = await fileStorage.loadTasks();
  return tasksCache.filter(t => t.priority === priority);
}

export async function getPendingTasks(): Promise<Task[]> {
  tasksCache = await fileStorage.loadTasks();
  return tasksCache.filter(t => t.status === 'pending');
}

export async function getProjectTasks(projectId: number): Promise<Task[]> {
  tasksCache = await fileStorage.loadTasks();
  return tasksCache.filter(t => t.projectId === projectId);
}

export async function deleteTask(id: number): Promise<void> {
  tasksCache = tasksCache.filter(t => t.id !== id);
  await fileStorage.saveTasks(tasksCache);
}

export async function deleteProjectTasks(projectId: number): Promise<void> {
  tasksCache = tasksCache.filter(t => t.projectId !== projectId);
  await fileStorage.saveTasks(tasksCache);
}

import { useState, useEffect } from 'react';
import { Task } from '../types';
import { getAllTasks } from '../services/taskService';
import { calculateTaskSummary, getTasksByPriority, getOtherTasks } from '../utils/dateUtils';

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    try {
      const allTasks = await getAllTasks();
      setTasks(allTasks);
    } catch (error) {
      console.error('加载任务失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const refreshTasks = () => {
    loadTasks();
  };

  const summary = calculateTaskSummary(tasks);
  const overdueTasks = getTasksByPriority(tasks, 'urgent');
  const todayTasks = getTasksByPriority(tasks, 'high');
  const next7DaysTasks = getTasksByPriority(tasks, 'normal');
  const next30DaysTasks = getTasksByPriority(tasks, 'low');
  const otherTasks = getOtherTasks(tasks);

  return {
    tasks,
    allTasks: tasks,
    summary,
    overdueTasks,
    todayTasks,
    next7DaysTasks,
    next30DaysTasks,
    otherTasks,
    loading,
    refreshTasks
  };
}

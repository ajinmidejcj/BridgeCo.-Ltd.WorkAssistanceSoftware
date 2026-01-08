import { format, addDays, differenceInDays } from 'date-fns';
import { Task, TaskPriority, TaskSummary } from '../types';
import { holidayService } from '../services/holidayService';

export async function calculateDeadlineDate(startDate: string, days: number, isWorkingDays: boolean = false): Promise<string> {
  const start = new Date(startDate);
  
  if (isWorkingDays) {
    const deadline = await holidayService.addBusinessDays(start, days);
    return format(deadline, 'yyyy-MM-dd');
  } else {
    const deadline = addDays(start, days - 1);
    return format(deadline, 'yyyy-MM-dd');
  }
}

export function getTaskPriority(deadlineDate: string): TaskPriority {
  const today = new Date();
  const deadline = new Date(deadlineDate);
  const daysDiff = differenceInDays(deadline, today);

  if (daysDiff < 0) return 'urgent';
  if (daysDiff === 0) return 'high';
  if (daysDiff <= 7) return 'normal';
  return 'low';
}

export function calculateTaskSummary(tasks: Task[]): TaskSummary {
  const today = new Date();
  
  return tasks.reduce((summary, task) => {
    if (task.status === 'completed') return summary;
    
    if (!task.deadlineDate) {
      summary.other++;
      return summary;
    }
    
    const deadline = new Date(task.deadlineDate);
    const daysDiff = differenceInDays(deadline, today);
    
    if (daysDiff < 0) {
      summary.overdue++;
    } else if (daysDiff === 0) {
      summary.today++;
    } else if (daysDiff <= 7) {
      summary.next7Days++;
    } else if (daysDiff <= 30) {
      summary.next30Days++;
    } else {
      summary.other++;
    }
    
    return summary;
  }, { overdue: 0, today: 0, next7Days: 0, next30Days: 0, other: 0 });
}

export function getTasksByPriority(tasks: Task[], priority: TaskPriority): Task[] {
  const today = new Date();
  
  return tasks.filter(task => {
    if (task.status === 'completed') return false;
    
    if (!task.deadlineDate) return false;
    
    const deadline = new Date(task.deadlineDate);
    const daysDiff = differenceInDays(deadline, today);
    
    switch (priority) {
      case 'urgent':
        return daysDiff < 0;
      case 'high':
        return daysDiff === 0;
      case 'normal':
        return daysDiff > 0 && daysDiff <= 7;
      case 'low':
        return daysDiff > 7 && daysDiff <= 30;
      default:
        return false;
    }
  });
}

export function getOtherTasks(tasks: Task[]): Task[] {
  const today = new Date();
  
  return tasks.filter(task => {
    if (task.status === 'completed') return false;
    
    if (!task.deadlineDate) return true;
    
    const deadline = new Date(task.deadlineDate);
    const daysDiff = differenceInDays(deadline, today);
    
    return daysDiff > 30;
  });
}

export function formatDate(date: string | Date): string {
  if (!date) return '无截止日期';
  return format(new Date(date), 'yyyy年MM月dd日');
}

export function getTodayDate(): string {
  return format(new Date(), 'yyyy年MM月dd日');
}

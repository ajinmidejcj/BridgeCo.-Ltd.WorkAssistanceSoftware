import { Task, Project, Year } from '../types';
import { db } from '../db/database';

const STORAGE_KEYS = {
  LAST_BACKUP: 'bridgeco_last_backup',
  STORAGE_INFO: 'bridgeco_storage_info'
};

const STORAGE_WARNING_THRESHOLD = 0.8;
const STORAGE_CRITICAL_THRESHOLD = 0.95;

export class FileStorageService {
  private static instance: FileStorageService;
  private cache: Map<string, any> = new Map();
  private cacheExpiry: Map<string, number> = new Map();
  private readonly CACHE_DURATION = 5 * 60 * 1000;

  private constructor() {
    this.initializeCache();
  }

  public static getInstance(): FileStorageService {
    if (!FileStorageService.instance) {
      FileStorageService.instance = new FileStorageService();
    }
    return FileStorageService.instance;
  }

  private async initializeCache(): Promise<void> {
    try {
      const tasks = await db.tasks.toArray();
      const projects = await db.projects.toArray();
      const years = await db.years.toArray();
      
      this.cache.set('tasks', tasks);
      this.cache.set('projects', projects);
      this.cache.set('years', years);
    } catch (error) {
      console.error('初始化缓存失败:', error);
    }
  }

  private getFromCache<T>(key: string): T[] | null {
    const cached = this.cache.get(key);
    const expiry = this.cacheExpiry.get(key);
    
    if (cached && (!expiry || Date.now() < expiry)) {
      return cached as T[];
    }
    
    return null;
  }

  private setCache<T>(key: string, data: T[]): void {
    this.cache.set(key, data);
    this.cacheExpiry.set(key, Date.now() + this.CACHE_DURATION);
  }

  private clearCache(key?: string): void {
    if (key) {
      this.cache.delete(key);
      this.cacheExpiry.delete(key);
    } else {
      this.cache.clear();
      this.cacheExpiry.clear();
    }
  }

  public async saveTasks(tasks: Task[]): Promise<void> {
    try {
      await db.transaction('rw', db.tasks, async () => {
        await db.tasks.clear();
        await db.tasks.bulkAdd(tasks);
      });
      this.setCache('tasks', tasks);
    } catch (error) {
      console.error('保存任务失败:', error);
      throw new Error('保存任务失败，请重试');
    }
  }

  public async loadTasks(): Promise<Task[]> {
    try {
      const cached = this.getFromCache<Task>('tasks');
      if (cached !== null) {
        return cached;
      }

      const tasks = await db.tasks.toArray();
      this.setCache('tasks', tasks);
      return tasks;
    } catch (error) {
      console.error('加载任务失败:', error);
      return [];
    }
  }

  public async saveProjects(projects: Project[]): Promise<void> {
    try {
      await db.transaction('rw', db.projects, async () => {
        await db.projects.clear();
        await db.projects.bulkAdd(projects);
      });
      this.setCache('projects', projects);
    } catch (error) {
      console.error('保存项目失败:', error);
      throw new Error('保存项目失败，请重试');
    }
  }

  public async loadProjects(): Promise<Project[]> {
    try {
      const cached = this.getFromCache<Project>('projects');
      if (cached !== null) {
        return cached;
      }

      const projects = await db.projects.toArray();
      this.setCache('projects', projects);
      return projects;
    } catch (error) {
      console.error('加载项目失败:', error);
      return [];
    }
  }

  public async saveYears(years: Year[]): Promise<void> {
    try {
      await db.transaction('rw', db.years, async () => {
        await db.years.clear();
        await db.years.bulkAdd(years);
      });
      this.setCache('years', years);
    } catch (error) {
      console.error('保存年度失败:', error);
      throw new Error('保存年度失败，请重试');
    }
  }

  public async loadYears(): Promise<Year[]> {
    try {
      const cached = this.getFromCache<Year>('years');
      if (cached !== null) {
        return cached;
      }

      const years = await db.years.toArray();
      this.setCache('years', years);
      return years;
    } catch (error) {
      console.error('加载年度失败:', error);
      return [];
    }
  }

  public async exportAllData(): Promise<string> {
    const tasks = await this.loadTasks();
    const projects = await this.loadProjects();
    const years = await this.loadYears();
    const storageInfo = await this.getStorageInfo();

    const data = {
      tasks,
      projects,
      years,
      exportDate: new Date().toISOString(),
      storageInfo
    };
    return JSON.stringify(data, null, 2);
  }

  public async importAllData(jsonString: string): Promise<{ tasks: Task[]; projects: Project[]; years: Year[] }> {
    try {
      const data = JSON.parse(jsonString);
      
      if (!data.tasks || !data.projects || !data.years) {
        throw new Error('数据格式不正确');
      }

      this.clearCache();
      await this.saveTasks(data.tasks);
      await this.saveProjects(data.projects);
      await this.saveYears(data.years);

      return {
        tasks: data.tasks,
        projects: data.projects,
        years: data.years
      };
    } catch (error) {
      console.error('导入数据失败:', error);
      throw new Error('导入数据失败，请检查文件格式');
    }
  }

  public async clearAllData(): Promise<void> {
    try {
      await db.transaction('rw', [db.tasks, db.projects, db.years], async () => {
        await db.tasks.clear();
        await db.projects.clear();
        await db.years.clear();
      });
      localStorage.removeItem(STORAGE_KEYS.LAST_BACKUP);
      localStorage.removeItem(STORAGE_KEYS.STORAGE_INFO);
      this.clearCache();
    } catch (error) {
      console.error('清除数据失败:', error);
      throw new Error('清除数据失败，请重试');
    }
  }

  public async getStorageInfo(): Promise<{ used: number; available: number; total: number; usageRatio: number }> {
    try {
      const tasks = await this.loadTasks();
      const projects = await this.loadProjects();
      const years = await this.loadYears();

      const tasksSize = JSON.stringify(tasks).length;
      const projectsSize = JSON.stringify(projects).length;
      const yearsSize = JSON.stringify(years).length;

      const used = tasksSize + projectsSize + yearsSize;
      const total = 50 * 1024 * 1024;
      const available = total - used;
      const usageRatio = used / total;

      return {
        used,
        available,
        total,
        usageRatio
      };
    } catch (error) {
      console.error('获取存储信息失败:', error);
      return {
        used: 0,
        available: 50 * 1024 * 1024,
        total: 50 * 1024 * 1024,
        usageRatio: 0
      };
    }
  }

  public async getStorageHealth(): Promise<{
    status: 'healthy' | 'warning' | 'critical';
    message: string;
    info: {
      used: number;
      available: number;
      total: number;
      usageRatio: number;
    };
  }> {
    const info = await this.getStorageInfo();
    const percentage = (info.usageRatio * 100).toFixed(1);

    if (info.usageRatio > STORAGE_CRITICAL_THRESHOLD) {
      return {
        status: 'critical',
        message: `存储空间严重不足 (${percentage}%)，请立即导出数据备份`,
        info
      };
    } else if (info.usageRatio > STORAGE_WARNING_THRESHOLD) {
      return {
        status: 'warning',
        message: `存储空间使用率较高 (${percentage}%)，建议定期导出数据备份`,
        info
      };
    } else {
      return {
        status: 'healthy',
        message: `存储空间充足 (${percentage}%)`,
        info
      };
    }
  }

  public async downloadBackup(): Promise<void> {
    const data = await this.exportAllData();
    const blob = new Blob([data], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const date = new Date().toISOString().split('T')[0];
    link.download = `bridgeco_backup_${date}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    localStorage.setItem(STORAGE_KEYS.LAST_BACKUP, new Date().toISOString());
  }

  public async importBackup(file: File): Promise<{ tasks: Task[]; projects: Project[]; years: Year[] }> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const content = e.target?.result as string;
          const result = await this.importAllData(content);
          resolve(result);
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = () => {
        reject(new Error('读取文件失败'));
      };
      reader.readAsText(file);
    });
  }

  public getLastBackupDate(): string | null {
    return localStorage.getItem(STORAGE_KEYS.LAST_BACKUP);
  }

  public async getDataStatistics(): Promise<{
    projectCount: number;
    taskCount: number;
    yearCount: number;
    storageSize: string;
    estimatedCapacity: string;
  }> {
    const projects = await this.loadProjects();
    const tasks = await this.loadTasks();
    const years = await this.loadYears();
    const storageInfo = await this.getStorageInfo();

    const avgProjectSize = storageInfo.used / (projects.length || 1);
    const avgTaskSize = storageInfo.used / (tasks.length || 1);

    return {
      projectCount: projects.length,
      taskCount: tasks.length,
      yearCount: years.length,
      storageSize: `${(storageInfo.used / 1024).toFixed(2)} KB`,
      estimatedCapacity: `约可再存储 ${Math.floor(storageInfo.available / avgProjectSize)} 个项目或 ${Math.floor(storageInfo.available / avgTaskSize)} 个任务`
    };
  }
}

export const fileStorage = FileStorageService.getInstance();

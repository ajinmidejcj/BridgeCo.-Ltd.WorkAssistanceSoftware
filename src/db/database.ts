import Dexie, { Table } from 'dexie';
import { Task, Project, Year } from '../types';

export class ProjectDatabase extends Dexie {
  tasks!: Table<Task>;
  projects!: Table<Project>;
  years!: Table<Year>;

  constructor() {
    super('BridgeCoProjectDB');
    this.version(1).stores({
      tasks: '++id, projectId, priority, status, deadlineDate, startDate, isProjectTask',
      projects: '++id, year, projectNumber, createdAt',
      years: '++id, year'
    });
  }
}

export const db = new ProjectDatabase();

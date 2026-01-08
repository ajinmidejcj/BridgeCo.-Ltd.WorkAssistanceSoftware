import { Project, Year } from '../types';
import { fileStorage } from './fileStorageService';

let projectsCache: Project[] = [];
let yearsCache: Year[] = [];

async function loadCache() {
  projectsCache = await fileStorage.loadProjects();
  yearsCache = await fileStorage.loadYears();
}

loadCache();

function generateId(): number {
  const allIds = [...projectsCache.map(p => p.id || 0), ...yearsCache.map(y => y.id || 0)];
  return allIds.length > 0 ? Math.max(...allIds) + 1 : 1;
}

export async function addYear(year: number): Promise<number> {
  const newYear: Year = {
    id: generateId(),
    year,
    createdAt: new Date().toISOString()
  };
  
  yearsCache.push(newYear);
  await fileStorage.saveYears(yearsCache);
  
  return newYear.id!;
}

export async function getAllYears(): Promise<Year[]> {
  yearsCache = await fileStorage.loadYears();
  return [...yearsCache];
}

export async function addProject(project: Omit<Project, 'id' | 'createdAt'>): Promise<number> {
  const newProject: Project = {
    ...project,
    id: generateId(),
    createdAt: new Date().toISOString()
  };
  
  projectsCache.push(newProject);
  await fileStorage.saveProjects(projectsCache);
  
  return newProject.id!;
}

export async function updateProject(id: number, updates: Partial<Project>): Promise<void> {
  const index = projectsCache.findIndex(p => p.id === id);
  if (index !== -1) {
    projectsCache[index] = { ...projectsCache[index], ...updates };
    await fileStorage.saveProjects(projectsCache);
  }
}

export async function getAllProjects(): Promise<Project[]> {
  projectsCache = await fileStorage.loadProjects();
  return [...projectsCache];
}

export async function getProjectsByYear(year: number): Promise<Project[]> {
  projectsCache = await fileStorage.loadProjects();
  return projectsCache.filter(p => p.year === year);
}

export async function getProjectById(id: number): Promise<Project | undefined> {
  projectsCache = await fileStorage.loadProjects();
  return projectsCache.find(p => p.id === id);
}

export async function deleteProject(id: number): Promise<void> {
  projectsCache = projectsCache.filter(p => p.id !== id);
  await fileStorage.saveProjects(projectsCache);
}

export async function deleteYear(id: number): Promise<void> {
  const year = yearsCache.find(y => y.id === id);
  if (!year) return;
  
  const yearValue = year.year;
  projectsCache = projectsCache.filter(p => p.year !== yearValue);
  yearsCache = yearsCache.filter(y => y.id !== id);
  
  await fileStorage.saveProjects(projectsCache);
  await fileStorage.saveYears(yearsCache);
}

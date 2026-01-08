import { useState, useEffect } from 'react';
import { Year, Project } from '../types';
import { getAllYears, getProjectsByYear, getAllProjects } from '../services/projectService';

export function useProjects(externalSelectedYear: number | null = null) {
  const [years, setYears] = useState<Year[]>([]);
  const [selectedYear, setSelectedYear] = useState<number | null>(externalSelectedYear);
  const [projects, setProjects] = useState<Project[]>([]);
  const [allProjects, setAllProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadYears();
    loadAllProjects();
  }, []);

  useEffect(() => {
    if (externalSelectedYear !== null) {
      setSelectedYear(externalSelectedYear);
    }
  }, [externalSelectedYear]);

  useEffect(() => {
    if (selectedYear !== null) {
      loadProjects(selectedYear);
    }
  }, [selectedYear]);

  const loadYears = async () => {
    try {
      const allYears = await getAllYears();
      setYears(allYears);
    } catch (error) {
      console.error('加载年度失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadAllProjects = async () => {
    try {
      const projects = await getAllProjects();
      setAllProjects(projects);
    } catch (error) {
      console.error('加载所有项目失败:', error);
    }
  };

  const loadProjects = async (year: number) => {
    try {
      const yearProjects = await getProjectsByYear(year);
      setProjects(yearProjects);
    } catch (error) {
      console.error('加载项目失败:', error);
    }
  };

  const refreshYears = () => {
    loadYears();
  };

  const refreshProjects = () => {
    if (selectedYear !== null) {
      loadProjects(selectedYear);
    }
  };

  const refreshAllProjects = () => {
    loadAllProjects();
  };

  return {
    years,
    selectedYear,
    projects,
    allProjects,
    loading,
    setSelectedYear,
    refreshYears,
    refreshProjects,
    refreshAllProjects
  };
}

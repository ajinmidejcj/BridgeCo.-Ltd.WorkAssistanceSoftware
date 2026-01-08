import { useState, useEffect } from 'react';
import { useTasks } from '../hooks/useTasks';
import { useProjects } from '../hooks/useProjects';
import { getTodayDate } from '../utils/dateUtils';
import { TaskList } from '../components/TaskList';
import { AddTaskModal } from '../components/AddTaskModal';
import { AddYearModal } from '../components/AddYearModal';
import { DatabaseView } from '../components/DatabaseView';
import { DatabaseDetailView } from '../components/DatabaseDetailView';
import { deleteYear } from '../services/projectService';
import { fileStorage } from '../services/fileStorageService';

interface DashboardProps {
  onYearSelect: (year: number) => void;
  onViewDatabase: () => void;
}

export function Dashboard({ onYearSelect }: DashboardProps) {
  const {
    summary,
    overdueTasks,
    todayTasks,
    next7DaysTasks,
    next30DaysTasks,
    otherTasks,
    loading,
    refreshTasks
  } = useTasks();

  const { years, allProjects, refreshYears } = useProjects();
  const [showTaskList, setShowTaskList] = useState<string | null>(null);
  const [showAddTask, setShowAddTask] = useState(false);
  const [showAddYear, setShowAddYear] = useState(false);
  const [showDatabase, setShowDatabase] = useState(false);
  const [viewDetails, setViewDetails] = useState<{ type: 'project' | 'task'; id: number } | null>(null);
  const [storageHealth, setStorageHealth] = useState<{
    status: 'healthy' | 'warning' | 'critical';
    message: string;
    info: {
      used: number;
      available: number;
      total: number;
      usageRatio: number;
    };
  }>({
    status: 'healthy',
    message: '加载中...',
    info: { used: 0, available: 50 * 1024 * 1024, total: 50 * 1024 * 1024, usageRatio: 0 }
  });
  const [dataStats, setDataStats] = useState<{
    projectCount: number;
    taskCount: number;
    yearCount: number;
    storageSize: string;
    estimatedCapacity: string;
  }>({
    projectCount: 0,
    taskCount: 0,
    yearCount: 0,
    storageSize: '0 KB',
    estimatedCapacity: '计算中...'
  });

  useEffect(() => {
    loadStorageInfo();
  }, []);

  const loadStorageInfo = async () => {
    try {
      const [health, stats] = await Promise.all([
        fileStorage.getStorageHealth(),
        fileStorage.getDataStatistics()
      ]);
      setStorageHealth(health);
      setDataStats(stats);
    } catch (error) {
      console.error('加载存储信息失败:', error);
    }
  };

  const handleShowTasks = (type: string) => {
    setShowTaskList(type);
  };

  const handleDeleteYear = async (yearId: number) => {
    if (window.confirm('确定要删除该年度及其所有项目吗？')) {
      try {
        await deleteYear(yearId);
        refreshYears();
      } catch (error) {
        console.error('删除年度失败:', error);
        alert('删除年度失败，请重试');
      }
    }
  };

  const handleExportBackup = async () => {
    try {
      await fileStorage.downloadBackup();
      await loadStorageInfo();
      alert('数据备份已下载');
    } catch (error) {
      console.error('导出备份失败:', error);
      alert('导出备份失败，请重试');
    }
  };

  const handleImportBackup = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (window.confirm('导入备份将覆盖当前所有数据，确定要继续吗？')) {
      try {
        await fileStorage.importBackup(file);
        await loadStorageInfo();
        alert('数据导入成功');
        refreshTasks();
        refreshYears();
      } catch (error) {
        console.error('导入备份失败:', error);
        alert('导入备份失败，请检查文件格式');
      }
    }

    event.target.value = '';
  };

  const getTaskListProps = () => {
    switch (showTaskList) {
      case 'overdue':
        return { tasks: overdueTasks, title: '超期未完成事项（加急）' };
      case 'today':
        return { tasks: todayTasks, title: '今日必须完成事项（急）' };
      case 'next7Days':
        return { tasks: next7DaysTasks, title: '未来7日应完成事项（普通）' };
      case 'next30Days':
        return { tasks: next30DaysTasks, title: '未来30日应完成事项（不急）' };
      case 'other':
        return { tasks: otherTasks, title: '其他待完成事项（不急）' };
      default:
        return null;
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-screen">加载中...</div>;
  }

  const taskListProps = getTaskListProps();

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <h1 className="text-3xl font-bold mb-2">
            {getTodayDate()}
          </h1>
          <p className="text-xl text-gray-600">
            欢迎大榭大桥有限公司，金崇杰先生
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <button
            onClick={() => handleShowTasks('overdue')}
            className="bg-red-500 hover:bg-red-600 text-white rounded-lg shadow-lg p-6 transition-colors"
          >
            <h3 className="text-lg font-semibold mb-2">超期未完成事项</h3>
            <p className="text-4xl font-bold">{summary.overdue}</p>
            <p className="text-sm mt-2">（加急）</p>
          </button>

          <button
            onClick={() => handleShowTasks('today')}
            className="bg-orange-500 hover:bg-orange-600 text-white rounded-lg shadow-lg p-6 transition-colors"
          >
            <h3 className="text-lg font-semibold mb-2">今日必须完成事项</h3>
            <p className="text-4xl font-bold">{summary.today}</p>
            <p className="text-sm mt-2">（急）</p>
          </button>

          <button
            onClick={() => handleShowTasks('next7Days')}
            className="bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg shadow-lg p-6 transition-colors"
          >
            <h3 className="text-lg font-semibold mb-2">未来7日应完成事项</h3>
            <p className="text-4xl font-bold">{summary.next7Days}</p>
            <p className="text-sm mt-2">（普通）</p>
          </button>

          <button
            onClick={() => handleShowTasks('next30Days')}
            className="bg-green-500 hover:bg-green-600 text-white rounded-lg shadow-lg p-6 transition-colors"
          >
            <h3 className="text-lg font-semibold mb-2">未来30日应完成事项</h3>
            <p className="text-4xl font-bold">{summary.next30Days}</p>
            <p className="text-sm mt-2">（不急）</p>
          </button>

          <button
            onClick={() => handleShowTasks('other')}
            className="bg-blue-500 hover:bg-blue-600 text-white rounded-lg shadow-lg p-6 transition-colors"
          >
            <h3 className="text-lg font-semibold mb-2">其他待完成事项</h3>
            <p className="text-4xl font-bold">{summary.other}</p>
            <p className="text-sm mt-2">（不急）</p>
          </button>

          <button
            onClick={() => setShowAddTask(true)}
            className="bg-purple-500 hover:bg-purple-600 text-white rounded-lg shadow-lg p-6 transition-colors"
          >
            <h3 className="text-lg font-semibold mb-2">添加待办事项</h3>
            <p className="text-2xl font-bold">+</p>
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-bold mb-4">各年度项目</h2>
          <div className="flex flex-wrap gap-4">
            <button
              onClick={() => setShowAddYear(true)}
              className="px-6 py-3 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors"
            >
              + 添加年度
            </button>
            {years.map((year) => (
              <div key={year.id} className="flex items-center gap-2">
                <button
                  onClick={() => onYearSelect(year.year)}
                  className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
                >
                  {year.year}年度
                </button>
                <button
                  onClick={() => year.id && handleDeleteYear(year.id)}
                  className="px-3 py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
                  title="删除年度"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>

        <button
          onClick={() => setShowDatabase(true)}
          className="w-full bg-white rounded-lg shadow-lg p-6 mb-8 hover:shadow-xl transition-shadow text-left"
        >
          <h2 className="text-2xl font-bold mb-4">数据库</h2>
          <p className="text-gray-600">
            储存了历史所有的项目及其事项和其他事项（项目按照年度和项目编号排序，其他事项按照开始日期排序）
          </p>
          <p className="text-sm text-blue-500 mt-2">点击查看详情 →</p>
        </button>

        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-bold mb-4">数据备份与恢复</h2>
          
          <div className={`mb-4 p-4 rounded-lg ${
            storageHealth.status === 'critical' ? 'bg-red-50 border border-red-200' :
            storageHealth.status === 'warning' ? 'bg-yellow-50 border border-yellow-200' :
            'bg-green-50 border border-green-200'
          }`}>
            <div className="flex items-center gap-2">
              <span className={`text-lg ${
                storageHealth.status === 'critical' ? 'text-red-600' :
                storageHealth.status === 'warning' ? 'text-yellow-600' :
                'text-green-600'
              }`}>
                {storageHealth.status === 'critical' ? '⚠️' :
                 storageHealth.status === 'warning' ? '⚡' :
                 '✓'}
              </span>
              <span className={`font-semibold ${
                storageHealth.status === 'critical' ? 'text-red-700' :
                storageHealth.status === 'warning' ? 'text-yellow-700' :
                'text-green-700'
              }`}>
                {storageHealth.message}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap gap-4 mb-4">
            <button
              onClick={handleExportBackup}
              className="px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
            >
              导出数据备份
            </button>
            <div className="relative">
              <input
                type="file"
                accept=".json"
                onChange={handleImportBackup}
                className="hidden"
                id="importBackup"
              />
              <label
                htmlFor="importBackup"
                className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors cursor-pointer inline-block"
              >
                导入数据备份
              </label>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="font-semibold mb-2 text-gray-700">数据统计</h3>
              <div className="space-y-1 text-sm text-gray-600">
                <p>项目数量: <span className="font-medium">{dataStats.projectCount}</span></p>
                <p>任务数量: <span className="font-medium">{dataStats.taskCount}</span></p>
                <p>年度数量: <span className="font-medium">{dataStats.yearCount}</span></p>
                <p>存储大小: <span className="font-medium">{dataStats.storageSize}</span></p>
              </div>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="font-semibold mb-2 text-gray-700">存储空间</h3>
              <div className="space-y-1 text-sm text-gray-600">
                <p>已使用: <span className="font-medium">{(storageHealth.info.used / 1024).toFixed(2)} KB</span></p>
                <p>可用空间: <span className="font-medium">{(storageHealth.info.available / 1024).toFixed(2)} KB</span></p>
                <p>使用率: <span className="font-medium">{(storageHealth.info.usageRatio * 100).toFixed(1)}%</span></p>
              </div>
              <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all ${
                    storageHealth.status === 'critical' ? 'bg-red-500' :
                    storageHealth.status === 'warning' ? 'bg-yellow-500' :
                    'bg-green-500'
                  }`}
                  style={{ width: `${storageHealth.info.usageRatio * 100}%` }}
                ></div>
              </div>
            </div>
          </div>

          <p className="text-sm text-gray-500 mb-4">
            {fileStorage.getLastBackupDate() 
              ? `上次备份时间: ${new Date(fileStorage.getLastBackupDate()!).toLocaleString('zh-CN')}`
              : '尚未进行数据备份'}
          </p>

          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h3 className="font-semibold mb-2 text-blue-800">数据存储说明</h3>
            <p className="text-sm text-blue-700 mb-2">
              所有数据存储在浏览器的本地存储中。更换电脑时，请先导出数据备份，
              然后在新电脑上导入备份文件即可恢复所有数据。
            </p>
            <p className="text-sm text-blue-700">
              <strong>预估容量:</strong> {dataStats.estimatedCapacity}
            </p>
          </div>
        </div>
      </div>

      {taskListProps && (
        <TaskList
          {...taskListProps}
          onClose={() => setShowTaskList(null)}
          onRefresh={refreshTasks}
        />
      )}

      {showAddTask && (
        <AddTaskModal
          projects={allProjects}
          onClose={() => {
            setShowAddTask(false);
            refreshTasks();
          }}
        />
      )}

      {showAddYear && (
        <AddYearModal
          onClose={() => {
            setShowAddYear(false);
            refreshYears();
          }}
        />
      )}

      {showDatabase && (
        <DatabaseView
          onClose={() => setShowDatabase(false)}
          onViewDetails={(type, id) => {
            setViewDetails({ type, id });
            setShowDatabase(false);
          }}
        />
      )}

      {viewDetails && (
        <DatabaseDetailView
          type={viewDetails.type}
          id={viewDetails.id}
          onClose={() => setViewDetails(null)}
        />
      )}
    </div>
  );
}

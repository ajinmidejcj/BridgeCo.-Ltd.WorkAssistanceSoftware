import { useState } from 'react';
import { addTask } from '../services/taskService';
import { TaskPriority, Project } from '../types';
import { calculateDeadlineDate } from '../utils/dateUtils';
import { useTasks } from '../hooks/useTasks';

interface AddTaskModalProps {
  projects: Project[];
  onClose: () => void;
}

export function AddTaskModal({ projects, onClose }: AddTaskModalProps) {
  const { refreshTasks } = useTasks();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    startDate: new Date().toISOString().split('T')[0],
    deadlineDays: 7,
    projectId: undefined as number | undefined,
    isProjectTask: false
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const selectedProject = projects.find(p => p.id === formData.projectId);
      
      const task = {
        title: formData.title,
        description: formData.description,
        startDate: formData.startDate,
        deadlineDays: formData.deadlineDays,
        deadlineDate: await calculateDeadlineDate(formData.startDate, formData.deadlineDays),
        priority: await getTaskPriority(formData.startDate, formData.deadlineDays),
        status: 'pending' as const,
        projectId: formData.projectId,
        projectNumber: selectedProject?.projectNumber,
        isProjectTask: formData.isProjectTask
      };

      await addTask(task);
      refreshTasks();
      onClose();
    } catch (err) {
      console.error('添加任务失败:', err);
      setError('添加任务失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  const getTaskPriority = async (startDate: string, days: number): Promise<TaskPriority> => {
    const deadline = await calculateDeadlineDate(startDate, days);
    const today = new Date();
    const diffDays = Math.floor((new Date(deadline).getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return 'urgent';
    if (diffDays === 0) return 'high';
    if (diffDays <= 7) return 'normal';
    return 'low';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-2xl font-bold">添加待办事项</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              属于何项目
            </label>
            <select
              value={formData.projectId || ''}
              onChange={(e) => {
                const value = e.target.value;
                setFormData({
                  ...formData,
                  projectId: value ? Number(value) : undefined,
                  isProjectTask: !!value
                });
              }}
              className="w-full border rounded-lg px-4 py-2"
              disabled={loading}
            >
              <option value="">其他事项</option>
              {projects.filter(p => p.id !== undefined).map((project) => (
                <option key={project.id} value={project.id}>
                  {project.projectNumber} - {project.projectName}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              开始日期
            </label>
            <input
              type="date"
              value={formData.startDate}
              onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              className="w-full border rounded-lg px-4 py-2"
              required
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              事由
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full border rounded-lg px-4 py-2"
              placeholder="请输入事项标题"
              required
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              详细描述
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full border rounded-lg px-4 py-2"
              rows={3}
              placeholder="请输入事项详细描述"
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              时间期限（天）
            </label>
            <input
              type="number"
              value={formData.deadlineDays}
              onChange={(e) => setFormData({ ...formData, deadlineDays: Number(e.target.value) })}
              className="w-full border rounded-lg px-4 py-2"
              min="1"
              required
              disabled={loading}
            />
          </div>

          <div className="flex justify-end gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border rounded-lg hover:bg-gray-50"
              disabled={loading}
            >
              取消
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              disabled={loading}
            >
              {loading ? '添加中...' : '确认添加'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

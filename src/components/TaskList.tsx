import { Task } from '../types';
import { formatDate } from '../utils/dateUtils';
import { deleteTask } from '../services/taskService';

interface TaskListProps {
  tasks: Task[];
  title: string;
  onClose?: () => void;
  onRefresh?: () => void;
}

export function TaskList({ tasks, title, onClose, onRefresh }: TaskListProps) {
  const handleDeleteTask = async (taskId: number) => {
    if (window.confirm('确定要删除该任务吗？')) {
      try {
        await deleteTask(taskId);
        if (onRefresh) {
          onRefresh();
        }
      } catch (error) {
        console.error('删除任务失败:', error);
        alert('删除任务失败，请重试');
      }
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-500';
      case 'high':
        return 'bg-orange-500';
      case 'normal':
        return 'bg-yellow-500';
      case 'low':
        return 'bg-green-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[80vh] overflow-hidden">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-2xl font-bold">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {tasks.length === 0 ? (
            <p className="text-gray-500 text-center py-8">暂无事项</p>
          ) : (
            <div className="space-y-4">
              {tasks.map((task) => (
                <div
                  key={task.id}
                  className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg mb-2">{task.title}</h3>
                      <p className="text-gray-600 mb-2">{task.description}</p>
                      <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                        <span>开始日期: {formatDate(task.startDate)}</span>
                        <span>截止日期: {formatDate(task.deadlineDate)}</span>
                        {task.projectNumber && (
                          <span>项目编号: {task.projectNumber}</span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${getPriorityColor(task.priority)}`} />
                      <button
                        onClick={() => task.id && handleDeleteTask(task.id)}
                        className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm"
                        title="删除任务"
                      >
                        删除
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

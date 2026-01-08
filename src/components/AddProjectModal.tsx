import { useState } from 'react';
import { addProject } from '../services/projectService';
import { addTask } from '../services/taskService';
import { ProjectCategory } from '../types';
import { calculateDeadlineDate } from '../utils/dateUtils';

interface AddProjectModalProps {
  year: number;
  onClose: () => void;
}

export function AddProjectModal({ year, onClose }: AddProjectModalProps) {
  const [formData, setFormData] = useState({
    projectNumber: '',
    projectName: '',
    category: '工程' as ProjectCategory,
    estimatedAmount: 0,
    budgetPrice: 0,
    tenderDate: new Date().toISOString().split('T')[0],
    awardDate: '',
    contractSignDays: 0,
    isWorkingDays: false,
    winningUnit: '',
    projectManagerName: '',
    projectManagerId: '',
    winningPrice: 0,
    projectDuration: 0
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const project = {
        year,
        projectNumber: formData.projectNumber,
        projectName: formData.projectName,
        category: formData.category,
        estimatedAmount: formData.estimatedAmount,
        budgetPrice: formData.budgetPrice,
        tenderDate: formData.tenderDate,
        awardNotice: {
          awardDate: formData.awardDate,
          contractSignDays: formData.contractSignDays,
          isWorkingDays: formData.isWorkingDays,
          winningUnit: formData.winningUnit,
          projectManagerName: formData.projectManagerName,
          projectManagerId: formData.projectManagerId,
          winningPrice: formData.winningPrice,
          projectDuration: formData.projectDuration
        },
        contract: {
          signDate: undefined,
          needPerformanceBond: false,
          performanceBondDays: undefined,
          paymentTerms: [],
          insuranceTerms: []
        },
        constructionMaterial: {
          needRoadOccupancyApproval: false,
          needStartApplication: false,
          needCompletionApplication: false,
          needAcceptanceCertificate: false,
          needSettlementAudit: false
        }
      };

      const projectId = await addProject(project);

      if (formData.awardDate && formData.contractSignDays > 0) {
        const deadlineDate = await calculateDeadlineDate(formData.awardDate, formData.contractSignDays, formData.isWorkingDays);

        const today = new Date();
        const daysDiff = Math.floor((new Date(deadlineDate).getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        
        let priority: 'urgent' | 'high' | 'normal' | 'low';
        if (daysDiff < 0) {
          priority = 'urgent';
        } else if (daysDiff === 0) {
          priority = 'high';
        } else if (daysDiff <= 7) {
          priority = 'normal';
        } else if (daysDiff <= 30) {
          priority = 'low';
        } else {
          priority = 'low';
        }

        await addTask({
          title: `签署合同 - ${formData.projectName}`,
          description: `项目 ${formData.projectNumber} 需要在 ${formData.contractSignDays} ${formData.isWorkingDays ? '个工作日' : '天'}内签署合同（截止日期：${deadlineDate}）`,
          startDate: formData.awardDate,
          deadlineDays: formData.contractSignDays,
          deadlineDate: deadlineDate,
          priority: priority,
          status: 'pending',
          projectId: projectId,
          projectNumber: formData.projectNumber,
          isProjectTask: true
        });
      }

      onClose();
    } catch (err) {
      console.error('添加项目失败:', err);
      setError('添加项目失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-2xl font-bold">添加年度项目</h2>
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
              项目编号
            </label>
            <input
              type="text"
              value={formData.projectNumber}
              onChange={(e) => setFormData({ ...formData, projectNumber: e.target.value })}
              className="w-full border rounded-lg px-4 py-2"
              required
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              项目名称
            </label>
            <input
              type="text"
              value={formData.projectName}
              onChange={(e) => setFormData({ ...formData, projectName: e.target.value })}
              className="w-full border rounded-lg px-4 py-2"
              required
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              项目类别
            </label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value as ProjectCategory })}
              className="w-full border rounded-lg px-4 py-2"
              disabled={loading}
            >
              <option value="工程">工程</option>
              <option value="服务">服务</option>
              <option value="采购">采购</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              项目预估金额（元）
            </label>
            <input
              type="number"
              value={formData.estimatedAmount}
              onChange={(e) => setFormData({ ...formData, estimatedAmount: Number(e.target.value) })}
              className="w-full border rounded-lg px-4 py-2"
              min="0"
              step="0.01"
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              招标控制价或预算价（元）
            </label>
            <input
              type="number"
              value={formData.budgetPrice}
              onChange={(e) => setFormData({ ...formData, budgetPrice: Number(e.target.value) })}
              className="w-full border rounded-lg px-4 py-2"
              min="0"
              step="0.01"
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              招标日期/邀请询价日期/采购日期
            </label>
            <input
              type="date"
              value={formData.tenderDate}
              onChange={(e) => setFormData({ ...formData, tenderDate: e.target.value })}
              className="w-full border rounded-lg px-4 py-2"
              required
              disabled={loading}
            />
          </div>

          <div className="border-t pt-4 mt-4">
            <h3 className="text-lg font-semibold mb-4">中标通知书信息</h3>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              中标通知书日期
            </label>
            <input
              type="date"
              value={formData.awardDate}
              onChange={(e) => setFormData({ ...formData, awardDate: e.target.value })}
              className="w-full border rounded-lg px-4 py-2"
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              合同签署天数
            </label>
            <input
              type="number"
              value={formData.contractSignDays}
              onChange={(e) => setFormData({ ...formData, contractSignDays: Number(e.target.value) })}
              className="w-full border rounded-lg px-4 py-2"
              min="0"
              disabled={loading}
              placeholder="从中标通知书日期开始计算的天数"
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isWorkingDays"
              checked={formData.isWorkingDays}
              onChange={(e) => setFormData({ ...formData, isWorkingDays: e.target.checked })}
              className="w-4 h-4"
              disabled={loading}
            />
            <label htmlFor="isWorkingDays" className="text-sm font-medium text-gray-700">
              按工作日计算
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              中标单位
            </label>
            <input
              type="text"
              value={formData.winningUnit}
              onChange={(e) => setFormData({ ...formData, winningUnit: e.target.value })}
              className="w-full border rounded-lg px-4 py-2"
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              项目经理姓名
            </label>
            <input
              type="text"
              value={formData.projectManagerName}
              onChange={(e) => setFormData({ ...formData, projectManagerName: e.target.value })}
              className="w-full border rounded-lg px-4 py-2"
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              项目经理身份证号
            </label>
            <input
              type="text"
              value={formData.projectManagerId}
              onChange={(e) => setFormData({ ...formData, projectManagerId: e.target.value })}
              className="w-full border rounded-lg px-4 py-2"
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              中标价格（元）
            </label>
            <input
              type="number"
              value={formData.winningPrice}
              onChange={(e) => setFormData({ ...formData, winningPrice: Number(e.target.value) })}
              className="w-full border rounded-lg px-4 py-2"
              min="0"
              step="0.01"
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              项目工期（天）
            </label>
            <input
              type="number"
              value={formData.projectDuration}
              onChange={(e) => setFormData({ ...formData, projectDuration: Number(e.target.value) })}
              className="w-full border rounded-lg px-4 py-2"
              min="0"
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

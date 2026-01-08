import { useState, useEffect } from 'react';
import { useProjects } from '../hooks/useProjects';
import { AddProjectModal } from '../components/AddProjectModal';
import { Project, Task } from '../types';
import { deleteProject } from '../services/projectService';
import { getProjectTasks, completeTask, deleteTask } from '../services/taskService';
import { calculateDeadlineDate } from '../utils/dateUtils';

async function updatePaymentTasks(project: Project) {
  const { getProjectTasks, updateTask, addTask } = await import('../services/taskService');
  
  const milestoneDates: Record<string, string | undefined> = {
    contract_sign_date: project.contract.signDate,
    start_application: project.constructionMaterial.startApplicationDate,
    completion_application: project.constructionMaterial.completionApplicationDate,
    acceptance_certificate: project.constructionMaterial.acceptanceCertificateDate,
    settlement_audit: project.constructionMaterial.settlementAuditDate
  };

  const milestoneNames: Record<string, string> = {
    contract_sign_date: '合同签署',
    start_application: '开工申请',
    completion_application: '完工申请',
    acceptance_certificate: '验收证书',
    settlement_audit: '结算审核'
  };

  for (const paymentTerm of project.contract.paymentTerms) {
    const milestoneDate = milestoneDates[paymentTerm.milestone];
    
    if (!paymentTerm.isPaid) {
      const tasks = await getProjectTasks(project.id!);
      const existingTask = tasks.find(t => 
        t.title.includes(paymentTerm.name) && 
        t.title.includes('付款')
      );
      
      if (!existingTask) {
        if (milestoneDate) {
          const deadlineDate = await calculateDeadlineDate(milestoneDate, paymentTerm.daysAfterMilestone, paymentTerm.isWorkingDays);

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
            title: `${paymentTerm.name}付款 - ${project.projectName}`,
            description: `项目 ${project.projectNumber} 的 ${paymentTerm.name} 需要在 ${paymentTerm.daysAfterMilestone} ${paymentTerm.isWorkingDays ? '个工作日' : '日'}后付款（截止日期：${deadlineDate}）`,
            startDate: milestoneDate,
            deadlineDays: paymentTerm.daysAfterMilestone,
            deadlineDate: deadlineDate,
            priority: priority,
            status: 'pending',
            projectId: project.id,
            projectNumber: project.projectNumber,
            isProjectTask: true
          });
        } else {
          await addTask({
            title: `${paymentTerm.name}付款 - ${project.projectName}`,
            description: `项目 ${project.projectNumber} 的 ${paymentTerm.name} 需要在 ${milestoneNames[paymentTerm.milestone]}后 ${paymentTerm.daysAfterMilestone} ${paymentTerm.isWorkingDays ? '个工作日' : '日'}内付款（前置里程碑：${milestoneNames[paymentTerm.milestone]}未完成）`,
            startDate: new Date().toISOString().split('T')[0],
            deadlineDays: paymentTerm.daysAfterMilestone,
            deadlineDate: '',
            priority: 'low',
            status: 'pending',
            projectId: project.id,
            projectNumber: project.projectNumber,
            isProjectTask: true
          });
        }
      } else {
        if (milestoneDate && existingTask.deadlineDate === '') {
          const deadlineDate = await calculateDeadlineDate(milestoneDate, paymentTerm.daysAfterMilestone, paymentTerm.isWorkingDays);

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

          await updateTask(existingTask.id!, {
            startDate: milestoneDate,
            deadlineDate: deadlineDate,
            priority: priority,
            description: `项目 ${project.projectNumber} 的 ${paymentTerm.name} 需要在 ${paymentTerm.daysAfterMilestone} ${paymentTerm.isWorkingDays ? '个工作日' : '日'}后付款（截止日期：${deadlineDate}）`
          });
        } else if (!milestoneDate && existingTask.deadlineDate !== '') {
          await updateTask(existingTask.id!, {
            startDate: new Date().toISOString().split('T')[0],
            deadlineDate: '',
            priority: 'low',
            description: `项目 ${project.projectNumber} 的 ${paymentTerm.name} 需要在 ${milestoneNames[paymentTerm.milestone]}后 ${paymentTerm.daysAfterMilestone} ${paymentTerm.isWorkingDays ? '个工作日' : '日'}内付款（前置里程碑：${milestoneNames[paymentTerm.milestone]}未完成）`
          });
        } else if (milestoneDate && existingTask.deadlineDate !== '') {
          const deadlineDate = await calculateDeadlineDate(milestoneDate, paymentTerm.daysAfterMilestone, paymentTerm.isWorkingDays);

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

          await updateTask(existingTask.id!, {
            startDate: milestoneDate,
            deadlineDate: deadlineDate,
            priority: priority,
            description: `项目 ${project.projectNumber} 的 ${paymentTerm.name} 需要在 ${paymentTerm.daysAfterMilestone} ${paymentTerm.isWorkingDays ? '个工作日' : '日'}后付款（截止日期：${deadlineDate}）`
          });
        }
      }
    } else if (paymentTerm.isPaid) {
      const tasks = await getProjectTasks(project.id!);
      const existingTask = tasks.find(t => 
        t.title.includes(paymentTerm.name) && 
        t.title.includes('付款') &&
        t.status === 'pending'
      );
      
      if (existingTask) {
        await updateTask(existingTask.id!, { 
          status: 'completed', 
          completedAt: new Date().toISOString() 
        });
      }
    }
  }
}

interface YearProjectsProps {
  onBack: () => void;
  selectedYear: number | null;
}

export function YearProjects({ onBack, selectedYear: externalSelectedYear }: YearProjectsProps) {
  const { selectedYear, projects, refreshProjects } = useProjects(externalSelectedYear);
  const [showAddProject, setShowAddProject] = useState(false);

  useEffect(() => {
    if (!selectedYear) {
      onBack();
    }
  }, [selectedYear, onBack]);

  if (!selectedYear) {
    return (
      <div className="min-h-screen bg-gray-100 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <p className="text-gray-500">请先选择一个年度</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        <button
          onClick={onBack}
          className="mb-4 text-blue-500 hover:text-blue-700"
        >
          ← 返回
        </button>

        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold">{selectedYear}年度项目</h1>
            <button
              onClick={() => setShowAddProject(true)}
              className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              + 添加年度项目
            </button>
          </div>

          {projects.length === 0 ? (
            <p className="text-gray-500 text-center py-8">暂无项目</p>
          ) : (
            <div className="space-y-4">
              {projects.map((project) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  onRefresh={refreshProjects}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {showAddProject && (
        <AddProjectModal
          year={selectedYear}
          onClose={() => {
            setShowAddProject(false);
            refreshProjects();
          }}
        />
      )}
    </div>
  );
}

interface ProjectCardProps {
  project: Project;
  onRefresh: () => void;
}

function ProjectCard({ project, onRefresh }: ProjectCardProps) {
  const [showDetails, setShowDetails] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [editedName, setEditedName] = useState(project.projectName);
  const [editingNumber, setEditingNumber] = useState(false);
  const [editedNumber, setEditedNumber] = useState(project.projectNumber);

  const handleDelete = async () => {
    if (window.confirm('确定要删除该项目吗？')) {
      try {
        await deleteProject(project.id!);
        await import('../services/taskService').then(async ({ deleteProjectTasks }) => {
          await deleteProjectTasks(project.id!);
        });
        onRefresh();
      } catch (error) {
        console.error('删除项目失败:', error);
        alert('删除项目失败，请重试');
      }
    }
  };

  const handleSaveName = async () => {
    try {
      const { updateProject } = await import('../services/projectService');
      await updateProject(project.id!, { ...project, projectName: editedName });
      
      const { getProjectTasks, updateTask } = await import('../services/taskService');
      const tasks = await getProjectTasks(project.id!);
      
      for (const task of tasks) {
        const newTitle = task.title.replace(project.projectName, editedName);
        if (newTitle !== task.title) {
          await updateTask(task.id!, { title: newTitle });
        }
      }
      
      onRefresh();
      setEditingName(false);
    } catch (error) {
      console.error('更新项目名称失败:', error);
      alert('更新项目名称失败，请重试');
    }
  };

  const handleSaveNumber = async () => {
    try {
      const { updateProject } = await import('../services/projectService');
      await updateProject(project.id!, { ...project, projectNumber: editedNumber });
      
      const { getProjectTasks, updateTask } = await import('../services/taskService');
      const tasks = await getProjectTasks(project.id!);
      
      for (const task of tasks) {
        const newDescription = task.description.replace(project.projectNumber, editedNumber);
        if (newDescription !== task.description) {
          await updateTask(task.id!, { description: newDescription });
        }
      }
      
      onRefresh();
      setEditingNumber(false);
    } catch (error) {
      console.error('更新项目编号失败:', error);
      alert('更新项目编号失败，请重试');
    }
  };

  return (
    <div className="border rounded-lg p-6 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start">
        <div>
          {editingNumber ? (
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={editedNumber}
                onChange={(e) => setEditedNumber(e.target.value)}
                className="flex-1 border rounded-lg px-3 py-1"
              />
              <button
                onClick={handleSaveNumber}
                className="px-3 py-1 bg-green-500 text-white rounded-lg hover:bg-green-600"
              >
                保存
              </button>
              <button
                onClick={() => {
                  setEditingNumber(false);
                  setEditedNumber(project.projectNumber);
                }}
                className="px-3 py-1 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
              >
                取消
              </button>
            </div>
          ) : (
            <h3 className="text-xl font-semibold mb-2">
              {project.projectNumber}
              <button
                onClick={() => setEditingNumber(true)}
                className="ml-2 text-blue-500 hover:text-blue-700 text-sm"
              >
                修改
              </button>
            </h3>
          )}
          {editingName ? (
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={editedName}
                onChange={(e) => setEditedName(e.target.value)}
                className="flex-1 border rounded-lg px-3 py-1"
              />
              <button
                onClick={handleSaveName}
                className="px-3 py-1 bg-green-500 text-white rounded-lg hover:bg-green-600"
              >
                保存
              </button>
              <button
                onClick={() => {
                  setEditingName(false);
                  setEditedName(project.projectName);
                }}
                className="px-3 py-1 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
              >
                取消
              </button>
            </div>
          ) : (
            <p className="text-gray-600 mb-2">
              {project.projectName}
              <button
                onClick={() => setEditingName(true)}
                className="ml-2 text-blue-500 hover:text-blue-700 text-sm"
              >
                修改
              </button>
            </p>
          )}
          <div className="flex flex-wrap gap-4 text-sm text-gray-500">
            <span>类别: {project.category}</span>
            <span>预估金额: ¥{project.estimatedAmount.toLocaleString()}</span>
            <span>预算价: ¥{project.budgetPrice.toLocaleString()}</span>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            {showDetails ? '收起' : '查看详情'}
          </button>
          <button
            onClick={handleDelete}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
            title="删除项目"
          >
            删除
          </button>
        </div>
      </div>

      {showDetails && (
        <ProjectDetails project={project} onRefresh={onRefresh} />
      )}
    </div>
  );
}

function ProjectDetails({ project, onRefresh }: { project: Project; onRefresh: () => void }) {
  const [activeTab, setActiveTab] = useState<'basic' | 'award' | 'contract' | 'construction' | 'other'>('basic');
  const [tasks, setTasks] = useState<Task[]>([]);

  useEffect(() => {
    if (project.id) {
      getProjectTasks(project.id).then(setTasks);
    }
  }, [project.id]);

  return (
    <div className="mt-6 border-t pt-6">
      <div className="flex gap-4 mb-6">
        <button
          onClick={() => setActiveTab('basic')}
          className={`px-4 py-2 rounded-lg ${activeTab === 'basic' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
        >
          基本信息
        </button>
        <button
          onClick={() => setActiveTab('award')}
          className={`px-4 py-2 rounded-lg ${activeTab === 'award' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
        >
          中标通知书
        </button>
        <button
          onClick={() => setActiveTab('contract')}
          className={`px-4 py-2 rounded-lg ${activeTab === 'contract' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
        >
          合同协议书
        </button>
        <button
          onClick={() => setActiveTab('construction')}
          className={`px-4 py-2 rounded-lg ${activeTab === 'construction' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
        >
          开工资料
        </button>
        <button
          onClick={() => setActiveTab('other')}
          className={`px-4 py-2 rounded-lg ${activeTab === 'other' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
        >
          其他事项
        </button>
      </div>

      {activeTab === 'basic' && (
        <BasicInfoSection project={project} onRefresh={onRefresh} />
      )}

      {activeTab === 'award' && (
        <AwardNoticeSection project={project} onRefresh={onRefresh} />
      )}

      {activeTab === 'contract' && (
        <ContractSection project={project} onRefresh={onRefresh} />
      )}

      {activeTab === 'construction' && (
        <ConstructionMaterialSection project={project} onRefresh={onRefresh} />
      )}

      {activeTab === 'other' && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold mb-4">其他事项</h3>
          {tasks.length === 0 ? (
            <p className="text-gray-500 text-center py-8">暂无其他事项</p>
          ) : (
            <div className="space-y-3">
              {tasks.map((task) => (
                <div
                  key={task.id}
                  className={`border rounded-lg p-4 ${task.status === 'completed' ? 'bg-gray-50' : 'bg-white'}`}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h4 className={`font-medium ${task.status === 'completed' ? 'line-through text-gray-400' : ''}`}>
                        {task.title}
                      </h4>
                      <p className="text-sm text-gray-600 mt-1">{task.description}</p>
                      <div className="flex gap-4 mt-2 text-sm text-gray-500">
                        <span>截止日期: {task.deadlineDate || '无截止日期'}</span>
                        <span>优先级: {
                          task.priority === 'urgent' ? '紧急' :
                          task.priority === 'high' ? '高' :
                          task.priority === 'normal' ? '中' : '低'
                        }</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {task.status === 'pending' && (
                        <button
                          onClick={async () => {
                            await completeTask(task.id!);
                            const updatedTasks = await getProjectTasks(project.id!);
                            setTasks(updatedTasks);
                          }}
                          className="px-3 py-1 bg-green-500 text-white rounded-lg hover:bg-green-600 text-sm"
                        >
                          完成
                        </button>
                      )}
                      <button
                        onClick={async () => {
                          if (window.confirm('确定要删除该事项吗？')) {
                            await deleteTask(task.id!);
                            const updatedTasks = await getProjectTasks(project.id!);
                            setTasks(updatedTasks);
                          }
                        }}
                        className="px-3 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600 text-sm"
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
      )}
    </div>
  );
}

function BasicInfoSection({ project, onRefresh }: { project: Project; onRefresh: () => void }) {
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    category: project.category,
    estimatedAmount: project.estimatedAmount,
    budgetPrice: project.budgetPrice,
    tenderDate: project.tenderDate
  });

  const handleSave = async () => {
    try {
      const { updateProject } = await import('../services/projectService');
      await updateProject(project.id!, { 
        ...project, 
        category: formData.category as '工程' | '服务' | '采购',
        estimatedAmount: formData.estimatedAmount,
        budgetPrice: formData.budgetPrice,
        tenderDate: formData.tenderDate
      });
      onRefresh();
      setEditing(false);
    } catch (error) {
      console.error('更新基本信息失败:', error);
      alert('更新基本信息失败，请重试');
    }
  };

  if (!editing) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">项目类别</label>
            <p className="mt-1">{project.category}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">预估金额</label>
            <p className="mt-1">¥{project.estimatedAmount.toLocaleString()}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">预算价</label>
            <p className="mt-1">¥{project.budgetPrice.toLocaleString()}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">招标日期</label>
            <p className="mt-1">{project.tenderDate}</p>
          </div>
        </div>
        <button
          onClick={() => setEditing(true)}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          编辑
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">项目类别</label>
          <select
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value as '工程' | '服务' | '采购' })}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
          >
            <option value="工程">工程</option>
            <option value="服务">服务</option>
            <option value="采购">采购</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">预估金额</label>
          <input
            type="number"
            value={formData.estimatedAmount}
            onChange={(e) => setFormData({ ...formData, estimatedAmount: Number(e.target.value) })}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">预算价</label>
          <input
            type="number"
            value={formData.budgetPrice}
            onChange={(e) => setFormData({ ...formData, budgetPrice: Number(e.target.value) })}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">招标日期</label>
          <input
            type="date"
            value={formData.tenderDate}
            onChange={(e) => setFormData({ ...formData, tenderDate: e.target.value })}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
          />
        </div>
      </div>
      <div className="flex gap-2">
        <button
          onClick={handleSave}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
        >
          保存
        </button>
        <button
          onClick={() => setEditing(false)}
          className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
        >
          取消
        </button>
      </div>
    </div>
  );
}

function AwardNoticeSection({ project, onRefresh }: { project: Project; onRefresh: () => void }) {
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState(project.awardNotice);

  const handleSave = async () => {
    await import('../services/projectService').then(async ({ updateProject }) => {
      const oldDuration = project.awardNotice.projectDuration;
      await updateProject(project.id!, { ...project, awardNotice: formData });
      
      const { getProjectTasks, addTask, updateTask } = await import('../services/taskService');
      
      if (formData.awardDate && formData.contractSignDays > 0) {
        const tasks = await getProjectTasks(project.id!);
        const existingContractTask = tasks.find(t => t.title.includes('签署合同'));
        
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

        if (existingContractTask) {
          await updateTask(existingContractTask.id!, {
            startDate: formData.awardDate,
            deadlineDays: formData.contractSignDays,
            deadlineDate: deadlineDate,
            priority: priority,
            description: `项目 ${project.projectNumber} 需要在 ${formData.contractSignDays} ${formData.isWorkingDays ? '个工作日' : '天'}内签署合同（截止日期：${deadlineDate}）`
          });
        } else {
          await addTask({
            title: `签署合同 - ${project.projectName}`,
            description: `项目 ${project.projectNumber} 需要在 ${formData.contractSignDays} ${formData.isWorkingDays ? '个工作日' : '天'}内签署合同（截止日期：${deadlineDate}）`,
            startDate: formData.awardDate,
            deadlineDays: formData.contractSignDays,
            deadlineDate: deadlineDate,
            priority: priority,
            status: 'pending',
            projectId: project.id,
            projectNumber: project.projectNumber,
            isProjectTask: true
          });
        }
      }
      
      if (oldDuration !== formData.projectDuration && project.constructionMaterial.startApplicationDate) {
        const tasks = await getProjectTasks(project.id!);
        const completionTask = tasks.find(t => t.title.includes('完工申请报告') && t.status === 'pending');
        
        if (completionTask) {
          const newDeadlineDate = await calculateDeadlineDate(project.constructionMaterial.startApplicationDate, formData.projectDuration, false);

          const today = new Date();
          const daysDiff = Math.floor((new Date(newDeadlineDate).getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
          
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

          await updateTask(completionTask.id!, {
            deadlineDays: formData.projectDuration,
            deadlineDate: newDeadlineDate,
            priority: priority,
            description: `项目 ${project.projectNumber} 需要在 ${formData.projectDuration} 天内完成完工申请报告（截止日期：${newDeadlineDate}）`
          });
        }
      }
      
      onRefresh();
      setEditing(false);
    });
  };

  if (!editing) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">中标通知书</h3>
          <button
            onClick={() => setEditing(true)}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            编辑
          </button>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">中标通知书日期</label>
            <p className="mt-1">{formData.awardDate || '未填写'}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">合同签订期限</label>
            <p className="mt-1">
              {formData.contractSignDays} {formData.isWorkingDays ? '个工作日' : '日'}
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">中标单位</label>
            <p className="mt-1">{formData.winningUnit || '未填写'}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">项目经理</label>
            <p className="mt-1">{formData.projectManagerName || '未填写'}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">项目经理身份证号</label>
            <p className="mt-1">{formData.projectManagerId || '未填写'}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">中标价格</label>
            <p className="mt-1">¥{formData.winningPrice.toLocaleString()}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">项目工期</label>
            <p className="mt-1">{formData.projectDuration}天</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">编辑中标通知书</h3>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">中标通知书日期</label>
          <input
            type="date"
            value={formData.awardDate}
            onChange={(e) => setFormData({ ...formData, awardDate: e.target.value })}
            className="w-full border rounded-lg px-4 py-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">合同签订期限</label>
          <div className="flex gap-2">
            <input
              type="number"
              value={formData.contractSignDays}
              onChange={(e) => setFormData({ ...formData, contractSignDays: Number(e.target.value) })}
              className="flex-1 border rounded-lg px-4 py-2"
            />
            <select
              value={formData.isWorkingDays ? 'true' : 'false'}
              onChange={(e) => setFormData({ ...formData, isWorkingDays: e.target.value === 'true' })}
              className="border rounded-lg px-4 py-2"
            >
              <option value="false">日</option>
              <option value="true">个工作日</option>
            </select>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">中标单位名称</label>
          <input
            type="text"
            value={formData.winningUnit}
            onChange={(e) => setFormData({ ...formData, winningUnit: e.target.value })}
            className="w-full border rounded-lg px-4 py-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">项目经理名称</label>
          <input
            type="text"
            value={formData.projectManagerName}
            onChange={(e) => setFormData({ ...formData, projectManagerName: e.target.value })}
            className="w-full border rounded-lg px-4 py-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">项目经理身份证号</label>
          <input
            type="text"
            value={formData.projectManagerId}
            onChange={(e) => setFormData({ ...formData, projectManagerId: e.target.value })}
            className="w-full border rounded-lg px-4 py-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">中标价格</label>
          <input
            type="number"
            value={formData.winningPrice}
            onChange={(e) => setFormData({ ...formData, winningPrice: Number(e.target.value) })}
            className="w-full border rounded-lg px-4 py-2"
            step="0.01"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">项目工期（天）</label>
          <input
            type="number"
            value={formData.projectDuration}
            onChange={(e) => setFormData({ ...formData, projectDuration: Number(e.target.value) })}
            className="w-full border rounded-lg px-4 py-2"
          />
        </div>
      </div>
      <div className="flex gap-4">
        <button
          onClick={handleSave}
          className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        >
          保存
        </button>
        <button
          onClick={() => setEditing(false)}
          className="px-6 py-2 border rounded-lg hover:bg-gray-50"
        >
          取消
        </button>
      </div>
    </div>
  );
}

function ContractSection({ project, onRefresh }: { project: Project; onRefresh: () => void }) {
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState(project.contract);
  const [editingPaymentTerm, setEditingPaymentTerm] = useState<number | null>(null);
  const [editingInsurance, setEditingInsurance] = useState<number | null>(null);
  const [newPaymentTerm, setNewPaymentTerm] = useState({
    name: '',
    milestone: 'contract_sign_date' as const,
    daysAfterMilestone: 0,
    isWorkingDays: false
  });
  const [newInsurance, setNewInsurance] = useState({
    name: '',
    isPurchased: false,
    purchaseDate: ''
  });

  const handleSave = async () => {
    try {
      await import('../services/projectService').then(async ({ updateProject }) => {
        await updateProject(project.id!, { ...project, contract: formData });
        
        const updatedProject = { ...project, contract: formData };
        await updatePaymentTasks(updatedProject);
        
        const { getProjectTasks, updateTask, addTask } = await import('../services/taskService');
        
        if (formData.signDate) {
          const tasks = await getProjectTasks(project.id!);
          const contractTask = tasks.find(t => t.title.includes('签署合同') && t.status === 'pending');
          if (contractTask) {
            await updateTask(contractTask.id!, { status: 'completed', completedAt: new Date().toISOString() });
          }
        }
        
        if (formData.needPerformanceBond && formData.performanceBondDays && formData.signDate) {
          const deadlineDate = await calculateDeadlineDate(formData.signDate, formData.performanceBondDays, false);

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
            title: `提交履约保函 - ${project.projectName}`,
            description: `项目 ${project.projectNumber} 需要在 ${formData.performanceBondDays} 天内提交履约保函（截止日期：${deadlineDate}）`,
            startDate: formData.signDate,
            deadlineDays: formData.performanceBondDays,
            deadlineDate: deadlineDate,
            priority: priority,
            status: 'pending',
            projectId: project.id,
            projectNumber: project.projectNumber,
            isProjectTask: true
          });
        }
        
        if (formData.performanceBondSubmitDate) {
          const tasks = await getProjectTasks(project.id!);
          const performanceBondTask = tasks.find(t => t.title.includes('提交履约保函') && t.status === 'pending');
          if (performanceBondTask) {
            await updateTask(performanceBondTask.id!, { 
              status: 'completed', 
              completedAt: formData.performanceBondSubmitDate 
            });
          }
        }

        for (const insurance of formData.insuranceTerms) {
          const tasks = await getProjectTasks(project.id!);
          const existingTask = tasks.find(t => 
            t.title.includes(insurance.name) && 
            t.title.includes('保险')
          );
          
          if (!insurance.isPurchased) {
            if (!existingTask) {
              await addTask({
                title: `购买${insurance.name}保险 - ${project.projectName}`,
                description: `项目 ${project.projectNumber} 需要购买 ${insurance.name} 保险`,
                startDate: new Date().toISOString().split('T')[0],
                deadlineDays: 0,
                deadlineDate: '',
                priority: 'low',
                status: 'pending',
                projectId: project.id,
                projectNumber: project.projectNumber,
                isProjectTask: true
              });
            }
          } else {
            if (existingTask && existingTask.status === 'pending') {
              await updateTask(existingTask.id!, { 
                status: 'completed', 
                completedAt: insurance.purchaseDate || new Date().toISOString() 
              });
            }
          }
        }
        
        onRefresh();
        setEditing(false);
      });
    } catch (error) {
      console.error('保存合同信息失败:', error);
      alert('保存合同信息失败，请重试');
    }
  };

  if (!editing) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">合同协议书</h3>
          <button
            onClick={() => setEditing(true)}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            编辑
          </button>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">签约日期</label>
            <p className="mt-1">{formData.signDate || '未填写'}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">是否需要履约保函</label>
            <p className="mt-1">{formData.needPerformanceBond ? '是' : '否'}</p>
          </div>
          {formData.needPerformanceBond && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700">履约保函提交期限</label>
                <p className="mt-1">{formData.performanceBondDays}天</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">履约保函提交时间</label>
                <p className="mt-1">{formData.performanceBondSubmitDate || '未填写'}</p>
              </div>
            </>
          )}
        </div>

        <div className="mt-6">
          <div className="flex justify-between items-center mb-4">
            <h4 className="font-semibold">付款条款</h4>
            <button
              onClick={() => {
                setNewPaymentTerm({ name: '', milestone: 'contract_sign_date', daysAfterMilestone: 0, isWorkingDays: false });
                setEditingPaymentTerm(-1);
              }}
              className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 text-sm"
            >
              + 添加付款条款
            </button>
          </div>
          {editingPaymentTerm === -1 && (
            <div className="border rounded p-4 mb-4 bg-gray-50">
              <h5 className="font-medium mb-3">添加付款条款</h5>
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">名称</label>
                  <input
                    type="text"
                    value={newPaymentTerm.name}
                    onChange={(e) => setNewPaymentTerm({ ...newPaymentTerm, name: e.target.value })}
                    className="w-full border rounded px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">里程碑</label>
                  <select
                    value={newPaymentTerm.milestone}
                    onChange={(e) => setNewPaymentTerm({ ...newPaymentTerm, milestone: e.target.value as any })}
                    className="w-full border rounded px-3 py-2"
                  >
                    <option value="contract_sign_date">签约日期</option>
                    <option value="start_application">开工申请</option>
                    <option value="completion_application">完工申请</option>
                    <option value="acceptance_certificate">验收证书</option>
                    <option value="settlement_audit">结算审核</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">天数</label>
                  <input
                    type="number"
                    value={newPaymentTerm.daysAfterMilestone}
                    onChange={(e) => setNewPaymentTerm({ ...newPaymentTerm, daysAfterMilestone: Number(e.target.value) })}
                    className="w-full border rounded px-3 py-2"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isWorkingDays"
                    checked={newPaymentTerm.isWorkingDays}
                    onChange={(e) => setNewPaymentTerm({ ...newPaymentTerm, isWorkingDays: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <label htmlFor="isWorkingDays" className="text-sm">按工作日计算</label>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={async () => {
                    const updatedPaymentTerms = [...formData.paymentTerms, { ...newPaymentTerm, id: Date.now(), isPaid: false }];
                    setFormData({ ...formData, paymentTerms: updatedPaymentTerms });
                    setEditingPaymentTerm(null);
                    
                    try {
                      const { updateProject } = await import('../services/projectService');
                      await updateProject(project.id!, { ...project, contract: { ...formData, paymentTerms: updatedPaymentTerms } });
                      
                      const { addTask } = await import('../services/taskService');
                      
                      const milestoneDates: Record<string, string | undefined> = {
                        contract_sign_date: formData.signDate,
                        start_application: project.constructionMaterial.startApplicationDate,
                        completion_application: project.constructionMaterial.completionApplicationDate,
                        acceptance_certificate: project.constructionMaterial.acceptanceCertificateDate,
                        settlement_audit: project.constructionMaterial.settlementAuditDate
                      };
                      
                      const milestoneDate = milestoneDates[newPaymentTerm.milestone];
                      
                      if (milestoneDate) {
                        const deadlineDate = await calculateDeadlineDate(milestoneDate, newPaymentTerm.daysAfterMilestone, newPaymentTerm.isWorkingDays);

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
                          title: `${newPaymentTerm.name}付款 - ${project.projectName}`,
                          description: `项目 ${project.projectNumber} 的 ${newPaymentTerm.name} 需要在 ${newPaymentTerm.daysAfterMilestone} ${newPaymentTerm.isWorkingDays ? '个工作日' : '日'}后付款（截止日期：${deadlineDate}）`,
                          startDate: milestoneDate,
                          deadlineDays: newPaymentTerm.daysAfterMilestone,
                          deadlineDate: deadlineDate,
                          priority: priority,
                          status: 'pending',
                          projectId: project.id,
                          projectNumber: project.projectNumber,
                          isProjectTask: true
                        });
                      }
                      
                      onRefresh();
                    } catch (error) {
                      console.error('保存付款条款失败:', error);
                      alert('保存付款条款失败，请重试');
                    }
                  }}
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  添加
                </button>
                <button
                  onClick={() => setEditingPaymentTerm(null)}
                  className="px-4 py-2 border rounded hover:bg-gray-50"
                >
                  取消
                </button>
              </div>
            </div>
          )}
          {formData.paymentTerms.length === 0 ? (
            <p className="text-gray-500">暂无付款条款</p>
          ) : (
            <div className="space-y-2">
              {formData.paymentTerms.map((term, index) => (
                <div key={term.id} className="border rounded p-3">
                  {editingPaymentTerm === index ? (
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">名称</label>
                          <input
                            type="text"
                            value={term.name}
                            onChange={(e) => {
                              const updated = [...formData.paymentTerms];
                              updated[index] = { ...updated[index], name: e.target.value };
                              setFormData({ ...formData, paymentTerms: updated });
                            }}
                            className="w-full border rounded px-3 py-2"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">里程碑</label>
                          <select
                            value={term.milestone}
                            onChange={(e) => {
                              const updated = [...formData.paymentTerms];
                              updated[index] = { ...updated[index], milestone: e.target.value as any };
                              setFormData({ ...formData, paymentTerms: updated });
                            }}
                            className="w-full border rounded px-3 py-2"
                          >
                            <option value="contract_sign_date">签约日期</option>
                            <option value="start_application">开工申请</option>
                            <option value="completion_application">完工申请</option>
                            <option value="acceptance_certificate">验收证书</option>
                            <option value="settlement_audit">结算审核</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">天数</label>
                          <input
                            type="number"
                            value={term.daysAfterMilestone}
                            onChange={(e) => {
                              const updated = [...formData.paymentTerms];
                              updated[index] = { ...updated[index], daysAfterMilestone: Number(e.target.value) };
                              setFormData({ ...formData, paymentTerms: updated });
                            }}
                            className="w-full border rounded px-3 py-2"
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={term.isWorkingDays}
                            onChange={(e) => {
                              const updated = [...formData.paymentTerms];
                              updated[index] = { ...updated[index], isWorkingDays: e.target.checked };
                              setFormData({ ...formData, paymentTerms: updated });
                            }}
                            className="w-4 h-4"
                          />
                          <label className="text-sm">按工作日计算</label>
                        </div>
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={term.isPaid}
                            onChange={(e) => {
                              const updated = [...formData.paymentTerms];
                              updated[index] = { ...updated[index], isPaid: e.target.checked };
                              setFormData({ ...formData, paymentTerms: updated });
                            }}
                            className="w-4 h-4"
                          />
                          <label className="text-sm">已付款</label>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={async () => {
                            setEditingPaymentTerm(null);
                            
                            try {
                              const { updateProject } = await import('../services/projectService');
                              await updateProject(project.id!, { ...project, contract: formData });
                              onRefresh();
                            } catch (error) {
                              console.error('保存付款条款失败:', error);
                              alert('保存付款条款失败，请重试');
                            }
                          }}
                          className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 text-sm"
                        >
                          保存
                        </button>
                        <button
                          onClick={async () => {
                            const termToDelete = formData.paymentTerms[index];
                            const updated = formData.paymentTerms.filter((_, i) => i !== index);
                            setFormData({ ...formData, paymentTerms: updated });
                            setEditingPaymentTerm(null);
                            
                            try {
                              const { updateProject } = await import('../services/projectService');
                              await updateProject(project.id!, { ...project, contract: { ...formData, paymentTerms: updated } });
                              
                              const { deleteTask, getProjectTasks } = await import('../services/taskService');
                              const tasks = await getProjectTasks(project.id!);
                              const taskToDelete = tasks.find(t => 
                                t.title.includes(termToDelete.name) && 
                                t.title.includes('付款')
                              );
                              if (taskToDelete) {
                                await deleteTask(taskToDelete.id!);
                              }
                              
                              onRefresh();
                            } catch (error) {
                              console.error('删除付款条款失败:', error);
                              alert('删除付款条款失败，请重试');
                            }
                          }}
                          className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
                        >
                          删除
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium">{term.name}</p>
                          <p className="text-sm text-gray-600">
                            里程碑: {term.milestone} | {term.daysAfterMilestone} {term.isWorkingDays ? '个工作日' : '日'}后付款
                          </p>
                          <p className="text-sm text-gray-600">
                            状态: {term.isPaid ? '已付款' : '未付款'}
                          </p>
                        </div>
                        <button
                          onClick={() => setEditingPaymentTerm(index)}
                          className="text-blue-500 hover:text-blue-700 text-sm"
                        >
                          编辑
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mt-6">
          <div className="flex justify-between items-center mb-4">
            <h4 className="font-semibold">保险条款</h4>
            <button
              onClick={() => {
                setNewInsurance({ name: '', isPurchased: false, purchaseDate: '' });
                setEditingInsurance(-1);
              }}
              className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 text-sm"
            >
              + 添加保险条款
            </button>
          </div>
          {editingInsurance === -1 && (
            <div className="border rounded p-4 mb-4 bg-gray-50">
              <h5 className="font-medium mb-3">添加保险条款</h5>
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">名称</label>
                  <input
                    type="text"
                    value={newInsurance.name}
                    onChange={(e) => setNewInsurance({ ...newInsurance, name: e.target.value })}
                    className="w-full border rounded px-3 py-2"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isPurchased"
                    checked={newInsurance.isPurchased}
                    onChange={(e) => setNewInsurance({ ...newInsurance, isPurchased: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <label htmlFor="isPurchased" className="text-sm">已购买</label>
                </div>
                {newInsurance.isPurchased && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">购买日期</label>
                    <input
                      type="date"
                      value={newInsurance.purchaseDate}
                      onChange={(e) => setNewInsurance({ ...newInsurance, purchaseDate: e.target.value })}
                      className="w-full border rounded px-3 py-2"
                    />
                  </div>
                )}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={async () => {
                    const updatedInsuranceTerms = [...formData.insuranceTerms, { ...newInsurance, id: Date.now() }];
                    setFormData({ ...formData, insuranceTerms: updatedInsuranceTerms });
                    setEditingInsurance(null);
                    
                    try {
                      const { updateProject } = await import('../services/projectService');
                      await updateProject(project.id!, { ...project, contract: { ...formData, insuranceTerms: updatedInsuranceTerms } });
                      
                      if (!newInsurance.isPurchased) {
                        const { addTask } = await import('../services/taskService');
                        await addTask({
                          title: `购买${newInsurance.name}保险 - ${project.projectName}`,
                          description: `项目 ${project.projectNumber} 需要购买 ${newInsurance.name} 保险`,
                          startDate: new Date().toISOString().split('T')[0],
                          deadlineDays: 0,
                          deadlineDate: '',
                          priority: 'low',
                          status: 'pending',
                          projectId: project.id,
                          projectNumber: project.projectNumber,
                          isProjectTask: true
                        });
                      }
                      
                      onRefresh();
                    } catch (error) {
                      console.error('保存保险条款失败:', error);
                      alert('保存保险条款失败，请重试');
                    }
                  }}
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  添加
                </button>
                <button
                  onClick={() => setEditingInsurance(null)}
                  className="px-4 py-2 border rounded hover:bg-gray-50"
                >
                  取消
                </button>
              </div>
            </div>
          )}
          {formData.insuranceTerms.length === 0 ? (
            <p className="text-gray-500">暂无保险条款</p>
          ) : (
            <div className="space-y-2">
              {formData.insuranceTerms.map((insurance, index) => (
                <div key={insurance.id} className="border rounded p-3">
                  {editingInsurance === index ? (
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">名称</label>
                          <input
                            type="text"
                            value={insurance.name}
                            onChange={(e) => {
                              const updated = [...formData.insuranceTerms];
                              updated[index] = { ...updated[index], name: e.target.value };
                              setFormData({ ...formData, insuranceTerms: updated });
                            }}
                            className="w-full border rounded px-3 py-2"
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={insurance.isPurchased}
                            onChange={(e) => {
                              const updated = [...formData.insuranceTerms];
                              updated[index] = { ...updated[index], isPurchased: e.target.checked };
                              setFormData({ ...formData, insuranceTerms: updated });
                            }}
                            className="w-4 h-4"
                          />
                          <label className="text-sm">已购买</label>
                        </div>
                        {insurance.isPurchased && (
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">购买日期</label>
                            <input
                              type="date"
                              value={insurance.purchaseDate || ''}
                              onChange={(e) => {
                                const updated = [...formData.insuranceTerms];
                                updated[index] = { ...updated[index], purchaseDate: e.target.value };
                                setFormData({ ...formData, insuranceTerms: updated });
                              }}
                              className="w-full border rounded px-3 py-2"
                            />
                          </div>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={async () => {
                            setEditingInsurance(null);
                            
                            try {
                              const { updateProject } = await import('../services/projectService');
                              await updateProject(project.id!, { ...project, contract: formData });
                              onRefresh();
                            } catch (error) {
                              console.error('保存保险条款失败:', error);
                              alert('保存保险条款失败，请重试');
                            }
                          }}
                          className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 text-sm"
                        >
                          保存
                        </button>
                        <button
                          onClick={async () => {
                            const insuranceToDelete = formData.insuranceTerms[index];
                            const updated = formData.insuranceTerms.filter((_, i) => i !== index);
                            setFormData({ ...formData, insuranceTerms: updated });
                            setEditingInsurance(null);
                            
                            try {
                              const { updateProject } = await import('../services/projectService');
                              await updateProject(project.id!, { ...project, contract: { ...formData, insuranceTerms: updated } });
                              
                              const { deleteTask, getProjectTasks } = await import('../services/taskService');
                              const tasks = await getProjectTasks(project.id!);
                              const taskToDelete = tasks.find(t => 
                                t.title.includes(insuranceToDelete.name) && 
                                t.title.includes('保险')
                              );
                              if (taskToDelete) {
                                await deleteTask(taskToDelete.id!);
                              }
                              
                              onRefresh();
                            } catch (error) {
                              console.error('删除保险条款失败:', error);
                              alert('删除保险条款失败，请重试');
                            }
                          }}
                          className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
                        >
                          删除
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium">{insurance.name}</p>
                          <p className="text-sm text-gray-600">
                            状态: {insurance.isPurchased ? '已购买' : '未购买'}
                          </p>
                          {insurance.purchaseDate && (
                            <p className="text-sm text-gray-600">购买日期: {insurance.purchaseDate}</p>
                          )}
                        </div>
                        <button
                          onClick={() => setEditingInsurance(index)}
                          className="text-blue-500 hover:text-blue-700 text-sm"
                        >
                          编辑
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">编辑合同协议书</h3>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">签约日期</label>
          <input
            type="date"
            value={formData.signDate || ''}
            onChange={(e) => setFormData({ ...formData, signDate: e.target.value })}
            className="w-full border rounded-lg px-4 py-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">是否需要履约保函</label>
          <select
            value={formData.needPerformanceBond ? 'true' : 'false'}
            onChange={(e) => setFormData({ ...formData, needPerformanceBond: e.target.value === 'true' })}
            className="w-full border rounded-lg px-4 py-2"
          >
            <option value="false">否</option>
            <option value="true">是</option>
          </select>
        </div>
        {formData.needPerformanceBond && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">履约保函提交期限（天）</label>
              <input
                type="number"
                value={formData.performanceBondDays || ''}
                onChange={(e) => setFormData({ ...formData, performanceBondDays: Number(e.target.value) })}
                className="w-full border rounded-lg px-4 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">履约保函提交时间</label>
              <input
                type="date"
                value={formData.performanceBondSubmitDate || ''}
                onChange={(e) => setFormData({ ...formData, performanceBondSubmitDate: e.target.value })}
                className="w-full border rounded-lg px-4 py-2"
              />
            </div>
          </>
        )}
      </div>
      <div className="flex gap-4">
        <button
          onClick={handleSave}
          className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        >
          保存
        </button>
        <button
          onClick={() => setEditing(false)}
          className="px-6 py-2 border rounded-lg hover:bg-gray-50"
        >
          取消
        </button>
      </div>
    </div>
  );
}

function ConstructionMaterialSection({ project, onRefresh }: { project: Project; onRefresh: () => void }) {
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState(project.constructionMaterial);

  const handleSave = async () => {
    await import('../services/projectService').then(async ({ updateProject }) => {
      await updateProject(project.id!, { ...project, constructionMaterial: formData });
      
      const updatedProject = { ...project, constructionMaterial: formData };
      await updatePaymentTasks(updatedProject);
      
      const { getProjectTasks, updateTask, addTask } = await import('../services/taskService');

      if (formData.needRoadOccupancyApproval && !formData.roadOccupancyApprovalDate) {
        const tasks = await getProjectTasks(project.id!);
        const existingTask = tasks.find(t => t.title.includes('占道审批'));
        
        if (!existingTask) {
          await addTask({
            title: `完成占道审批 - ${project.projectName}`,
            description: `项目 ${project.projectNumber} 需要完成占道审批`,
            startDate: new Date().toISOString().split('T')[0],
            deadlineDays: 0,
            deadlineDate: '',
            priority: 'low',
            status: 'pending',
            projectId: project.id,
            projectNumber: project.projectNumber,
            isProjectTask: true
          });
        }
      } else if (formData.roadOccupancyApprovalDate) {
        const tasks = await getProjectTasks(project.id!);
        const existingTask = tasks.find(t => 
          t.title.includes('占道审批') && 
          t.status === 'pending'
        );
        
        if (existingTask) {
          await updateTask(existingTask.id!, { 
            status: 'completed', 
            completedAt: formData.roadOccupancyApprovalDate 
          });
        }
      }

      if (formData.needStartApplication && !formData.startApplicationDate) {
        const tasks = await getProjectTasks(project.id!);
        const existingTask = tasks.find(t => t.title.includes('开工申请报告'));
        
        if (!existingTask) {
          await addTask({
            title: `完成开工申请报告 - ${project.projectName}`,
            description: `项目 ${project.projectNumber} 需要完成开工申请报告`,
            startDate: new Date().toISOString().split('T')[0],
            deadlineDays: 0,
            deadlineDate: '',
            priority: 'low',
            status: 'pending',
            projectId: project.id,
            projectNumber: project.projectNumber,
            isProjectTask: true
          });
        }
      } else if (formData.startApplicationDate) {
        const tasks = await getProjectTasks(project.id!);
        const existingTask = tasks.find(t => 
          t.title.includes('开工申请报告') && 
          t.status === 'pending'
        );
        
        if (existingTask) {
          await updateTask(existingTask.id!, { 
            status: 'completed', 
            completedAt: formData.startApplicationDate 
          });
        }
      }

      if (formData.needCompletionApplication && !formData.completionApplicationDate) {
        const tasks = await getProjectTasks(project.id!);
        const existingPendingTask = tasks.find(t => t.title.includes('完工申请报告') && t.status === 'pending');
        const existingCompletedTask = tasks.find(t => t.title.includes('完工申请报告') && t.status === 'completed');
        
        if (!existingPendingTask && !existingCompletedTask && formData.startApplicationDate && project.awardNotice.projectDuration) {
          const deadlineDate = await calculateDeadlineDate(formData.startApplicationDate, project.awardNotice.projectDuration, false);

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
            title: `完成完工申请报告 - ${project.projectName}`,
            description: `项目 ${project.projectNumber} 需要在 ${project.awardNotice.projectDuration} 天内完成完工申请报告（截止日期：${deadlineDate}）`,
            startDate: formData.startApplicationDate,
            deadlineDays: project.awardNotice.projectDuration,
            deadlineDate: deadlineDate,
            priority: priority,
            status: 'pending',
            projectId: project.id,
            projectNumber: project.projectNumber,
            isProjectTask: true
          });
        } else if (existingCompletedTask && formData.startApplicationDate) {
          const deadlineDate = await calculateDeadlineDate(formData.startApplicationDate, project.awardNotice.projectDuration, false);

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

          await updateTask(existingCompletedTask.id!, {
            status: 'pending',
            completedAt: undefined,
            startDate: formData.startApplicationDate,
            deadlineDays: project.awardNotice.projectDuration,
            deadlineDate: deadlineDate,
            priority: priority,
            description: `项目 ${project.projectNumber} 需要在 ${project.awardNotice.projectDuration} 天内完成完工申请报告（截止日期：${deadlineDate}）`
          });
        }
      } else if (formData.completionApplicationDate) {
        const tasks = await getProjectTasks(project.id!);
        const existingTask = tasks.find(t => 
          t.title.includes('完工申请报告') && 
          t.status === 'pending'
        );
        
        if (existingTask) {
          await updateTask(existingTask.id!, { 
            status: 'completed', 
            completedAt: formData.completionApplicationDate 
          });
        }
      }

      if (formData.needAcceptanceCertificate && !formData.acceptanceCertificateDate) {
        const tasks = await getProjectTasks(project.id!);
        const existingTask = tasks.find(t => t.title.includes('竣工验收证书'));
        
        if (!existingTask) {
          await addTask({
            title: `完成竣工验收证书 - ${project.projectName}`,
            description: `项目 ${project.projectNumber} 需要完成竣工验收证书`,
            startDate: new Date().toISOString().split('T')[0],
            deadlineDays: 0,
            deadlineDate: '',
            priority: 'low',
            status: 'pending',
            projectId: project.id,
            projectNumber: project.projectNumber,
            isProjectTask: true
          });
        }
      } else if (formData.acceptanceCertificateDate) {
        const tasks = await getProjectTasks(project.id!);
        const existingTask = tasks.find(t => 
          t.title.includes('竣工验收证书') && 
          t.status === 'pending'
        );
        
        if (existingTask) {
          await updateTask(existingTask.id!, { 
            status: 'completed', 
            completedAt: formData.acceptanceCertificateDate 
          });
        }
      }

      if (formData.needSettlementAudit && !formData.settlementAuditDate) {
        const tasks = await getProjectTasks(project.id!);
        const existingTask = tasks.find(t => t.title.includes('结算审核'));
        
        if (!existingTask) {
          await addTask({
            title: `完成结算审核 - ${project.projectName}`,
            description: `项目 ${project.projectNumber} 需要完成结算审核`,
            startDate: new Date().toISOString().split('T')[0],
            deadlineDays: 0,
            deadlineDate: '',
            priority: 'low',
            status: 'pending',
            projectId: project.id,
            projectNumber: project.projectNumber,
            isProjectTask: true
          });
        }
      } else if (formData.settlementAuditDate) {
        const tasks = await getProjectTasks(project.id!);
        const existingTask = tasks.find(t => 
          t.title.includes('结算审核') && 
          t.status === 'pending'
        );
        
        if (existingTask) {
          await updateTask(existingTask.id!, { 
            status: 'completed', 
            completedAt: formData.settlementAuditDate 
          });
        }
      }
      
      onRefresh();
      setEditing(false);
    });
  };

  if (!editing) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">开工资料</h3>
          <button
            onClick={() => setEditing(true)}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            编辑
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="border rounded-lg p-4">
            <h4 className="font-semibold mb-2">占道审批</h4>
            <p className="text-sm text-gray-600">是否需要: {formData.needRoadOccupancyApproval ? '是' : '否'}</p>
            {formData.needRoadOccupancyApproval && (
              <p className="text-sm text-gray-600">完成日期: {formData.roadOccupancyApprovalDate || '未完成'}</p>
            )}
          </div>
          <div className="border rounded-lg p-4">
            <h4 className="font-semibold mb-2">开工申请报告</h4>
            <p className="text-sm text-gray-600">是否需要: {formData.needStartApplication ? '是' : '否'}</p>
            {formData.needStartApplication && (
              <p className="text-sm text-gray-600">完成日期: {formData.startApplicationDate || '未完成'}</p>
            )}
          </div>
          <div className="border rounded-lg p-4">
            <h4 className="font-semibold mb-2">完工申请报告</h4>
            <p className="text-sm text-gray-600">是否需要: {formData.needCompletionApplication ? '是' : '否'}</p>
            {formData.needCompletionApplication && (
              <p className="text-sm text-gray-600">完成日期: {formData.completionApplicationDate || '未完成'}</p>
            )}
          </div>
          <div className="border rounded-lg p-4">
            <h4 className="font-semibold mb-2">竣工验收证书</h4>
            <p className="text-sm text-gray-600">是否需要: {formData.needAcceptanceCertificate ? '是' : '否'}</p>
            {formData.needAcceptanceCertificate && (
              <p className="text-sm text-gray-600">完成日期: {formData.acceptanceCertificateDate || '未完成'}</p>
            )}
          </div>
          <div className="border rounded-lg p-4">
            <h4 className="font-semibold mb-2">结算审核</h4>
            <p className="text-sm text-gray-600">是否需要: {formData.needSettlementAudit ? '是' : '否'}</p>
            {formData.needSettlementAudit && (
              <p className="text-sm text-gray-600">完成日期: {formData.settlementAuditDate || '未完成'}</p>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">编辑开工资料</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="border rounded-lg p-4">
          <h4 className="font-semibold mb-2">占道审批</h4>
          <div className="space-y-2">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.needRoadOccupancyApproval}
                onChange={(e) => setFormData({ ...formData, needRoadOccupancyApproval: e.target.checked })}
                className="mr-2"
              />
              需要占道审批
            </label>
            {formData.needRoadOccupancyApproval && (
              <input
                type="date"
                value={formData.roadOccupancyApprovalDate || ''}
                onChange={(e) => setFormData({ ...formData, roadOccupancyApprovalDate: e.target.value })}
                className="w-full border rounded-lg px-4 py-2"
              />
            )}
          </div>
        </div>
        <div className="border rounded-lg p-4">
          <h4 className="font-semibold mb-2">开工申请报告</h4>
          <div className="space-y-2">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.needStartApplication}
                onChange={(e) => setFormData({ ...formData, needStartApplication: e.target.checked })}
                className="mr-2"
              />
              需要开工申请报告
            </label>
            {formData.needStartApplication && (
              <input
                type="date"
                value={formData.startApplicationDate || ''}
                onChange={(e) => setFormData({ ...formData, startApplicationDate: e.target.value })}
                className="w-full border rounded-lg px-4 py-2"
              />
            )}
          </div>
        </div>
        <div className="border rounded-lg p-4">
          <h4 className="font-semibold mb-2">完工申请报告</h4>
          <div className="space-y-2">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.needCompletionApplication}
                onChange={(e) => setFormData({ ...formData, needCompletionApplication: e.target.checked })}
                className="mr-2"
              />
              需要完工申请报告
            </label>
            {formData.needCompletionApplication && (
              <input
                type="date"
                value={formData.completionApplicationDate || ''}
                onChange={(e) => setFormData({ ...formData, completionApplicationDate: e.target.value })}
                className="w-full border rounded-lg px-4 py-2"
              />
            )}
          </div>
        </div>
        <div className="border rounded-lg p-4">
          <h4 className="font-semibold mb-2">竣工验收证书</h4>
          <div className="space-y-2">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.needAcceptanceCertificate}
                onChange={(e) => setFormData({ ...formData, needAcceptanceCertificate: e.target.checked })}
                className="mr-2"
              />
              需要竣工验收证书
            </label>
            {formData.needAcceptanceCertificate && (
              <input
                type="date"
                value={formData.acceptanceCertificateDate || ''}
                onChange={(e) => setFormData({ ...formData, acceptanceCertificateDate: e.target.value })}
                className="w-full border rounded-lg px-4 py-2"
              />
            )}
          </div>
        </div>
        <div className="border rounded-lg p-4">
          <h4 className="font-semibold mb-2">结算审核</h4>
          <div className="space-y-2">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.needSettlementAudit}
                onChange={(e) => setFormData({ ...formData, needSettlementAudit: e.target.checked })}
                className="mr-2"
              />
              需要结算审核
            </label>
            {formData.needSettlementAudit && (
              <input
                type="date"
                value={formData.settlementAuditDate || ''}
                onChange={(e) => setFormData({ ...formData, settlementAuditDate: e.target.value })}
                className="w-full border rounded-lg px-4 py-2"
              />
            )}
          </div>
        </div>
      </div>
      <div className="flex gap-4">
        <button
          onClick={handleSave}
          className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        >
          保存
        </button>
        <button
          onClick={() => setEditing(false)}
          className="px-6 py-2 border rounded-lg hover:bg-gray-50"
        >
          取消
        </button>
      </div>
    </div>
  );
}

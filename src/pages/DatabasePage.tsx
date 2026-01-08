import { useState } from 'react';
import { useProjects } from '../hooks/useProjects';
import { useTasks } from '../hooks/useTasks';
import { formatDate } from '../utils/dateUtils';
import { deleteProject } from '../services/projectService';
import { deleteTask } from '../services/taskService';

interface DatabasePageProps {
  onBack: () => void;
}

export function DatabasePage({ onBack }: DatabasePageProps) {
  const { years, allProjects, refreshAllProjects } = useProjects();
  const { allTasks, refreshTasks } = useTasks();
  const [activeTab, setActiveTab] = useState<'projects' | 'tasks'>('projects');
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportType, setExportType] = useState<'year' | 'select' | 'all'>('all');
  const [selectedYears, setSelectedYears] = useState<number[]>([]);
  const [selectedProjects, setSelectedProjects] = useState<number[]>([]);

  const handleDeleteProject = async (projectId: number) => {
    if (window.confirm('确定要删除该项目吗？')) {
      try {
        await deleteProject(projectId);
        refreshAllProjects();
      } catch (error) {
        console.error('删除项目失败:', error);
        alert('删除项目失败，请重试');
      }
    }
  };

  const handleDeleteTask = async (taskId: number) => {
    if (window.confirm('确定要删除该任务吗？')) {
      try {
        await deleteTask(taskId);
        refreshTasks();
      } catch (error) {
        console.error('删除任务失败:', error);
        alert('删除任务失败，请重试');
      }
    }
  };

  const handleExport = () => {
    setShowExportModal(true);
  };

  const handleExportConfirm = () => {
    let projectsToExport: typeof allProjects = [];

    if (exportType === 'all') {
      projectsToExport = allProjects;
    } else if (exportType === 'year') {
      projectsToExport = allProjects.filter(p => selectedYears.includes(p.year));
    } else if (exportType === 'select') {
      projectsToExport = allProjects.filter(p => selectedProjects.includes(p.id!));
    }

    const markdown = generateMarkdownReport(projectsToExport);
    downloadMarkdown(markdown);
    setShowExportModal(false);
    setSelectedYears([]);
    setSelectedProjects([]);
  };

  const generateMarkdownReport = (projects: typeof allProjects): string => {
    let markdown = '# 项目报告\n\n';
    markdown += `生成时间：${new Date().toLocaleString('zh-CN')}\n\n`;
    markdown += `项目总数：${projects.length}\n\n`;
    markdown += '---\n\n';

    const years = [...new Set(projects.map(p => p.year))].sort((a, b) => a - b);

    years.forEach(year => {
      const yearProjects = projects.filter(p => p.year === year);
      markdown += `## ${year}年度\n\n`;
      markdown += `项目数量：${yearProjects.length}\n\n`;

      yearProjects.forEach(project => {
        markdown += `### ${project.projectNumber} - ${project.projectName}\n\n`;
        markdown += `- **类别**：${project.category}\n`;
        markdown += `- **预算价格**：¥${project.budgetPrice.toLocaleString()}\n`;
        markdown += `- **中标价格**：¥${project.awardNotice.winningPrice.toLocaleString()}\n`;
        markdown += `- **招标日期**：${formatDate(project.tenderDate)}\n`;
        markdown += `- **中标单位**：${project.awardNotice.winningUnit}\n`;
        markdown += `- **项目经理**：${project.awardNotice.projectManagerName}\n`;
        markdown += `- **项目经理ID**：${project.awardNotice.projectManagerId}\n`;
        markdown += `- **中标日期**：${formatDate(project.awardNotice.awardDate)}\n`;
        markdown += `- **合同签署期限**：${project.awardNotice.contractSignDays}${project.awardNotice.isWorkingDays ? '个工作日' : '天'}\n`;
        markdown += `- **项目工期**：${project.awardNotice.projectDuration}天\n\n`;

        if (project.contract.signDate) {
          markdown += `#### 合同信息\n\n`;
          markdown += `- **签署日期**：${formatDate(project.contract.signDate)}\n`;
          markdown += `- **需要履约保函**：${project.contract.needPerformanceBond ? '是' : '否'}\n`;
          if (project.contract.needPerformanceBond) {
            markdown += `- **履约保函期限**：${project.contract.performanceBondDays}天\n`;
            if (project.contract.performanceBondSubmitDate) {
              markdown += `- **履约保函提交日期**：${formatDate(project.contract.performanceBondSubmitDate)}\n`;
            }
          }
          markdown += '\n';
        }

        if (project.contract.paymentTerms.length > 0) {
          markdown += `#### 付款条款\n\n`;
          project.contract.paymentTerms.forEach(term => {
            const milestoneNames: Record<string, string> = {
              contract_sign_date: '合同签署',
              start_application: '开工申请',
              completion_application: '完工申请',
              acceptance_certificate: '验收证书',
              settlement_audit: '结算审计'
            };
            markdown += `- **${term.name}**\n`;
            markdown += `  - 里程碑：${milestoneNames[term.milestone]}\n`;
            markdown += `  - 付款期限：${term.daysAfterMilestone}${term.isWorkingDays ? '个工作日' : '天'}\n`;
            markdown += `  - 付款状态：${term.isPaid ? '已付款' : '未付款'}\n`;
            if (term.paymentDate) {
              markdown += `  - 付款日期：${formatDate(term.paymentDate)}\n`;
            }
            markdown += '\n';
          });
        }

        if (project.contract.insuranceTerms.length > 0) {
          markdown += `#### 保险条款\n\n`;
          project.contract.insuranceTerms.forEach(insurance => {
            markdown += `- **${insurance.name}**：${insurance.isPurchased ? '已购买' : '未购买'}`;
            if (insurance.purchaseDate) {
              markdown += `（${formatDate(insurance.purchaseDate)}）`;
            }
            markdown += '\n';
          });
          markdown += '\n';
        }

        if (project.constructionMaterial.needRoadOccupancyApproval ||
            project.constructionMaterial.needStartApplication ||
            project.constructionMaterial.needCompletionApplication ||
            project.constructionMaterial.needAcceptanceCertificate ||
            project.constructionMaterial.needSettlementAudit) {
          markdown += `#### 建材相关\n\n`;
          if (project.constructionMaterial.needRoadOccupancyApproval) {
            markdown += `- **占道审批**：${project.constructionMaterial.roadOccupancyApprovalDate ? formatDate(project.constructionMaterial.roadOccupancyApprovalDate) : '待办理'}\n`;
          }
          if (project.constructionMaterial.needStartApplication) {
            markdown += `- **开工申请**：${project.constructionMaterial.startApplicationDate ? formatDate(project.constructionMaterial.startApplicationDate) : '待办理'}\n`;
          }
          if (project.constructionMaterial.needCompletionApplication) {
            markdown += `- **完工申请**：${project.constructionMaterial.completionApplicationDate ? formatDate(project.constructionMaterial.completionApplicationDate) : '待办理'}\n`;
          }
          if (project.constructionMaterial.needAcceptanceCertificate) {
            markdown += `- **验收证书**：${project.constructionMaterial.acceptanceCertificateDate ? formatDate(project.constructionMaterial.acceptanceCertificateDate) : '待办理'}\n`;
          }
          if (project.constructionMaterial.needSettlementAudit) {
            markdown += `- **结算审计**：${project.constructionMaterial.settlementAuditDate ? formatDate(project.constructionMaterial.settlementAuditDate) : '待办理'}\n`;
          }
          markdown += '\n';
        }

        const projectTasks = allTasks.filter(t => t.projectId === project.id);
        if (projectTasks.length > 0) {
          markdown += `#### 相关任务\n\n`;
          projectTasks.forEach(task => {
            markdown += `- **${task.title}**\n`;
            markdown += `  - 状态：${task.status === 'completed' ? '已完成' : '待完成'}\n`;
            markdown += `  - 优先级：${task.priority === 'urgent' ? '加急' : task.priority === 'high' ? '急' : task.priority === 'normal' ? '普通' : '不急'}\n`;
            markdown += `  - 开始日期：${formatDate(task.startDate)}\n`;
            markdown += `  - 截止日期：${formatDate(task.deadlineDate)}\n`;
            markdown += '\n';
          });
        }

        markdown += '---\n\n';
      });
    });

    return markdown;
  };

  const downloadMarkdown = (content: string) => {
    const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `项目报告_${new Date().toISOString().split('T')[0]}.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <button
                onClick={onBack}
                className="px-6 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors"
              >
                ← 返回
              </button>
              <h1 className="text-3xl font-bold">数据库</h1>
            </div>
            <button
              onClick={handleExport}
              className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
            >
              导出报告
            </button>
          </div>
          <p className="text-gray-600">
            储存了历史所有的项目及其事项和其他事项（项目按照年度和项目编号排序，其他事项按照开始日期排序）
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-lg">
          <div className="border-b">
            <div className="flex">
              <button
                onClick={() => setActiveTab('projects')}
                className={`px-6 py-4 font-semibold transition-colors ${
                  activeTab === 'projects'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                项目数据
              </button>
              <button
                onClick={() => setActiveTab('tasks')}
                className={`px-6 py-4 font-semibold transition-colors ${
                  activeTab === 'tasks'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                任务数据
              </button>
            </div>
          </div>

          <div className="p-6">
            {activeTab === 'projects' ? (
              <div>
                {years.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">暂无项目数据</p>
                ) : (
                  <div className="space-y-6">
                    {years.map((year) => {
                      const yearProjects = allProjects.filter(p => p.year === year.year);
                      return (
                        <div key={year.id}>
                          <h3 className="text-2xl font-bold mb-4 text-blue-600">{year.year}年度</h3>
                          {yearProjects.length === 0 ? (
                            <p className="text-gray-500 ml-4">该年度暂无项目</p>
                          ) : (
                            <div className="space-y-4 ml-4">
                              {yearProjects
                                .sort((a, b) => a.projectNumber.localeCompare(b.projectNumber))
                                .map((project) => (
                                  <div
                                    key={project.id}
                                    className="border rounded-lg p-6 hover:shadow-md transition-shadow"
                                  >
                                    <div className="flex justify-between items-start">
                                      <div className="flex-1">
                                        <h4 className="font-semibold text-xl mb-3">
                                          {project.projectNumber} - {project.projectName}
                                        </h4>
                                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm text-gray-600">
                                          <div>
                                            <span className="font-medium">类别：</span>
                                            {project.category}
                                          </div>
                                          <div>
                                            <span className="font-medium">预算价格：</span>
                                            ¥{project.budgetPrice.toLocaleString()}
                                          </div>
                                          <div>
                                            <span className="font-medium">中标价格：</span>
                                            ¥{project.awardNotice.winningPrice.toLocaleString()}
                                          </div>
                                          <div>
                                            <span className="font-medium">招标日期：</span>
                                            {formatDate(project.tenderDate)}
                                          </div>
                                          <div>
                                            <span className="font-medium">项目经理：</span>
                                            {project.awardNotice.projectManagerName}
                                          </div>
                                          <div>
                                            <span className="font-medium">中标单位：</span>
                                            {project.awardNotice.winningUnit}
                                          </div>
                                        </div>
                                      </div>
                                      <button
                                        onClick={() => project.id && handleDeleteProject(project.id)}
                                        className="px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                                        title="删除项目"
                                      >
                                        删除
                                      </button>
                                    </div>
                                  </div>
                                ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            ) : (
              <div>
                {allTasks.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">暂无任务数据</p>
                ) : (
                  <div className="space-y-4">
                    {allTasks
                      .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
                      .map((task) => (
                        <div
                          key={task.id}
                          className="border rounded-lg p-6 hover:shadow-md transition-shadow"
                        >
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <h4 className="font-semibold text-xl mb-3">{task.title}</h4>
                              <p className="text-gray-600 mb-3">{task.description}</p>
                              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm text-gray-600">
                                <div>
                                  <span className="font-medium">开始日期：</span>
                                  {formatDate(task.startDate)}
                                </div>
                                <div>
                                  <span className="font-medium">截止日期：</span>
                                  {formatDate(task.deadlineDate)}
                                </div>
                                {task.projectNumber && (
                                  <div>
                                    <span className="font-medium">项目编号：</span>
                                    {task.projectNumber}
                                  </div>
                                )}
                                <div>
                                  <span className="font-medium">优先级：</span>
                                  {task.priority === 'urgent' && '加急'}
                                  {task.priority === 'high' && '急'}
                                  {task.priority === 'normal' && '普通'}
                                  {task.priority === 'low' && '不急'}
                                </div>
                                <div>
                                  <span className="font-medium">状态：</span>
                                  {task.status === 'pending' ? '待完成' : '已完成'}
                                </div>
                              </div>
                            </div>
                            <button
                              onClick={() => task.id && handleDeleteTask(task.id)}
                              className="px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                              title="删除任务"
                            >
                              删除
                            </button>
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {showExportModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center p-6 border-b">
                <h2 className="text-2xl font-bold">导出报告</h2>
                <button
                  onClick={() => setShowExportModal(false)}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ×
                </button>
              </div>
              <div className="p-6 space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    导出范围
                  </label>
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="exportType"
                        value="all"
                        checked={exportType === 'all'}
                        onChange={(e) => setExportType(e.target.value as 'year' | 'select' | 'all')}
                        className="mr-2"
                      />
                      <span>导出全部项目</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="exportType"
                        value="year"
                        checked={exportType === 'year'}
                        onChange={(e) => setExportType(e.target.value as 'year' | 'select' | 'all')}
                        className="mr-2"
                      />
                      <span>按年度导出</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="exportType"
                        value="select"
                        checked={exportType === 'select'}
                        onChange={(e) => setExportType(e.target.value as 'year' | 'select' | 'all')}
                        className="mr-2"
                      />
                      <span>选择项目导出</span>
                    </label>
                  </div>
                </div>

                {exportType === 'year' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      选择年度
                    </label>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {years.map(year => (
                        <label key={year.id} className="flex items-center">
                          <input
                            type="checkbox"
                            checked={selectedYears.includes(year.year)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedYears([...selectedYears, year.year]);
                              } else {
                                setSelectedYears(selectedYears.filter(y => y !== year.year));
                              }
                            }}
                            className="mr-2"
                          />
                          <span>{year.year}年度</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                {exportType === 'select' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      选择项目
                    </label>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {allProjects.map(project => (
                        <label key={project.id} className="flex items-start">
                          <input
                            type="checkbox"
                            checked={selectedProjects.includes(project.id!)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedProjects([...selectedProjects, project.id!]);
                              } else {
                                setSelectedProjects(selectedProjects.filter(id => id !== project.id));
                              }
                            }}
                            className="mr-2 mt-1"
                          />
                          <span className="text-sm">
                            {project.projectNumber} - {project.projectName}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex justify-end gap-4 pt-4 border-t">
                  <button
                    onClick={() => setShowExportModal(false)}
                    className="px-6 py-2 border rounded-lg hover:bg-gray-50"
                  >
                    取消
                  </button>
                  <button
                    onClick={handleExportConfirm}
                    className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                  >
                    确认导出
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

import { useState, useEffect } from 'react';
import { useProjects } from '../hooks/useProjects';
import { useTasks } from '../hooks/useTasks';
import { formatDate } from '../utils/dateUtils';
import { exportProjectToMarkdown } from '../utils/exportUtils';

interface DatabaseDetailViewProps {
  type: 'project' | 'task';
  id: number;
  onClose: () => void;
}

export function DatabaseDetailView({ type, id, onClose }: DatabaseDetailViewProps) {
  const { allProjects } = useProjects();
  const { allTasks } = useTasks();
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    if (type === 'project') {
      const project = allProjects.find(p => p.id === id);
      setData(project);
    } else {
      const task = allTasks.find(t => t.id === id);
      setData(task);
    }
  }, [type, id, allProjects, allTasks]);

  if (!data) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
          <div className="flex justify-between items-center p-6 border-b">
            <h2 className="text-2xl font-bold">加载数据...</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-2xl"
            >
              ×
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex justify-between items-center p-6 border-b flex-shrink-0">
          <h2 className="text-2xl font-bold">
            {type === 'project' ? '工程详情' : '事项详情'}
          </h2>
          <div className="flex gap-2">
            {type === 'project' && (
              <button
                onClick={() => exportProjectToMarkdown(data)}
                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
              >
                导出为MD
              </button>
            )}
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-2xl"
            >
              ×
            </button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto flex-1">
          {type === 'project' ? (
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-bold mb-4">基本信息</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">项目编号</label>
                    <p className="mt-1">{data.projectNumber}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">项目名称</label>
                    <p className="mt-1">{data.projectName}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">项目类别</label>
                    <p className="mt-1">{data.category}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">年度</label>
                    <p className="mt-1">{data.year}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">预估金额</label>
                    <p className="mt-1">¥{data.estimatedAmount.toLocaleString()}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">预算价</label>
                    <p className="mt-1">¥{data.budgetPrice.toLocaleString()}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">招标日期</label>
                    <p className="mt-1">{formatDate(data.tenderDate)}</p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-xl font-bold mb-4">中标通知书</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">中标日期</label>
                    <p className="mt-1">{formatDate(data.awardNotice.awardDate)}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">合同签订天数</label>
                    <p className="mt-1">{data.awardNotice.contractSignDays}天</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">中标单位</label>
                    <p className="mt-1">{data.awardNotice.winningUnit}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">项目经理姓名</label>
                    <p className="mt-1">{data.awardNotice.projectManagerName}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">项目经理身份证号</label>
                    <p className="mt-1">{data.awardNotice.projectManagerId}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">中标价格</label>
                    <p className="mt-1">¥{data.awardNotice.winningPrice.toLocaleString()}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">工期</label>
                    <p className="mt-1">{data.awardNotice.projectDuration}天</p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-xl font-bold mb-4">合同协议书</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">合同签订日期</label>
                    <p className="mt-1">{data.contract.signDate ? formatDate(data.contract.signDate) : '未签订'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">需要履约保函</label>
                    <p className="mt-1">{data.contract.needPerformanceBond ? '是' : '否'}</p>
                  </div>
                  {data.contract.needPerformanceBond && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">履约保函提交期限</label>
                      <p className="mt-1">{data.contract.performanceBondDays}天</p>
                    </div>
                  )}
                </div>

                <div className="mt-4">
                  <h4 className="font-semibold mb-2">付款条款</h4>
                  {data.contract.paymentTerms.length === 0 ? (
                    <p className="text-gray-500">暂无付款条款</p>
                  ) : (
                    <div className="space-y-2">
                      {data.contract.paymentTerms.map((term: any, index: number) => (
                        <div key={index} className="border rounded-lg p-3">
                          <p><strong>名称:</strong> {term.name}</p>
                          <p><strong>里程碑:</strong> {term.milestone}</p>
                          <p><strong>里程碑后天数:</strong> {term.daysAfterMilestone}天</p>
                          <p><strong>是否工作日:</strong> {term.isWorkingDays ? '是' : '否'}</p>
                          {term.paymentDate && <p><strong>付款日期:</strong> {formatDate(term.paymentDate)}</p>}
                          <p><strong>是否已付款:</strong> {term.isPaid ? '是' : '否'}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="mt-4">
                  <h4 className="font-semibold mb-2">保险条款</h4>
                  {data.contract.insuranceTerms.length === 0 ? (
                    <p className="text-gray-500">暂无保险条款</p>
                  ) : (
                    <div className="space-y-2">
                      {data.contract.insuranceTerms.map((insurance: any, index: number) => (
                        <div key={index} className="border rounded-lg p-3">
                          <p><strong>名称:</strong> {insurance.name}</p>
                          <p><strong>是否已购买:</strong> {insurance.isPurchased ? '是' : '否'}</p>
                          {insurance.purchaseDate && <p><strong>购买日期:</strong> {formatDate(insurance.purchaseDate)}</p>}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div>
                <h3 className="text-xl font-bold mb-4">开工资料</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">需要道路占用审批</label>
                    <p className="mt-1">{data.constructionMaterial.needRoadOccupancyApproval ? '是' : '否'}</p>
                    {data.constructionMaterial.roadOccupancyApprovalDate && (
                      <p className="text-sm text-gray-600">日期: {formatDate(data.constructionMaterial.roadOccupancyApprovalDate)}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">需要开工申请</label>
                    <p className="mt-1">{data.constructionMaterial.needStartApplication ? '是' : '否'}</p>
                    {data.constructionMaterial.startApplicationDate && (
                      <p className="text-sm text-gray-600">日期: {formatDate(data.constructionMaterial.startApplicationDate)}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">需要完工申请</label>
                    <p className="mt-1">{data.constructionMaterial.needCompletionApplication ? '是' : '否'}</p>
                    {data.constructionMaterial.completionApplicationDate && (
                      <p className="text-sm text-gray-600">日期: {formatDate(data.constructionMaterial.completionApplicationDate)}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">需要验收证书</label>
                    <p className="mt-1">{data.constructionMaterial.needAcceptanceCertificate ? '是' : '否'}</p>
                    {data.constructionMaterial.acceptanceCertificateDate && (
                      <p className="text-sm text-gray-600">日期: {formatDate(data.constructionMaterial.acceptanceCertificateDate)}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">需要结算审核</label>
                    <p className="mt-1">{data.constructionMaterial.needSettlementAudit ? '是' : '否'}</p>
                    {data.constructionMaterial.settlementAuditDate && (
                      <p className="text-sm text-gray-600">日期: {formatDate(data.constructionMaterial.settlementAuditDate)}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">标题</label>
                <p className="mt-1 text-lg font-semibold">{data.title}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">描述</label>
                <p className="mt-1">{data.description}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">开始日期</label>
                  <p className="mt-1">{formatDate(data.startDate)}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">截止日期</label>
                  <p className="mt-1">{data.deadlineDate || '无截止日期'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">优先级</label>
                  <p className="mt-1">
                    {data.priority === 'urgent' ? '紧急' :
                     data.priority === 'high' ? '高' :
                     data.priority === 'normal' ? '中' : '低'}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">状态</label>
                  <p className="mt-1">{data.status === 'completed' ? '已完成' : '待处理'}</p>
                </div>
                {data.projectNumber && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">项目编号</label>
                    <p className="mt-1">{data.projectNumber}</p>
                  </div>
                )}
              </div>
              {data.completedAt && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">完成时间</label>
                  <p className="mt-1">{formatDate(data.completedAt)}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

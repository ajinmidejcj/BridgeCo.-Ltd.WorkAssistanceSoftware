import { Project } from '../types';

export function exportProjectToMarkdown(project: Project): void {
  const markdown = generateProjectMarkdown(project);
  const blob = new Blob([markdown], { type: 'text/markdown;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${project.projectNumber}_${project.projectName}.md`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function generateProjectMarkdown(project: Project): string {
  let markdown = `# ${project.projectNumber} - ${project.projectName}\n\n`;
  markdown += `**年度:** ${project.year}\n\n`;
  markdown += `**项目类别:** ${project.category}\n\n`;
  markdown += `**创建时间:** ${project.createdAt}\n\n`;

  markdown += `## 基本信息\n\n`;
  markdown += `- **项目编号:** ${project.projectNumber}\n`;
  markdown += `- **项目名称:** ${project.projectName}\n`;
  markdown += `- **项目类别:** ${project.category}\n`;
  markdown += `- **预估金额:** ¥${project.estimatedAmount.toLocaleString()}\n`;
  markdown += `- **预算价:** ¥${project.budgetPrice.toLocaleString()}\n`;
  markdown += `- **招标日期:** ${project.tenderDate}\n\n`;

  markdown += `## 中标通知书\n\n`;
  markdown += `- **中标日期:** ${project.awardNotice.awardDate}\n`;
  markdown += `- **合同签订天数:** ${project.awardNotice.contractSignDays}天\n`;
  markdown += `- **是否工作日:** ${project.awardNotice.isWorkingDays ? '是' : '否'}\n`;
  markdown += `- **中标单位:** ${project.awardNotice.winningUnit}\n`;
  markdown += `- **项目经理姓名:** ${project.awardNotice.projectManagerName}\n`;
  markdown += `- **项目经理身份证号:** ${project.awardNotice.projectManagerId}\n`;
  markdown += `- **中标价格:** ¥${project.awardNotice.winningPrice.toLocaleString()}\n`;
  markdown += `- **工期:** ${project.awardNotice.projectDuration}天\n\n`;

  markdown += `## 合同协议书\n\n`;
  markdown += `- **合同签订日期:** ${project.contract.signDate || '未签订'}\n`;
  markdown += `- **需要履约保函:** ${project.contract.needPerformanceBond ? '是' : '否'}\n`;
  if (project.contract.needPerformanceBond) {
    markdown += `- **履约保函提交期限:** ${project.contract.performanceBondDays}天\n`;
  }
  markdown += `\n`;

  if (project.contract.paymentTerms.length > 0) {
    markdown += `### 付款条款\n\n`;
    project.contract.paymentTerms.forEach((term, index) => {
      markdown += `${index + 1}. **${term.name}**\n`;
      markdown += `   - 里程碑: ${term.milestone}\n`;
      markdown += `   - 里程碑后天数: ${term.daysAfterMilestone}天\n`;
      markdown += `   - 是否工作日: ${term.isWorkingDays ? '是' : '否'}\n`;
      if (term.paymentDate) {
        markdown += `   - 付款日期: ${term.paymentDate}\n`;
      }
      markdown += `   - 是否已付款: ${term.isPaid ? '是' : '否'}\n\n`;
    });
  }

  if (project.contract.insuranceTerms.length > 0) {
    markdown += `### 保险条款\n\n`;
    project.contract.insuranceTerms.forEach((insurance, index) => {
      markdown += `${index + 1}. **${insurance.name}**\n`;
      markdown += `   - 是否已购买: ${insurance.isPurchased ? '是' : '否'}\n`;
      if (insurance.purchaseDate) {
        markdown += `   - 购买日期: ${insurance.purchaseDate}\n`;
      }
      markdown += `\n`;
    });
  }

  markdown += `## 开工资料\n\n`;
  markdown += `- **需要道路占用审批:** ${project.constructionMaterial.needRoadOccupancyApproval ? '是' : '否'}\n`;
  if (project.constructionMaterial.roadOccupancyApprovalDate) {
    markdown += `  - 日期: ${project.constructionMaterial.roadOccupancyApprovalDate}\n`;
  }
  markdown += `- **需要开工申请:** ${project.constructionMaterial.needStartApplication ? '是' : '否'}\n`;
  if (project.constructionMaterial.startApplicationDate) {
    markdown += `  - 日期: ${project.constructionMaterial.startApplicationDate}\n`;
  }
  markdown += `- **需要完工申请:** ${project.constructionMaterial.needCompletionApplication ? '是' : '否'}\n`;
  if (project.constructionMaterial.completionApplicationDate) {
    markdown += `  - 日期: ${project.constructionMaterial.completionApplicationDate}\n`;
  }
  markdown += `- **需要验收证书:** ${project.constructionMaterial.needAcceptanceCertificate ? '是' : '否'}\n`;
  if (project.constructionMaterial.acceptanceCertificateDate) {
    markdown += `  - 日期: ${project.constructionMaterial.acceptanceCertificateDate}\n`;
  }
  markdown += `- **需要结算审核:** ${project.constructionMaterial.needSettlementAudit ? '是' : '否'}\n`;
  if (project.constructionMaterial.settlementAuditDate) {
    markdown += `  - 日期: ${project.constructionMaterial.settlementAuditDate}\n`;
  }

  return markdown;
}

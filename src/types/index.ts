export type TaskPriority = 'urgent' | 'high' | 'normal' | 'low';

export type TaskStatus = 'pending' | 'completed';

export type ProjectCategory = '工程' | '服务' | '采购';

export type MilestoneType = 
  | 'contract_sign_date'
  | 'start_application'
  | 'completion_application'
  | 'acceptance_certificate'
  | 'settlement_audit';

export interface Task {
  id?: number;
  title: string;
  description: string;
  startDate: string;
  deadlineDays: number;
  deadlineDate: string;
  priority: TaskPriority;
  status: TaskStatus;
  projectId?: number;
  projectNumber?: string;
  isProjectTask: boolean;
  createdAt: string;
  completedAt?: string;
}

export interface PaymentTerm {
  id?: number;
  name: string;
  milestone: MilestoneType;
  daysAfterMilestone: number;
  isWorkingDays: boolean;
  paymentDate?: string;
  isPaid: boolean;
}

export interface Insurance {
  id?: number;
  name: string;
  isPurchased: boolean;
  purchaseDate?: string;
}

export interface ConstructionMaterial {
  needRoadOccupancyApproval: boolean;
  roadOccupancyApprovalDate?: string;
  
  needStartApplication: boolean;
  startApplicationDate?: string;
  
  needCompletionApplication: boolean;
  completionApplicationDate?: string;
  
  needAcceptanceCertificate: boolean;
  acceptanceCertificateDate?: string;
  
  needSettlementAudit: boolean;
  settlementAuditDate?: string;
}

export interface AwardNotice {
  awardDate: string;
  contractSignDays: number;
  isWorkingDays: boolean;
  winningUnit: string;
  projectManagerName: string;
  projectManagerId: string;
  winningPrice: number;
  projectDuration: number;
}

export interface Contract {
  signDate?: string;
  needPerformanceBond: boolean;
  performanceBondDays?: number;
  performanceBondSubmitDate?: string;
  paymentTerms: PaymentTerm[];
  insuranceTerms: Insurance[];
}

export interface Project {
  id?: number;
  year: number;
  projectNumber: string;
  projectName: string;
  category: ProjectCategory;
  estimatedAmount: number;
  budgetPrice: number;
  tenderDate: string;
  awardNotice: AwardNotice;
  contract: Contract;
  constructionMaterial: ConstructionMaterial;
  createdAt: string;
}

export interface Year {
  id?: number;
  year: number;
  createdAt: string;
}

export interface TaskSummary {
  overdue: number;
  today: number;
  next7Days: number;
  next30Days: number;
  other: number;
}

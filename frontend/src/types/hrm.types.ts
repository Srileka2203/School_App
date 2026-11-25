// HRM Suite TypeScript Definitions

export interface HrmEmployee {
  id: string;
  employeeNumber: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string | null;
  avatar?: string | null;
  gender?: string | null;
  dateOfBirth?: string | null;
  departmentId?: string | null;
  department?: string | null;
  designationId?: string | null;
  designation?: string | null;
  locationId?: string | null;
  location?: string | null;
  jobGradeId?: string | null;
  jobGrade?: string | null;
  employmentTypeId?: string | null;
  employmentType?: string | null;
  status: 'ACTIVE' | 'INACTIVE' | 'TERMINATED' | 'ON_LEAVE';
  joiningDate?: string | null;
  salary?: number | null;
  currency?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface HrmDepartment {
  id: string;
  name: string;
  code?: string | null;
  headOfDepartment?: string | null;
  parentDepartmentId?: string | null;
  description?: string | null;
  status: 'ACTIVE' | 'INACTIVE';
  employeeCount?: number;
  createdAt?: string;
}

export interface HrmDesignation {
  id: string;
  title: string;
  code?: string | null;
  departmentId?: string | null;
  department?: string | null;
  jobGrade?: string | null;
  description?: string | null;
  status: 'ACTIVE' | 'INACTIVE';
  createdAt?: string;
}

export interface HrmLocation {
  id: string;
  name: string;
  code?: string | null;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  country?: string | null;
  isHeadquarters?: boolean;
  status: 'ACTIVE' | 'INACTIVE';
  createdAt?: string;
}

export interface HrmJobGrade {
  id: string;
  gradeName: string;
  gradeLevel?: string | null;
  minSalary?: number | null;
  maxSalary?: number | null;
  currency?: string;
  description?: string | null;
  createdAt?: string;
}

export interface HrmEmploymentType {
  id: string;
  name: string;
  code?: string | null;
  description?: string | null;
  isPermanent?: boolean;
  createdAt?: string;
}

export interface HrmEmployeeSkill {
  id: string;
  employeeId: string;
  employeeName?: string;
  skillName: string;
  proficiencyLevel: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT';
  proficiency?: string;
  yearsOfExperience?: number | null;
  verified?: boolean;
  createdAt?: string;
}

export interface HrmEmployeeEducation {
  id: string;
  employeeId: string;
  employeeName?: string;
  institutionName: string;
  degree: string;
  fieldOfStudy?: string | null;
  grade?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  createdAt?: string;
}

export interface HrmEmployeeExperience {
  id: string;
  employeeId: string;
  employeeName?: string;
  companyName: string;
  jobTitle: string;
  description?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  createdAt?: string;
}

export interface HrmEmployeeCertification {
  id: string;
  employeeId: string;
  employeeName?: string;
  certificationName: string;
  issuingOrganization: string;
  credentialId?: string | null;
  credentialUrl?: string | null;
  issueDate?: string | null;
  expiryDate?: string | null;
  createdAt?: string;
}

export interface HrmEmployeeDocument {
  id: string;
  employeeId: string;
  employeeName?: string;
  documentType: 'PASSPORT' | 'ID_CARD' | 'CONTRACT' | 'CERTIFICATE' | 'TAX_FORM' | 'OTHER';
  documentNumber?: string | null;
  fileUrl: string;
  issueDate?: string | null;
  expiryDate?: string | null;
  createdAt?: string;
}

export interface HrmEmployeeHistoryItem {
  id: string;
  employeeId: string;
  employeeName?: string;
  eventType: string;
  description: string;
  previousValue?: string | null;
  newValue?: string | null;
  effectiveDate: string;
  createdAt?: string;
}

export interface HrmAttendance {
  id: string;
  employeeId: string;
  employeeName?: string;
  date: string;
  clockIn?: string | null;
  clockOut?: string | null;
  checkIn?: string | null;
  checkOut?: string | null;
  totalHours?: number;
  status: 'PRESENT' | 'ABSENT' | 'LATE' | 'HALF_DAY' | 'ON_LEAVE';
  method?: string;
  createdAt?: string;
}

export interface HrmLeaveRequest {
  id: string;
  employeeId: string;
  employeeName?: string;
  leaveType: 'ANNUAL' | 'SICK' | 'CASUAL' | 'MATERNITY' | 'PATERNITY' | 'UNPAID';
  startDate: string;
  endDate: string;
  totalDays: number;
  reason?: string | null;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';
  approvedBy?: string | null;
  rejectionReason?: string | null;
  createdAt?: string;
}

export interface HrmShift {
  id: string;
  name: string;
  startTime: string;
  endTime: string;
  breakMinutes?: number;
  assignedCount?: number;
  status: 'ACTIVE' | 'INACTIVE';
  createdAt?: string;
}

export interface HrmPayrollRun {
  id: string;
  month: string;
  totalGross: number;
  totalDeductions?: number;
  totalNet: number;
  employeeCount: number;
  status: 'DRAFT' | 'PROCESSING' | 'PROCESSED' | 'PAID';
  executedDate?: string;
  createdAt?: string;
}

export interface HrmPayslip {
  id: string;
  employeeId: string;
  employeeName?: string;
  month: string;
  basicSalary: number;
  allowances?: number;
  deductions?: number;
  netPay: number;
  status: 'DRAFT' | 'APPROVED' | 'PAID';
  paymentDate?: string;
  createdAt?: string;
}

export interface HrmJobPosting {
  id: string;
  jobTitle: string;
  title?: string;
  departmentId?: string | null;
  department?: string | null;
  openingsCount: number;
  openings?: number;
  employmentType?: string;
  description?: string | null;
  status: 'OPEN' | 'CLOSED' | 'ON_HOLD';
  postedAt?: string;
  applicantsCount?: number;
  createdAt?: string;
}

export interface HrmCandidate {
  id: string;
  jobId: string;
  jobTitle?: string;
  name: string;
  email: string;
  phone?: string;
  currentStage: 'APPLIED' | 'SCREENING' | 'INTERVIEW' | 'OFFER' | 'HIRED' | 'REJECTED';
  rating?: number;
  appliedDate: string;
}

export interface HrmOnboardingTask {
  id: string;
  employeeId?: string | null;
  employeeName?: string | null;
  taskName: string;
  title?: string;
  category?: string;
  dueDate?: string | null;
  isCompleted: boolean;
  completed?: boolean;
  assignedTo?: string | null;
  createdAt?: string;
}

export interface HrmPerformanceReview {
  id: string;
  employeeId: string;
  employeeName?: string;
  reviewerId?: string | null;
  reviewerName?: string | null;
  cycleName: string;
  rating?: number | null;
  reviewNotes?: string | null;
  status: 'DRAFT' | 'SUBMITTED' | 'COMPLETED';
  createdAt?: string;
}

export interface HrmExpense {
  id: string;
  claimNumber?: string;
  employeeId: string;
  employeeName?: string;
  title: string;
  category: string;
  amount: number;
  currency?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'REIMBURSED';
  date?: string;
  expenseDate?: string;
  receiptUrl?: string | null;
  notes?: string | null;
  createdAt?: string;
}

export interface HrmAsset {
  id: string;
  assetName: string;
  name?: string;
  assetTag: string;
  category: string;
  serialNumber?: string | null;
  cost?: number | null;
  status: 'AVAILABLE' | 'ASSIGNED' | 'MAINTENANCE' | 'DISPOSED';
  assignedToId?: string | null;
  assignedToName?: string | null;
  createdAt?: string;
}

export interface HrmTrainingProgram {
  id: string;
  title: string;
  trainer?: string | null;
  startDate: string;
  endDate: string;
  enrolledCount?: number;
  capacity?: number;
  status: 'UPCOMING' | 'ONGOING' | 'COMPLETED';
  createdAt?: string;
}

export interface HrmHelpdeskTicket {
  id: string;
  ticketNumber: string;
  employeeId?: string | null;
  employeeName?: string | null;
  subject: string;
  description: string;
  category: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
  assignedTo?: string | null;
  createdAt?: string;
}

export interface HrmDashboardStats {
  totalEmployees: number;
  activeEmployees: number;
  totalDepartments: number;
  totalDesignations: number;
  todayPresentCount: number;
  pendingLeavesCount: number;
  openJobPostingsCount: number;
  pendingExpensesCount: number;
}

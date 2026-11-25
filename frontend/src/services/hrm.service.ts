import { api } from './api';
import type {
  HrmEmployee,
  HrmDepartment,
  HrmDesignation,
  HrmLocation,
  HrmJobGrade,
  HrmEmploymentType,
  HrmEmployeeSkill,
  HrmEmployeeEducation,
  HrmEmployeeExperience,
  HrmEmployeeCertification,
  HrmEmployeeDocument,
  HrmEmployeeHistoryItem,
  HrmAttendance,
  HrmLeaveRequest,
  HrmShift,
  HrmPayrollRun,
  HrmPayslip,
  HrmJobPosting,
  HrmCandidate,
  HrmOnboardingTask,
  HrmPerformanceReview,
  HrmExpense,
  HrmAsset,
  HrmTrainingProgram,
  HrmHelpdeskTicket,
  HrmDashboardStats,
} from '../types/hrm.types';

export const hrmService = {
  // 1. Dashboard
  async getDashboardStats(): Promise<HrmDashboardStats> {
    return api.get<HrmDashboardStats>('/hrm/dashboard/stats');
  },
  async getDashboardOverview(): Promise<any> {
    return api.get<any>('/hrm/dashboard/overview');
  },

  // 2. Employees
  async getEmployees(params?: any): Promise<{ data: HrmEmployee[]; meta: { total: number } }> {
    const query = params ? `?${new URLSearchParams(params).toString()}` : '';
    return api.get<{ data: HrmEmployee[]; meta: { total: number } }>(`/hrm/employees${query}`);
  },
  async getEmployee(id: string): Promise<HrmEmployee> {
    return api.get<HrmEmployee>(`/hrm/employees/${id}`);
  },
  async createEmployee(data: Partial<HrmEmployee>): Promise<HrmEmployee> {
    return api.post<HrmEmployee>('/hrm/employees', data);
  },
  async updateEmployee(id: string, data: Partial<HrmEmployee>): Promise<HrmEmployee> {
    return api.patch<HrmEmployee>(`/hrm/employees/${id}`, data);
  },
  async deleteEmployee(id: string): Promise<{ success: boolean }> {
    return api.delete<{ success: boolean }>(`/hrm/employees/${id}`);
  },

  // 3. Departments
  async getDepartments(params?: any): Promise<{ data: HrmDepartment[]; meta: { total: number } }> {
    const query = params ? `?${new URLSearchParams(params).toString()}` : '';
    return api.get<{ data: HrmDepartment[]; meta: { total: number } }>(`/hrm/departments${query}`);
  },
  async createDepartment(data: Partial<HrmDepartment>): Promise<HrmDepartment> {
    return api.post<HrmDepartment>('/hrm/departments', data);
  },
  async updateDepartment(id: string, data: Partial<HrmDepartment>): Promise<HrmDepartment> {
    return api.patch<HrmDepartment>(`/hrm/departments/${id}`, data);
  },
  async deleteDepartment(id: string): Promise<{ success: boolean }> {
    return api.delete<{ success: boolean }>(`/hrm/departments/${id}`);
  },

  // 4. Designations
  async getDesignations(params?: any): Promise<{ data: HrmDesignation[]; meta: { total: number } }> {
    const query = params ? `?${new URLSearchParams(params).toString()}` : '';
    return api.get<{ data: HrmDesignation[]; meta: { total: number } }>(`/hrm/designations${query}`);
  },
  async createDesignation(data: Partial<HrmDesignation>): Promise<HrmDesignation> {
    return api.post<HrmDesignation>('/hrm/designations', data);
  },
  async updateDesignation(id: string, data: Partial<HrmDesignation>): Promise<HrmDesignation> {
    return api.patch<HrmDesignation>(`/hrm/designations/${id}`, data);
  },
  async deleteDesignation(id: string): Promise<{ success: boolean }> {
    return api.delete<{ success: boolean }>(`/hrm/designations/${id}`);
  },

  // 5. Locations
  async getLocations(): Promise<{ data: HrmLocation[]; meta: { total: number } }> {
    return api.get<{ data: HrmLocation[]; meta: { total: number } }>('/hrm/locations');
  },
  async createLocation(data: Partial<HrmLocation>): Promise<HrmLocation> {
    return api.post<HrmLocation>('/hrm/locations', data);
  },

  // 6. Job Grades
  async getJobGrades(): Promise<{ data: HrmJobGrade[]; meta: { total: number } }> {
    return api.get<{ data: HrmJobGrade[]; meta: { total: number } }>('/hrm/job-grades');
  },
  async createJobGrade(data: Partial<HrmJobGrade>): Promise<HrmJobGrade> {
    return api.post<HrmJobGrade>('/hrm/job-grades', data);
  },

  // 7. Employment Types
  async getEmploymentTypes(): Promise<{ data: HrmEmploymentType[]; meta: { total: number } }> {
    return api.get<{ data: HrmEmploymentType[]; meta: { total: number } }>('/hrm/employment-types');
  },
  async createEmploymentType(data: Partial<HrmEmploymentType>): Promise<HrmEmploymentType> {
    return api.post<HrmEmploymentType>('/hrm/employment-types', data);
  },

  // 8. Employee Documents
  async getDocuments(params?: any): Promise<{ data: HrmEmployeeDocument[]; meta: { total: number } }> {
    const query = params ? `?${new URLSearchParams(params).toString()}` : '';
    return api.get<{ data: HrmEmployeeDocument[]; meta: { total: number } }>(`/hrm/employee-documents${query}`);
  },
  async createDocument(data: Partial<HrmEmployeeDocument>): Promise<HrmEmployeeDocument> {
    return api.post<HrmEmployeeDocument>('/hrm/employee-documents', data);
  },

  // 9. Employee Education
  async getEducation(params?: any): Promise<{ data: HrmEmployeeEducation[]; meta: { total: number } }> {
    const query = params ? `?${new URLSearchParams(params).toString()}` : '';
    return api.get<{ data: HrmEmployeeEducation[]; meta: { total: number } }>(`/hrm/employee-education${query}`);
  },
  async createEducation(data: Partial<HrmEmployeeEducation>): Promise<HrmEmployeeEducation> {
    return api.post<HrmEmployeeEducation>('/hrm/employee-education', data);
  },

  // 10. Employee Experience
  async getExperience(params?: any): Promise<{ data: HrmEmployeeExperience[]; meta: { total: number } }> {
    const query = params ? `?${new URLSearchParams(params).toString()}` : '';
    return api.get<{ data: HrmEmployeeExperience[]; meta: { total: number } }>(`/hrm/employee-experience${query}`);
  },
  async createExperience(data: Partial<HrmEmployeeExperience>): Promise<HrmEmployeeExperience> {
    return api.post<HrmEmployeeExperience>('/hrm/employee-experience', data);
  },

  // 11. Employee Skills
  async getSkills(params?: any): Promise<{ data: HrmEmployeeSkill[]; meta: { total: number } }> {
    const query = params ? `?${new URLSearchParams(params).toString()}` : '';
    return api.get<{ data: HrmEmployeeSkill[]; meta: { total: number } }>(`/hrm/employee-skills${query}`);
  },
  async createSkill(data: Partial<HrmEmployeeSkill>): Promise<HrmEmployeeSkill> {
    return api.post<HrmEmployeeSkill>('/hrm/employee-skills', data);
  },

  // 12. Employee Certifications
  async getCertifications(params?: any): Promise<{ data: HrmEmployeeCertification[]; meta: { total: number } }> {
    const query = params ? `?${new URLSearchParams(params).toString()}` : '';
    return api.get<{ data: HrmEmployeeCertification[]; meta: { total: number } }>(`/hrm/employee-certifications${query}`);
  },
  async createCertification(data: Partial<HrmEmployeeCertification>): Promise<HrmEmployeeCertification> {
    return api.post<HrmEmployeeCertification>('/hrm/employee-certifications', data);
  },

  // 13. Employee History
  async getHistory(params?: any): Promise<{ data: HrmEmployeeHistoryItem[]; meta: { total: number } }> {
    const query = params ? `?${new URLSearchParams(params).toString()}` : '';
    return api.get<{ data: HrmEmployeeHistoryItem[]; meta: { total: number } }>(`/hrm/employee-history${query}`);
  },

  // 14. Reporting
  async getReportingHierarchy(): Promise<any> {
    return api.get<any>('/hrm/reporting/hierarchy');
  },
  async getDirectReports(employeeId: string): Promise<any> {
    return api.get<any>(`/hrm/reporting/direct-reports/${employeeId}`);
  },

  // 15. Attendance
  async getAttendance(params?: any): Promise<{ data: HrmAttendance[]; meta: { total: number } }> {
    const query = params ? `?${new URLSearchParams(params).toString()}` : '';
    return api.get<{ data: HrmAttendance[]; meta: { total: number } }>(`/hrm/attendance${query}`);
  },
  async checkIn(data: { employeeId: string; method?: string }): Promise<HrmAttendance> {
    return api.post<HrmAttendance>('/hrm/attendance/check-in', data);
  },
  async checkOut(id: string): Promise<HrmAttendance> {
    return api.post<HrmAttendance>(`/hrm/attendance/check-out/${id}`, {});
  },

  // 16. Leave Management
  async getLeaveRequests(params?: any): Promise<{ data: HrmLeaveRequest[]; meta: { total: number } }> {
    const query = params ? `?${new URLSearchParams(params).toString()}` : '';
    return api.get<{ data: HrmLeaveRequest[]; meta: { total: number } }>(`/hrm/leave-management/requests${query}`);
  },
  async submitLeaveRequest(data: Partial<HrmLeaveRequest>): Promise<HrmLeaveRequest> {
    return api.post<HrmLeaveRequest>('/hrm/leave-management/requests', data);
  },
  async approveLeave(id: string): Promise<HrmLeaveRequest> {
    return api.post<HrmLeaveRequest>(`/hrm/leave-management/requests/${id}/approve`, {});
  },
  async rejectLeave(id: string, reason?: string): Promise<HrmLeaveRequest> {
    return api.post<HrmLeaveRequest>(`/hrm/leave-management/requests/${id}/reject`, { reason });
  },

  // 17. Shifts
  async getShifts(): Promise<{ data: HrmShift[]; meta: { total: number } }> {
    return api.get<{ data: HrmShift[]; meta: { total: number } }>('/hrm/shifts');
  },
  async createShift(data: Partial<HrmShift>): Promise<HrmShift> {
    return api.post<HrmShift>('/hrm/shifts', data);
  },

  // 18. Payroll
  async getPayrollRuns(): Promise<{ data: HrmPayrollRun[]; meta: { total: number } }> {
    return api.get<{ data: HrmPayrollRun[]; meta: { total: number } }>('/hrm/payroll/runs');
  },
  async processPayrollRun(month: string): Promise<HrmPayrollRun> {
    return api.post<HrmPayrollRun>('/hrm/payroll/runs/process', { month });
  },
  async getPayslips(params?: any): Promise<{ data: HrmPayslip[]; meta: { total: number } }> {
    const query = params ? `?${new URLSearchParams(params).toString()}` : '';
    return api.get<{ data: HrmPayslip[]; meta: { total: number } }>(`/hrm/payroll/payslips${query}`);
  },

  // 19. Recruitment
  async getJobPostings(): Promise<{ data: HrmJobPosting[]; meta: { total: number } }> {
    return api.get<{ data: HrmJobPosting[]; meta: { total: number } }>('/hrm/recruitment/jobs');
  },
  async createJobPosting(data: Partial<HrmJobPosting>): Promise<HrmJobPosting> {
    return api.post<HrmJobPosting>('/hrm/recruitment/jobs', data);
  },
  async getCandidates(params?: any): Promise<{ data: HrmCandidate[]; meta: { total: number } }> {
    const query = params ? `?${new URLSearchParams(params).toString()}` : '';
    return api.get<{ data: HrmCandidate[]; meta: { total: number } }>(`/hrm/recruitment/candidates${query}`);
  },

  // 20. Onboarding
  async getOnboardingTasks(params?: any): Promise<{ data: HrmOnboardingTask[]; meta: { total: number } }> {
    const query = params ? `?${new URLSearchParams(params).toString()}` : '';
    return api.get<{ data: HrmOnboardingTask[]; meta: { total: number } }>(`/hrm/onboarding/tasks${query}`);
  },
  async createOnboardingTask(data: Partial<HrmOnboardingTask>): Promise<HrmOnboardingTask> {
    return api.post<HrmOnboardingTask>('/hrm/onboarding/tasks', data);
  },
  async completeOnboardingTask(id: string): Promise<HrmOnboardingTask> {
    return api.post<HrmOnboardingTask>(`/hrm/onboarding/tasks/${id}/complete`, {});
  },

  // 21. Performance
  async getPerformanceReviews(params?: any): Promise<{ data: HrmPerformanceReview[]; meta: { total: number } }> {
    const query = params ? `?${new URLSearchParams(params).toString()}` : '';
    return api.get<{ data: HrmPerformanceReview[]; meta: { total: number } }>(`/hrm/performance/reviews${query}`);
  },
  async createPerformanceReview(data: Partial<HrmPerformanceReview>): Promise<HrmPerformanceReview> {
    return api.post<HrmPerformanceReview>('/hrm/performance/reviews', data);
  },

  // 22. Expenses
  async getExpenses(params?: any): Promise<{ data: HrmExpense[]; meta: { total: number } }> {
    const query = params ? `?${new URLSearchParams(params).toString()}` : '';
    return api.get<{ data: HrmExpense[]; meta: { total: number } }>(`/hrm/expenses${query}`);
  },
  async createExpense(data: Partial<HrmExpense>): Promise<HrmExpense> {
    return api.post<HrmExpense>('/hrm/expenses', data);
  },
  async approveExpense(id: string): Promise<HrmExpense> {
    return api.post<HrmExpense>(`/hrm/expenses/${id}/approve`, {});
  },

  // 23. Assets
  async getAssets(params?: any): Promise<{ data: HrmAsset[]; meta: { total: number } }> {
    const query = params ? `?${new URLSearchParams(params).toString()}` : '';
    return api.get<{ data: HrmAsset[]; meta: { total: number } }>(`/hrm/assets${query}`);
  },
  async createAsset(data: Partial<HrmAsset>): Promise<HrmAsset> {
    return api.post<HrmAsset>('/hrm/assets', data);
  },
  async assignAsset(id: string, data: { employeeId: string }): Promise<HrmAsset> {
    return api.post<HrmAsset>(`/hrm/assets/${id}/assign`, data);
  },

  // 24. Training
  async getTrainingPrograms(params?: any): Promise<{ data: HrmTrainingProgram[]; meta: { total: number } }> {
    const query = params ? `?${new URLSearchParams(params).toString()}` : '';
    return api.get<{ data: HrmTrainingProgram[]; meta: { total: number } }>(`/hrm/training/programs${query}`);
  },
  async createTrainingProgram(data: Partial<HrmTrainingProgram>): Promise<HrmTrainingProgram> {
    return api.post<HrmTrainingProgram>('/hrm/training/programs', data);
  },

  // 25. Helpdesk
  async getHelpdeskTickets(params?: any): Promise<{ data: HrmHelpdeskTicket[]; meta: { total: number } }> {
    const query = params ? `?${new URLSearchParams(params).toString()}` : '';
    return api.get<{ data: HrmHelpdeskTicket[]; meta: { total: number } }>(`/hrm/helpdesk/tickets${query}`);
  },
  async createHelpdeskTicket(data: Partial<HrmHelpdeskTicket>): Promise<HrmHelpdeskTicket> {
    return api.post<HrmHelpdeskTicket>('/hrm/helpdesk/tickets', data);
  },
  async resolveHelpdeskTicket(id: string): Promise<HrmHelpdeskTicket> {
    return api.post<HrmHelpdeskTicket>(`/hrm/helpdesk/tickets/${id}/resolve`, {});
  },

  // 26. Reports
  async getHeadcountReport(): Promise<any> {
    return api.get<any>('/hrm/reports/headcount');
  },
  async getAttendanceReport(): Promise<any> {
    return api.get<any>('/hrm/reports/attendance-summary');
  },
  async getPayrollReport(): Promise<any> {
    return api.get<any>('/hrm/reports/payroll-summary');
  },
};

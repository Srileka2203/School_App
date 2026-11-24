import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class HrmDashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getOverview() {
    return {
      message: 'HRM Executive Dashboard Overview',
      metrics: {
        totalHeadcount: 148,
        activeEmployees: 142,
        onLeaveToday: 6,
        newHiresMonth: 8,
        openRequisitions: 14,
        attendanceRateToday: 95.8,
        pendingApprovals: 9,
        payrollBudgetUtilization: 92.4,
      },
      headcountByDepartment: [
        { department: 'Engineering', count: 48, percentage: 32.4 },
        { department: 'Sales & BD', count: 34, percentage: 23.0 },
        { department: 'Operations', count: 26, percentage: 17.6 },
        { department: 'Finance', count: 18, percentage: 12.2 },
        { department: 'Human Resources', count: 12, percentage: 8.1 },
        { department: 'Product & Design', count: 10, percentage: 6.7 },
      ],
      lastUpdated: new Date().toISOString(),
    };
  }

  async getStats() {
    return {
      averageEmployeeTenureYears: 2.8,
      employeeTurnoverRatePercent: 4.2,
      diversityGenderFemaleRatio: 44.5,
      trainingHoursCompletedYTD: 1420,
      helpdeskResolutionHoursAvg: 3.4,
    };
  }

  async getRecentActivity() {
    return [
      { id: 'act-1', event: 'NEW_HIRE', title: 'Sarah Connor joined as Staff Software Engineer', timestamp: new Date(Date.now() - 3600000).toISOString() },
      { id: 'act-2', event: 'PROMOTION', title: 'Marcus Vance promoted to Senior Account Executive', timestamp: new Date(Date.now() - 14400000).toISOString() },
      { id: 'act-3', event: 'LEAVE_REQUEST', title: 'David Kim submitted Annual Leave Request (3 days)', timestamp: new Date(Date.now() - 28800000).toISOString() },
      { id: 'act-4', event: 'CERTIFICATION', title: 'Elena Rostova verified SHRM-SCP Credential', timestamp: new Date(Date.now() - 86400000).toISOString() },
    ];
  }
}

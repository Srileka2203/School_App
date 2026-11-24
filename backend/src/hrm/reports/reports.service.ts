import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class HrmReportsService {
  constructor(private readonly prisma: PrismaService) {}

  async getHeadcount() {
    return {
      period: '2026 YTD',
      totalEmployees: 148,
      breakdown: [
        { department: 'Engineering', count: 48, newHiresThisQuarter: 4 },
        { department: 'Sales & BD', count: 34, newHiresThisQuarter: 3 },
        { department: 'Operations', count: 26, newHiresThisQuarter: 2 },
        { department: 'Finance', count: 18, newHiresThisQuarter: 1 },
        { department: 'Human Resources', count: 12, newHiresThisQuarter: 0 },
        { department: 'Product & Design', count: 10, newHiresThisQuarter: 1 },
      ],
    };
  }

  async getTurnover() {
    return {
      annualizedTurnoverPercent: 4.8,
      voluntaryDepartures: 5,
      involuntaryDepartures: 2,
      industryAveragePercent: 11.2,
      retentionScore: 'EXCELLENT',
    };
  }

  async getAttendanceSummary() {
    return {
      averageAttendanceRate: 96.4,
      leavesTotalDaysMonth: 42,
      remoteWorkRatioPercent: 62.5,
    };
  }

  async getPayrollSummary() {
    return {
      annualizedPayrollExpense: 17520000,
      monthlyAverageSpend: 1460000,
      benefitsRatioOfGross: 18.2,
    };
  }

  async getDiversity() {
    return {
      genderDistribution: { female: 44.5, male: 53.0, nonBinaryOrDisclose: 2.5 },
      globalLocationsCount: 4,
      languagesSpokenCount: 16,
    };
  }
}

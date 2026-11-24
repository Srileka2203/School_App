import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class HrmPayrollService {
  constructor(private readonly prisma: PrismaService) {}

  private runs = [
    { id: 'pr-2026-10', month: 'October 2026', totalGross: 1425000, totalDeductions: 320000, totalNet: 1105000, employeeCount: 142, status: 'PAID', executedDate: '2026-10-31' },
    { id: 'pr-2026-11', month: 'November 2026', totalGross: 1460000, totalDeductions: 328000, totalNet: 1132000, employeeCount: 148, status: 'PROCESSING', executedDate: '2026-11-30' },
  ];

  private slips = [
    { id: 'slip-01', payPeriod: 'November 2026', employeeId: 'emp-101', employeeName: 'Sarah Connor', baseSalary: 12083.33, allowances: 800, taxDeductions: 2850, insurance: 350, netSalary: 9683.33, status: 'ISSUED' },
    { id: 'slip-02', payPeriod: 'November 2026', employeeId: 'emp-102', employeeName: 'Marcus Vance', baseSalary: 9166.67, allowances: 650, taxDeductions: 2100, insurance: 300, netSalary: 7416.67, status: 'ISSUED' },
  ];

  async getRuns() {
    return { data: this.runs, meta: { total: this.runs.length } };
  }

  async getSlips(query?: any) {
    let result = [...this.slips];
    if (query?.employeeId) {
      result = result.filter((s) => s.employeeId === query.employeeId);
    }
    return { data: result, meta: { total: result.length } };
  }

  async getSlip(id: string) {
    const s = this.slips.find((item) => item.id === id);
    if (!s) throw new NotFoundException('Payslip not found');
    return s;
  }

  async processRun(month: string) {
    const run = {
      id: `pr-${Date.now()}`,
      month,
      totalGross: 1480000,
      totalDeductions: 332000,
      totalNet: 1148000,
      employeeCount: 148,
      status: 'PROCESSED',
      executedDate: new Date().toISOString(),
    };
    this.runs.unshift(run);
    return run;
  }
}

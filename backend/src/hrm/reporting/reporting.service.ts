import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class HrmReportingService {
  constructor(private readonly prisma: PrismaService) {}

  private hierarchy = [
    { employeeId: 'emp-101', name: 'Sarah Connor', title: 'Staff Software Engineer', managerId: 'mgr-01', managerName: 'Alex Mercer', department: 'Engineering' },
    { employeeId: 'emp-102', name: 'Marcus Vance', title: 'Senior Account Executive', managerId: 'mgr-02', managerName: 'Victoria Sterling', department: 'Sales' },
    { employeeId: 'emp-103', name: 'Elena Rostova', title: 'HR People Lead', managerId: 'mgr-03', managerName: 'CEO Office', department: 'Human Resources' },
  ];

  async getOrgChart() {
    return {
      companyName: 'Enterprise Organization',
      root: {
        id: 'mgr-00',
        name: 'Chief Executive Officer',
        title: 'CEO',
        directReports: [
          { id: 'mgr-01', name: 'Alex Mercer', title: 'VP of Engineering', directReportsCount: 42 },
          { id: 'mgr-02', name: 'Victoria Sterling', title: 'VP of Global Sales', directReportsCount: 28 },
          { id: 'mgr-03', name: 'Elena Rostova', title: 'Head of People', directReportsCount: 12 },
        ],
      },
    };
  }

  async getHierarchy(employeeId: string) {
    const record = this.hierarchy.find((h) => h.employeeId === employeeId);
    if (!record) {
      throw new NotFoundException(`Hierarchy record for employee ${employeeId} not found`);
    }
    return record;
  }

  async getDirectReports(managerId: string) {
    const reports = this.hierarchy.filter((h) => h.managerId === managerId);
    return { managerId, count: reports.length, directReports: reports };
  }

  async assignManager(data: { employeeId: string; managerId: string; managerName: string }) {
    const index = this.hierarchy.findIndex((h) => h.employeeId === data.employeeId);
    if (index >= 0) {
      this.hierarchy[index].managerId = data.managerId;
      this.hierarchy[index].managerName = data.managerName;
      return this.hierarchy[index];
    }
    const newRecord = {
      employeeId: data.employeeId,
      name: 'Employee',
      title: 'Specialist',
      managerId: data.managerId,
      managerName: data.managerName,
      department: 'General',
    };
    this.hierarchy.push(newRecord);
    return newRecord;
  }
}

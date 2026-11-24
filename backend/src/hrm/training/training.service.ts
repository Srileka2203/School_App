import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class HrmTrainingService {
  constructor(private readonly prisma: PrismaService) {}

  private programs = [
    { id: 'tr-01', title: 'SOC 2 & Cloud Security Compliance 2026', instructor: 'CyberSec Academy', durationHours: 12, capacity: 100, enrolledCount: 84, completionRate: 92.8, status: 'ACTIVE' },
    { id: 'tr-02', title: 'Advanced High-Value Enterprise Negotiations', instructor: 'Harvard Executive Program', durationHours: 24, capacity: 30, enrolledCount: 26, completionRate: 88.5, status: 'ACTIVE' },
  ];

  async getPrograms() {
    return { data: this.programs, meta: { total: this.programs.length } };
  }

  async createProgram(data: any) {
    const prog = { id: `tr-${Date.now()}`, enrolledCount: 0, completionRate: 0, status: 'ACTIVE', ...data };
    this.programs.push(prog);
    return prog;
  }

  async enroll(data: { programId: string; employeeId: string; employeeName: string }) {
    const p = this.programs.find((item) => item.id === data.programId);
    if (p) p.enrolledCount++;
    return { message: 'Enrolled successfully', ...data };
  }
}

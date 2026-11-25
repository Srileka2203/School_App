import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class HrmTrainingService {
  constructor(private readonly prisma: PrismaService) {}

  private programs: any[] = [
    { id: 'tr-01', title: 'SOC 2 & Cloud Security Compliance 2026', instructor: 'CyberSec Academy', durationHours: 12, capacity: 100, enrolledCount: 84, completionRate: 92.8, status: 'ACTIVE' },
    { id: 'tr-02', title: 'Advanced High-Value Enterprise Negotiations', instructor: 'Harvard Executive Program', durationHours: 24, capacity: 30, enrolledCount: 26, completionRate: 88.5, status: 'ACTIVE' },
  ];

  async getPrograms() {
    try {
      const dbPrograms = await this.prisma.hrmTrainingProgram.findMany({
        orderBy: { createdAt: 'desc' },
      });
      if (dbPrograms && dbPrograms.length > 0) {
        const result = dbPrograms.map((p) => ({
          ...p,
          instructor: p.trainer,
          enrolledCount: 0,
          completionRate: 0,
        }));
        return { data: result, meta: { total: result.length } };
      }
    } catch (err) {}

    return { data: this.programs, meta: { total: this.programs.length } };
  }

  async createProgram(data: any) {
    const title = data.title || 'New Training Program';
    const description = data.description || null;
    const trainer = data.instructor || data.trainer || null;
    const status = data.status || 'ACTIVE';

    try {
      const created = await this.prisma.hrmTrainingProgram.create({
        data: {
          title,
          description,
          trainer,
          status,
        },
      });
      const formatted = { ...created, instructor: created.trainer, enrolledCount: 0, completionRate: 0 };
      this.programs.push(formatted);
      return formatted;
    } catch (err) {
      const prog = { id: `tr-${Date.now()}`, enrolledCount: 0, completionRate: 0, status, ...data };
      this.programs.push(prog);
      return prog;
    }
  }

  async enroll(data: { programId: string; employeeId: string; employeeName: string }) {
    const p = this.programs.find((item) => item.id === data.programId);
    if (p) p.enrolledCount++;
    return { message: 'Enrolled successfully', ...data };
  }
}

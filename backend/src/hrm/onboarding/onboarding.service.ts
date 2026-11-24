import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class HrmOnboardingService {
  constructor(private readonly prisma: PrismaService) {}

  private tasks = [
    { id: 'ob-01', employeeId: 'emp-101', taskTitle: 'Sign NDA and Security Protocols', category: 'DOCUMENTATION', dueDate: '2026-12-01', status: 'COMPLETED' },
    { id: 'ob-02', employeeId: 'emp-101', taskTitle: 'Laptop Hardware & SSO Provisioning', category: 'IT_SETUP', dueDate: '2026-12-01', status: 'COMPLETED' },
    { id: 'ob-03', employeeId: 'emp-101', taskTitle: 'Schedule 30-Day Manager Check-in', category: 'ORIENTATION', dueDate: '2026-12-15', status: 'IN_PROGRESS' },
  ];

  async getTasks(employeeId?: string) {
    let result = [...this.tasks];
    if (employeeId) result = result.filter((t) => t.employeeId === employeeId);
    return { data: result, meta: { total: result.length } };
  }

  async getProgress(employeeId: string) {
    const list = this.tasks.filter((t) => t.employeeId === employeeId);
    const completed = list.filter((t) => t.status === 'COMPLETED').length;
    const percentage = list.length > 0 ? Math.round((completed / list.length) * 100) : 100;
    return { employeeId, totalTasks: list.length, completedTasks: completed, progressPercent: percentage };
  }

  async createTask(data: any) {
    const task = { id: `ob-${Date.now()}`, status: 'PENDING', ...data };
    this.tasks.push(task);
    return task;
  }

  async updateTaskStatus(id: string, status: string) {
    const task = this.tasks.find((t) => t.id === id);
    if (!task) throw new NotFoundException('Onboarding task not found');
    task.status = status;
    return task;
  }
}

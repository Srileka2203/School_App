import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class HrmOnboardingService {
  constructor(private readonly prisma: PrismaService) {}

  private tasks: any[] = [
    { id: 'ob-01', employeeId: 'emp-101', taskName: 'Sign NDA and Security Protocols', category: 'DOCUMENTATION', dueDate: '2026-12-01', status: 'COMPLETED' },
    { id: 'ob-02', employeeId: 'emp-101', taskName: 'Laptop Hardware & SSO Provisioning', category: 'IT_SETUP', dueDate: '2026-12-01', status: 'COMPLETED' },
    { id: 'ob-03', employeeId: 'emp-101', taskName: 'Schedule 30-Day Manager Check-in', category: 'ORIENTATION', dueDate: '2026-12-15', status: 'IN_PROGRESS' },
  ];

  async getTasks(employeeId?: string) {
    try {
      const dbTasks = await this.prisma.hrmOnboardingTask.findMany({
        where: employeeId ? { employeeId } : undefined,
        orderBy: { createdAt: 'desc' },
      });
      if (dbTasks && dbTasks.length > 0) {
        const result = dbTasks.map((t) => ({
          ...t,
          taskTitle: t.taskName,
          status: t.isCompleted ? 'COMPLETED' : 'IN_PROGRESS',
        }));
        return { data: result, meta: { total: result.length } };
      }
    } catch (err) {}

    let result = [...this.tasks];
    if (employeeId) result = result.filter((t) => t.employeeId === employeeId);
    return { data: result, meta: { total: result.length } };
  }

  async getProgress(employeeId: string) {
    try {
      const list = await this.prisma.hrmOnboardingTask.findMany({
        where: { employeeId },
      });
      if (list && list.length > 0) {
        const completed = list.filter((t) => t.isCompleted).length;
        const percentage = Math.round((completed / list.length) * 100);
        return { employeeId, totalTasks: list.length, completedTasks: completed, progressPercent: percentage };
      }
    } catch (err) {}

    const list = this.tasks.filter((t) => t.employeeId === employeeId);
    const completed = list.filter((t) => t.status === 'COMPLETED').length;
    const percentage = list.length > 0 ? Math.round((completed / list.length) * 100) : 100;
    return { employeeId, totalTasks: list.length, completedTasks: completed, progressPercent: percentage };
  }

  async createTask(data: any) {
    const taskName = data.taskName || data.taskTitle || 'New Task';
    const category = data.category || 'GENERAL';
    const isCompleted = data.status === 'COMPLETED';

    try {
      let employeeId = data.employeeId || null;
      if (employeeId) {
        const emp = await this.prisma.hrmEmployee.findFirst({
          where: { OR: [{ id: employeeId }, { employeeNumber: employeeId }] },
        });
        if (emp) employeeId = emp.id;
      }

      const created = await this.prisma.hrmOnboardingTask.create({
        data: {
          taskName,
          category,
          isCompleted,
          employeeId,
        },
      });
      const formatted = { ...created, taskTitle: created.taskName, status: created.isCompleted ? 'COMPLETED' : 'PENDING' };
      this.tasks.push(formatted);
      return formatted;
    } catch (err) {
      const task = { id: `ob-${Date.now()}`, taskTitle: taskName, status: 'PENDING', ...data };
      this.tasks.push(task);
      return task;
    }
  }

  async updateTaskStatus(id: string, status: string) {
    try {
      const isCompleted = status === 'COMPLETED';
      const updated = await this.prisma.hrmOnboardingTask.update({
        where: { id },
        data: { isCompleted },
      });
      return { ...updated, taskTitle: updated.taskName, status };
    } catch (err) {}

    const task = this.tasks.find((t) => t.id === id);
    if (!task) throw new NotFoundException('Onboarding task not found');
    task.status = status;
    return task;
  }
}

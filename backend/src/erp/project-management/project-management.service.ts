import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

export interface ErpProjectItem {
  id?: string;
  projectCode?: string;
  name: string;
  description?: string;
  client?: string;
  status?: string;
  budgetTotal?: number;
  spentTotal?: number;
  startDate?: Date | string;
  targetEndDate?: Date | string;
  milestonesCount?: number;
  workspaceId?: string;
}

@Injectable()
export class ProjectManagementService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(workspaceId?: string) {
    const where = workspaceId ? { workspaceId } : {};
    const [data, total] = await Promise.all([
      this.prisma.erpProject.findMany({
        where,
        include: {
          milestones: {
            orderBy: { createdAt: 'asc' },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.erpProject.count({ where }),
    ]);

    return {
      data,
      meta: { total },
    };
  }

  async findOne(id: string) {
    const item = await this.prisma.erpProject.findFirst({
      where: {
        OR: [{ id }, { projectCode: id }],
      },
      include: {
        milestones: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!item) {
      throw new NotFoundException(`Project ${id} not found`);
    }
    return item;
  }

  async create(data: Partial<ErpProjectItem>) {
    const projectCode =
      data.projectCode ||
      `PRJ-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`;

    return this.prisma.erpProject.create({
      data: {
        projectCode,
        name: data.name || 'Untitled ERP Project',
        description: data.description,
        client: data.client || 'Internal',
        status: data.status || 'PLANNING',
        budgetTotal: data.budgetTotal ? Number(data.budgetTotal) : 0,
        spentTotal: data.spentTotal ? Number(data.spentTotal) : 0,
        startDate: data.startDate ? new Date(data.startDate) : new Date(),
        targetEndDate: data.targetEndDate
          ? new Date(data.targetEndDate)
          : new Date(Date.now() + 60 * 86400000),
        milestonesCount: data.milestonesCount ? Number(data.milestonesCount) : 0,
        workspaceId: data.workspaceId,
      },
      include: {
        milestones: true,
      },
    });
  }

  async update(id: string, data: any) {
    const project = await this.findOne(id);
    return this.prisma.erpProject.update({
      where: { id: project.id },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.client !== undefined && { client: data.client }),
        ...(data.status !== undefined && { status: data.status }),
        ...(data.budgetTotal !== undefined && { budgetTotal: Number(data.budgetTotal) }),
        ...(data.spentTotal !== undefined && { spentTotal: Number(data.spentTotal) }),
        ...(data.targetEndDate !== undefined && { targetEndDate: new Date(data.targetEndDate) }),
      },
      include: {
        milestones: true,
      },
    });
  }

  async remove(id: string) {
    const project = await this.findOne(id);
    await this.prisma.erpProject.delete({
      where: { id: project.id },
    });
    return { message: `Project ${project.projectCode} successfully removed` };
  }

  async addMilestone(projectId: string, milestone: any) {
    const project = await this.findOne(projectId);
    const created = await this.prisma.erpProjectMilestone.create({
      data: {
        projectId: project.id,
        title: milestone.title || 'Key Milestone Deliverable',
        status: milestone.status || 'PENDING',
        dueDate: milestone.dueDate ? new Date(milestone.dueDate) : null,
      },
    });

    await this.prisma.erpProject.update({
      where: { id: project.id },
      data: { milestonesCount: { increment: 1 } },
    });

    return created;
  }

  async updateMilestone(milestoneId: string, data: any) {
    const milestone = await this.prisma.erpProjectMilestone.findUnique({
      where: { id: milestoneId },
    });

    if (!milestone) {
      throw new NotFoundException(`Milestone ${milestoneId} not found`);
    }

    return this.prisma.erpProjectMilestone.update({
      where: { id: milestoneId },
      data: {
        ...(data.title !== undefined && { title: data.title }),
        ...(data.status !== undefined && { status: data.status }),
        ...(data.dueDate !== undefined && { dueDate: new Date(data.dueDate) }),
        ...(data.completedAt !== undefined && {
          completedAt: data.completedAt ? new Date(data.completedAt) : null,
        }),
      },
    });
  }

  async removeMilestone(milestoneId: string) {
    const milestone = await this.prisma.erpProjectMilestone.findUnique({
      where: { id: milestoneId },
    });

    if (!milestone) {
      throw new NotFoundException(`Milestone ${milestoneId} not found`);
    }

    await this.prisma.erpProjectMilestone.delete({
      where: { id: milestoneId },
    });

    await this.prisma.erpProject.update({
      where: { id: milestone.projectId },
      data: { milestonesCount: { decrement: 1 } },
    });

    return { message: `Milestone ${milestoneId} removed` };
  }
}

import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

export interface CreateBusinessWorkflowDto {
  name: string;
  category?: string;
  status?: string;
  trigger?: string;
  stepsCount?: number;
  definition?: any;
  workspaceId?: string;
}

export interface UpdateBusinessWorkflowDto {
  name?: string;
  category?: string;
  status?: string;
  trigger?: string;
  stepsCount?: number;
  definition?: any;
  workspaceId?: string;
  lastExecutedAt?: Date | string;
}

@Injectable()
export class BusinessWorkflowsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(workspaceId?: string) {
    const where = workspaceId ? { workspaceId } : {};
    const [data, total] = await Promise.all([
      this.prisma.businessWorkflow.findMany({
        where,
        include: {
          executions: {
            take: 5,
            orderBy: { startedAt: 'desc' },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.businessWorkflow.count({ where }),
    ]);

    return {
      data,
      meta: { total },
    };
  }

  async findOne(id: string) {
    const item = await this.prisma.businessWorkflow.findUnique({
      where: { id },
      include: {
        executions: {
          orderBy: { startedAt: 'desc' },
        },
      },
    });

    if (!item) {
      throw new NotFoundException(`Workflow with ID ${id} not found`);
    }
    return item;
  }

  async create(data: CreateBusinessWorkflowDto) {
    return this.prisma.businessWorkflow.create({
      data: {
        name: data.name || 'Untitled Workflow',
        category: data.category || 'General',
        status: data.status || 'ACTIVE',
        trigger: data.trigger || 'Manual Trigger',
        stepsCount: typeof data.stepsCount === 'number' ? data.stepsCount : 1,
        definition: data.definition ?? {},
        workspaceId: data.workspaceId,
      },
      include: {
        executions: true,
      },
    });
  }

  async update(id: string, data: UpdateBusinessWorkflowDto) {
    await this.findOne(id);

    return this.prisma.businessWorkflow.update({
      where: { id },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.category !== undefined && { category: data.category }),
        ...(data.status !== undefined && { status: data.status }),
        ...(data.trigger !== undefined && { trigger: data.trigger }),
        ...(data.stepsCount !== undefined && { stepsCount: Number(data.stepsCount) }),
        ...(data.definition !== undefined && { definition: data.definition }),
        ...(data.workspaceId !== undefined && { workspaceId: data.workspaceId }),
        ...(data.lastExecutedAt !== undefined && {
          lastExecutedAt: new Date(data.lastExecutedAt),
        }),
      },
      include: {
        executions: true,
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.businessWorkflow.delete({
      where: { id },
    });
    return { message: `Workflow ${id} successfully removed` };
  }
}

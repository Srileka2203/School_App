import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

export interface ApprovalRequestItem {
  id?: string;
  title: string;
  module?: string;
  requester?: string;
  requesterId?: string;
  approverRole?: string;
  approverId?: string;
  amount?: number;
  status?: string;
  priority?: string;
  submittedAt?: Date | string;
  decidedAt?: Date | string;
  comment?: string;
  details?: any;
  workspaceId?: string;
}

@Injectable()
export class ApprovalsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(workspaceId?: string) {
    const where = workspaceId ? { workspaceId } : {};
    const [data, total] = await Promise.all([
      this.prisma.approvalRequest.findMany({
        where,
        orderBy: { submittedAt: 'desc' },
      }),
      this.prisma.approvalRequest.count({ where }),
    ]);

    return {
      data,
      meta: { total },
    };
  }

  async findOne(id: string) {
    const item = await this.prisma.approvalRequest.findUnique({
      where: { id },
    });
    if (!item) {
      throw new NotFoundException(`Approval request ${id} not found`);
    }
    return item;
  }

  async create(data: Partial<ApprovalRequestItem>) {
    return this.prisma.approvalRequest.create({
      data: {
        title: data.title || 'Untitled Approval Request',
        module: data.module || 'General',
        requester: data.requester || 'Current User',
        requesterId: data.requesterId,
        approverRole: data.approverRole || 'Manager',
        approverId: data.approverId,
        amount: data.amount ? Number(data.amount) : null,
        status: data.status || 'PENDING',
        priority: data.priority || 'MEDIUM',
        comment: data.comment,
        details: data.details ?? {},
        workspaceId: data.workspaceId,
      },
    });
  }

  async approve(id: string, comment?: string) {
    await this.findOne(id);
    return this.prisma.approvalRequest.update({
      where: { id },
      data: {
        status: 'APPROVED',
        decidedAt: new Date(),
        ...(comment && { comment }),
      },
    });
  }

  async reject(id: string, reason?: string) {
    await this.findOne(id);
    return this.prisma.approvalRequest.update({
      where: { id },
      data: {
        status: 'REJECTED',
        decidedAt: new Date(),
        ...(reason && { comment: reason }),
      },
    });
  }
}

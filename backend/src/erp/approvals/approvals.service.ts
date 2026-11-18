import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

export interface ApprovalRequestItem {
  id: string;
  title: string;
  module: string;
  requester: string;
  approverRole: string;
  amount?: number;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  submittedAt: string;
  decidedAt?: string;
  comment?: string;
}

@Injectable()
export class ApprovalsService {
  constructor(private readonly prisma: PrismaService) {}

  private approvals: ApprovalRequestItem[] = [
    {
      id: 'appr-1',
      title: 'PO #1042 - Industrial Steel Raw Materials',
      module: 'Procurement',
      requester: 'John Miller',
      approverRole: 'Finance Director',
      amount: 42500,
      status: 'PENDING',
      priority: 'HIGH',
      submittedAt: new Date().toISOString(),
    },
    {
      id: 'appr-2',
      title: 'Batch Q-991 Exception Release',
      module: 'Quality',
      requester: 'Sarah Jenkins',
      approverRole: 'VP Operations',
      status: 'APPROVED',
      priority: 'MEDIUM',
      submittedAt: new Date(Date.now() - 86400000).toISOString(),
      decidedAt: new Date().toISOString(),
      comment: 'Approved after secondary lab assay confirmed specs.',
    },
  ];

  async findAll() {
    return {
      data: this.approvals,
      meta: { total: this.approvals.length },
    };
  }

  async findOne(id: string) {
    const item = this.approvals.find((a) => a.id === id);
    if (!item) {
      throw new NotFoundException(`Approval request ${id} not found`);
    }
    return item;
  }

  async create(data: Partial<ApprovalRequestItem>) {
    const newApproval: ApprovalRequestItem = {
      id: `appr-${Date.now()}`,
      title: data.title || 'Untitled Approval Request',
      module: data.module || 'General',
      requester: data.requester || 'Current User',
      approverRole: data.approverRole || 'Manager',
      amount: data.amount,
      status: 'PENDING',
      priority: data.priority || 'MEDIUM',
      submittedAt: new Date().toISOString(),
    };
    this.approvals.unshift(newApproval);
    return newApproval;
  }

  async approve(id: string, comment?: string) {
    const item = await this.findOne(id);
    item.status = 'APPROVED';
    item.decidedAt = new Date().toISOString();
    if (comment) item.comment = comment;
    return item;
  }

  async reject(id: string, reason?: string) {
    const item = await this.findOne(id);
    item.status = 'REJECTED';
    item.decidedAt = new Date().toISOString();
    if (reason) item.comment = reason;
    return item;
  }
}

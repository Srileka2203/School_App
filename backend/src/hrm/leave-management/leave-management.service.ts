import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class HrmLeaveManagementService {
  constructor(private readonly prisma: PrismaService) {}

  private requests = [
    { id: 'lv-01', employeeId: 'emp-101', employeeName: 'Sarah Connor', leaveType: 'ANNUAL', startDate: '2026-12-24', endDate: '2026-12-28', totalDays: 3, reason: 'Holiday family vacation', status: 'APPROVED', approvedBy: 'Alex Mercer' },
    { id: 'lv-02', employeeId: 'emp-104', employeeName: 'David Kim', leaveType: 'SICK', startDate: '2026-11-20', endDate: '2026-11-25', totalDays: 4, reason: 'Medical recovery post procedure', status: 'PENDING', approvedBy: null },
  ];

  async getRequests() {
    return { data: this.requests, meta: { total: this.requests.length } };
  }

  async getBalances(employeeId?: string) {
    return [
      { employeeId: employeeId || 'emp-101', leaveType: 'ANNUAL', totalAllocated: 20, used: 8, remaining: 12 },
      { employeeId: employeeId || 'emp-101', leaveType: 'SICK', totalAllocated: 10, used: 2, remaining: 8 },
      { employeeId: employeeId || 'emp-101', leaveType: 'CASUAL', totalAllocated: 5, used: 1, remaining: 4 },
    ];
  }

  async submitRequest(data: any) {
    const item = {
      id: `lv-${Date.now()}`,
      status: 'PENDING',
      createdAt: new Date().toISOString(),
      ...data,
    };
    this.requests.unshift(item);
    return item;
  }

  async approveRequest(id: string, approverName = 'Manager') {
    const item = this.requests.find((r) => r.id === id);
    if (!item) throw new NotFoundException('Leave request not found');
    item.status = 'APPROVED';
    (item as any).approvedBy = approverName;
    return item;
  }

  async rejectRequest(id: string, reason = 'Conflicting team coverage') {
    const item = this.requests.find((r) => r.id === id);
    if (!item) throw new NotFoundException('Leave request not found');
    item.status = 'REJECTED';
    (item as any).rejectionReason = reason;
    return item;
  }
}

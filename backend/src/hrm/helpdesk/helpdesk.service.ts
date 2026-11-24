import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class HrmHelpdeskService {
  constructor(private readonly prisma: PrismaService) {}

  private tickets = [
    { id: 'tkt-01', ticketNumber: 'HR-TKT-1001', employeeId: 'emp-102', employeeName: 'Marcus Vance', subject: 'Health Insurance Card Dependent Addition', category: 'BENEFITS', priority: 'MEDIUM', status: 'IN_PROGRESS', createdAt: '2026-11-20' },
    { id: 'tkt-02', ticketNumber: 'HR-TKT-1002', employeeId: 'emp-101', employeeName: 'Sarah Connor', subject: 'Tax Withholding W-4 Form Modification', category: 'PAYROLL', priority: 'LOW', status: 'RESOLVED', createdAt: '2026-11-15' },
  ];

  async getTickets() {
    return { data: this.tickets, meta: { total: this.tickets.length } };
  }

  async getTicket(id: string) {
    const t = this.tickets.find((item) => item.id === id);
    if (!t) throw new NotFoundException('Helpdesk ticket not found');
    return t;
  }

  async createTicket(data: any) {
    const t = {
      id: `tkt-${Date.now()}`,
      ticketNumber: `HR-TKT-${Math.floor(1000 + Math.random() * 9000)}`,
      status: 'OPEN',
      createdAt: new Date().toISOString(),
      ...data,
    };
    this.tickets.unshift(t);
    return t;
  }

  async resolveTicket(id: string) {
    const t = await this.getTicket(id);
    t.status = 'RESOLVED';
    return t;
  }
}

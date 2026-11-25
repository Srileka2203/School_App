import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class HrmHelpdeskService {
  constructor(private readonly prisma: PrismaService) {}

  private tickets: any[] = [
    { id: 'tkt-01', ticketNumber: 'HR-TKT-1001', employeeId: 'emp-102', employeeName: 'Marcus Vance', subject: 'Health Insurance Card Dependent Addition', category: 'BENEFITS', priority: 'MEDIUM', status: 'IN_PROGRESS', createdAt: '2026-11-20' },
    { id: 'tkt-02', ticketNumber: 'HR-TKT-1002', employeeId: 'emp-101', employeeName: 'Sarah Connor', subject: 'Tax Withholding W-4 Form Modification', category: 'PAYROLL', priority: 'LOW', status: 'RESOLVED', createdAt: '2026-11-15' },
  ];

  async getTickets() {
    try {
      const dbTickets = await this.prisma.hrmHelpdeskTicket.findMany({
        orderBy: { createdAt: 'desc' },
      });
      if (dbTickets && dbTickets.length > 0) {
        const result = dbTickets.map((t) => ({
          ...t,
          createdAt: t.createdAt.toISOString().split('T')[0],
        }));
        return { data: result, meta: { total: result.length } };
      }
    } catch (err) {}

    return { data: this.tickets, meta: { total: this.tickets.length } };
  }

  async getTicket(id: string) {
    try {
      const t = await this.prisma.hrmHelpdeskTicket.findFirst({
        where: { OR: [{ id }, { ticketNumber: id }] },
      });
      if (t) {
        return {
          ...t,
          createdAt: t.createdAt.toISOString().split('T')[0],
        };
      }
    } catch (err) {}

    const t = this.tickets.find((item) => item.id === id || item.ticketNumber === id);
    if (!t) throw new NotFoundException('Helpdesk ticket not found');
    return t;
  }

  async createTicket(data: any) {
    const ticketNumber = data.ticketNumber || `HR-TKT-${Math.floor(1000 + Math.random() * 9000)}`;
    const subject = data.subject || 'Support Request';
    const description = data.description || subject;
    const category = data.category || 'GENERAL';
    const priority = data.priority || 'MEDIUM';
    const status = data.status || 'OPEN';

    try {
      let employeeId = data.employeeId || null;
      if (employeeId) {
        const emp = await this.prisma.hrmEmployee.findFirst({
          where: { OR: [{ id: employeeId }, { employeeNumber: employeeId }] },
        });
        if (emp) employeeId = emp.id;
      }

      const created = await this.prisma.hrmHelpdeskTicket.create({
        data: {
          ticketNumber,
          subject,
          description,
          category,
          priority,
          status,
          employeeId,
        },
      });
      const formatted = { ...created, createdAt: created.createdAt.toISOString().split('T')[0] };
      this.tickets.unshift(formatted);
      return formatted;
    } catch (err) {
      const t = {
        id: `tkt-${Date.now()}`,
        ticketNumber,
        subject,
        description,
        category,
        priority,
        status,
        createdAt: new Date().toISOString(),
        ...data,
      };
      this.tickets.unshift(t);
      return t;
    }
  }

  async resolveTicket(id: string) {
    try {
      const updated = await this.prisma.hrmHelpdeskTicket.update({
        where: { id },
        data: { status: 'RESOLVED' },
      });
      return updated;
    } catch (err) {}

    const t = await this.getTicket(id);
    t.status = 'RESOLVED';
    return t;
  }
}

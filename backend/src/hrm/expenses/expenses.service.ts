import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class HrmExpensesService {
  constructor(private readonly prisma: PrismaService) {}

  private expenses = [
    { id: 'exp-01', claimNumber: 'CLM-2026-101', employeeId: 'emp-102', employeeName: 'Marcus Vance', category: 'TRAVEL', amount: 840.5, currency: 'USD', merchant: 'Delta Air Lines', date: '2026-11-12', status: 'APPROVED', receiptUrl: 'https://receipts.example.com/flight-884.pdf' },
    { id: 'exp-02', claimNumber: 'CLM-2026-102', employeeId: 'emp-101', employeeName: 'Sarah Connor', category: 'SUPPLIES', amount: 145.0, currency: 'USD', merchant: 'Ergonomic Desk Accessories', date: '2026-11-18', status: 'PENDING', receiptUrl: 'https://receipts.example.com/supplies-102.pdf' },
  ];

  async findAll() {
    return { data: this.expenses, meta: { total: this.expenses.length } };
  }

  async findOne(id: string) {
    const e = this.expenses.find((item) => item.id === id);
    if (!e) throw new NotFoundException('Expense claim not found');
    return e;
  }

  async create(data: any) {
    const exp = {
      id: `exp-${Date.now()}`,
      claimNumber: `CLM-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
      status: 'PENDING',
      date: new Date().toISOString().split('T')[0],
      ...data,
    };
    this.expenses.unshift(exp);
    return exp;
  }

  async approve(id: string) {
    const e = await this.findOne(id);
    e.status = 'APPROVED';
    return e;
  }

  async reject(id: string, reason = 'Exceeds per-diem policy') {
    const e = await this.findOne(id);
    e.status = 'REJECTED';
    (e as any).rejectionReason = reason;
    return e;
  }
}

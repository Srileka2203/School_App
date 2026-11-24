import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class HrmPerformanceService {
  constructor(private readonly prisma: PrismaService) {}

  private reviews = [
    { id: 'rev-01', employeeId: 'emp-101', employeeName: 'Sarah Connor', reviewPeriod: '2026 Q3 Appraisal', rating: 4.8, goalsScore: 96, feedback: 'Exceeded architectural reliability goals.', status: 'COMPLETED', reviewedBy: 'Alex Mercer' },
    { id: 'rev-02', employeeId: 'emp-102', employeeName: 'Marcus Vance', reviewPeriod: '2026 Q3 Appraisal', rating: 4.6, goalsScore: 92, feedback: 'Consistently smashed quarterly new revenue ARR targets.', status: 'COMPLETED', reviewedBy: 'Victoria Sterling' },
  ];

  async getReviews() {
    return { data: this.reviews, meta: { total: this.reviews.length } };
  }

  async getReview(id: string) {
    const r = this.reviews.find((item) => item.id === id);
    if (!r) throw new NotFoundException('Performance review not found');
    return r;
  }

  async createReview(data: any) {
    const rev = { id: `rev-${Date.now()}`, status: 'DRAFT', ...data };
    this.reviews.unshift(rev);
    return rev;
  }
}

import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class HrmShiftsService {
  constructor(private readonly prisma: PrismaService) {}

  private shifts = [
    { id: 'sh-01', name: 'General Day Shift', startTime: '09:00', endTime: '18:00', breakMinutes: 60, isNight: false, assignedCount: 92, status: 'ACTIVE' },
    { id: 'sh-02', name: 'Morning Early Shift', startTime: '06:00', endTime: '15:00', breakMinutes: 60, isNight: false, assignedCount: 24, status: 'ACTIVE' },
    { id: 'sh-03', name: 'Evening Shift', startTime: '14:00', endTime: '23:00', breakMinutes: 60, isNight: false, assignedCount: 18, status: 'ACTIVE' },
    { id: 'sh-04', name: 'Night Operations Roster', startTime: '22:00', endTime: '07:00', breakMinutes: 60, isNight: true, assignedCount: 14, status: 'ACTIVE' },
  ];

  async findAll() {
    return { data: this.shifts, meta: { total: this.shifts.length } };
  }

  async findOne(id: string) {
    const s = this.shifts.find((item) => item.id === id);
    if (!s) throw new NotFoundException('Shift definition not found');
    return s;
  }

  async create(data: any) {
    const shift = { id: `sh-${Date.now()}`, assignedCount: 0, status: 'ACTIVE', ...data };
    this.shifts.push(shift);
    return shift;
  }

  async assign(data: { shiftId: string; employeeIds: string[] }) {
    return { message: `Assigned ${data.employeeIds.length} employees to shift ${data.shiftId}`, shiftId: data.shiftId };
  }
}

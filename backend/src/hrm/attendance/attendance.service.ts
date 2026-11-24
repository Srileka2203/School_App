import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class HrmAttendanceService {
  constructor(private readonly prisma: PrismaService) {}

  private records = [
    { id: 'att-01', employeeId: 'emp-101', employeeName: 'Sarah Connor', date: new Date().toISOString().split('T')[0], checkIn: '08:55 AM', checkOut: '05:30 PM', totalHours: 8.5, status: 'PRESENT', method: 'BIOMETRIC' },
    { id: 'att-02', employeeId: 'emp-102', employeeName: 'Marcus Vance', date: new Date().toISOString().split('T')[0], checkIn: '09:05 AM', checkOut: '06:00 PM', totalHours: 8.9, status: 'PRESENT', method: 'WEB_PORTAL' },
    { id: 'att-03', employeeId: 'emp-103', employeeName: 'Elena Rostova', date: new Date().toISOString().split('T')[0], checkIn: '08:45 AM', checkOut: '05:15 PM', totalHours: 8.5, status: 'PRESENT', method: 'MOBILE_APP' },
  ];

  async findAll(query?: any) {
    return { data: this.records, meta: { total: this.records.length } };
  }

  async findOne(id: string) {
    const item = this.records.find((r) => r.id === id);
    if (!item) throw new NotFoundException('Attendance record not found');
    return item;
  }

  async checkIn(data: { employeeId: string; employeeName: string; method?: string }) {
    const record = {
      id: `att-${Date.now()}`,
      employeeId: data.employeeId,
      employeeName: data.employeeName,
      date: new Date().toISOString().split('T')[0],
      checkIn: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      checkOut: null,
      totalHours: 0,
      status: 'PRESENT',
      method: data.method || 'WEB_PORTAL',
    };
    this.records.unshift(record);
    return record;
  }

  async checkOut(id: string) {
    const item = await this.findOne(id);
    item.checkOut = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    item.totalHours = 8.5;
    return item;
  }

  async getDailySummary() {
    return {
      date: new Date().toISOString().split('T')[0],
      totalScheduled: 148,
      present: 142,
      lateArrivals: 3,
      absent: 6,
      attendancePercentage: 95.9,
    };
  }
}

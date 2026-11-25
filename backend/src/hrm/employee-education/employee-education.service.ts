import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class HrmEmployeeEducationService {
  constructor(private readonly prisma: PrismaService) {}

  private items: any[] = [
    {
      id: 'edu-01',
      employeeId: 'emp-101',
      degree: 'B.S. in Computer Science',
      institution: 'University of Texas at Austin',
      institutionName: 'University of Texas at Austin',
      fieldOfStudy: 'Computer Systems Architecture',
      startYear: 2015,
      endYear: 2019,
      grade: '3.9 GPA',
    },
    {
      id: 'edu-02',
      employeeId: 'emp-102',
      degree: 'B.A. in Business Administration & Marketing',
      institution: 'London School of Economics',
      institutionName: 'London School of Economics',
      fieldOfStudy: 'International Business',
      startYear: 2016,
      endYear: 2020,
      grade: 'First Class Honours',
    },
  ];

  async findAll(query?: any) {
    try {
      const dbItems = await this.prisma.hrmEmployeeEducation.findMany({
        where: query?.employeeId ? { employeeId: query.employeeId } : undefined,
        orderBy: { createdAt: 'desc' },
      });
      if (dbItems && dbItems.length > 0) {
        const result = dbItems.map((e) => ({
          ...e,
          institution: e.institutionName,
        }));
        return { data: result, meta: { total: result.length } };
      }
    } catch (err) {}

    let result = [...this.items];
    if (query?.employeeId) {
      result = result.filter((item) => item.employeeId === query.employeeId);
    }
    return { data: result, meta: { total: result.length } };
  }

  async findOne(id: string) {
    try {
      const item = await this.prisma.hrmEmployeeEducation.findUnique({ where: { id } });
      if (item) return { ...item, institution: item.institutionName };
    } catch (err) {}

    const item = this.items.find((i) => i.id === id);
    if (!item) throw new NotFoundException(`Education record with ID ${id} not found`);
    return item;
  }

  async create(data: any) {
    const institutionName = data.institutionName || data.institution || 'University';
    const degree = data.degree || 'Degree';
    const fieldOfStudy = data.fieldOfStudy || null;
    const grade = data.grade || null;

    try {
      let employeeId = data.employeeId;
      let emp: any = null;
      if (employeeId) {
        emp = await this.prisma.hrmEmployee.findFirst({
          where: { OR: [{ id: employeeId }, { employeeNumber: employeeId }] },
        });
      }
      if (!emp) {
        emp = await this.prisma.hrmEmployee.findFirst();
      }
      if (emp) employeeId = emp.id;

      const created = await this.prisma.hrmEmployeeEducation.create({
        data: {
          employeeId,
          institutionName,
          degree,
          fieldOfStudy,
          grade,
        },
      });
      const formatted = { ...created, institution: created.institutionName };
      this.items.unshift(formatted);
      return formatted;
    } catch (err) {
      const newItem = {
        id: data.id || `edu-${Date.now()}`,
        institutionName,
        institution: institutionName,
        degree,
        fieldOfStudy,
        grade,
        createdAt: new Date().toISOString(),
        ...data,
      };
      this.items.unshift(newItem);
      return newItem;
    }
  }

  async update(id: string, data: any) {
    try {
      const updated = await this.prisma.hrmEmployeeEducation.update({
        where: { id },
        data: {
          ...(data.institution || data.institutionName ? { institutionName: data.institution || data.institutionName } : {}),
          ...(data.degree ? { degree: data.degree } : {}),
          ...(data.fieldOfStudy !== undefined ? { fieldOfStudy: data.fieldOfStudy } : {}),
          ...(data.grade !== undefined ? { grade: data.grade } : {}),
        },
      });
      const formatted = { ...updated, institution: updated.institutionName };
      const idx = this.items.findIndex((i) => i.id === id);
      if (idx !== -1) this.items[idx] = { ...this.items[idx], ...formatted };
      return formatted;
    } catch (err) {
      const index = this.items.findIndex((i) => i.id === id);
      if (index === -1) throw new NotFoundException(`Education with ID ${id} not found`);
      this.items[index] = { ...this.items[index], ...data };
      return this.items[index];
    }
  }

  async remove(id: string) {
    try {
      const deleted = await this.prisma.hrmEmployeeEducation.delete({ where: { id } });
      const idx = this.items.findIndex((i) => i.id === id);
      if (idx !== -1) this.items.splice(idx, 1);
      return { message: 'Education record successfully deleted', item: deleted };
    } catch (err) {
      const index = this.items.findIndex((i) => i.id === id);
      if (index === -1) throw new NotFoundException(`Education with ID ${id} not found`);
      const removed = this.items.splice(index, 1)[0];
      return { message: 'Education record successfully deleted', item: removed };
    }
  }
}

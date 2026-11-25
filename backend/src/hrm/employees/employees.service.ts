import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class HrmEmployeesService {
  constructor(private readonly prisma: PrismaService) {}

  private items: any[] = [
    {
      id: 'emp-101',
      employeeNumber: 'EMP-1001',
      firstName: 'Sarah',
      lastName: 'Connor',
      email: 'sarah.connor@example.com',
      phone: '+1-555-0101',
      department: 'Engineering',
      designation: 'Staff Software Engineer',
      location: 'Austin HQ',
      jobGrade: 'L5',
      employmentType: 'Full-time',
      status: 'ACTIVE',
      joiningDate: '2023-03-15',
      salary: 145000,
    },
    {
      id: 'emp-102',
      employeeNumber: 'EMP-1002',
      firstName: 'Marcus',
      lastName: 'Vance',
      email: 'marcus.vance@example.com',
      phone: '+1-555-0102',
      department: 'Sales',
      designation: 'Senior Account Executive',
      location: 'London Office',
      jobGrade: 'L4',
      employmentType: 'Full-time',
      status: 'ACTIVE',
      joiningDate: '2023-06-01',
      salary: 110000,
    },
    {
      id: 'emp-103',
      employeeNumber: 'EMP-1003',
      firstName: 'Elena',
      lastName: 'Rostova',
      email: 'elena.rostova@example.com',
      phone: '+1-555-0103',
      department: 'Human Resources',
      designation: 'HR People Lead',
      location: 'Austin HQ',
      jobGrade: 'L4',
      employmentType: 'Full-time',
      status: 'ACTIVE',
      joiningDate: '2022-11-10',
      salary: 98000,
    },
    {
      id: 'emp-104',
      employeeNumber: 'EMP-1004',
      firstName: 'David',
      lastName: 'Kim',
      email: 'david.kim@example.com',
      phone: '+1-555-0104',
      department: 'Finance',
      designation: 'Financial Analyst',
      location: 'New York Hub',
      jobGrade: 'L3',
      employmentType: 'Full-time',
      status: 'ON_LEAVE',
      joiningDate: '2024-01-15',
      salary: 85000,
    },
  ];

  private formatEmployee(emp: any) {
    if (!emp) return emp;
    return {
      ...emp,
      department: emp.department?.name || emp.department || null,
      designation: emp.designation?.title || emp.designation || null,
      location: emp.location?.name || emp.location || null,
      jobGrade: emp.jobGrade?.gradeLevel || emp.jobGrade?.gradeName || emp.jobGrade || null,
      employmentType: emp.employmentType?.name || emp.employmentType || null,
    };
  }

  async findAll(query?: any) {
    try {
      const dbItems = await this.prisma.hrmEmployee.findMany({
        include: {
          department: true,
          designation: true,
          location: true,
          jobGrade: true,
          employmentType: true,
        },
        orderBy: { createdAt: 'desc' },
      });

      if (dbItems && dbItems.length > 0) {
        let result = dbItems.map((emp) => this.formatEmployee(emp));

        if (query?.search) {
          const q = String(query.search).toLowerCase();
          result = result.filter(
            (item) =>
              item.firstName?.toLowerCase().includes(q) ||
              item.lastName?.toLowerCase().includes(q) ||
              item.email?.toLowerCase().includes(q) ||
              item.employeeNumber?.toLowerCase().includes(q) ||
              item.department?.toLowerCase().includes(q) ||
              item.designation?.toLowerCase().includes(q),
          );
        }
        if (query?.status) {
          result = result.filter((item) => item.status === query.status);
        }
        if (query?.department) {
          result = result.filter((item) => item.department === query.department || item.departmentId === query.department);
        }
        return { data: result, meta: { total: result.length } };
      }
    } catch (err) {}

    let result = [...this.items];
    if (query?.search) {
      const q = String(query.search).toLowerCase();
      result = result.filter((item) =>
        Object.values(item).some(
          (val) => typeof val === 'string' && val.toLowerCase().includes(q),
        ),
      );
    }
    if (query?.status) {
      result = result.filter((item) => item.status === query.status);
    }
    if (query?.department) {
      result = result.filter((item) => item.department === query.department);
    }
    return { data: result, meta: { total: result.length } };
  }

  async findOne(id: string) {
    try {
      const item = await this.prisma.hrmEmployee.findFirst({
        where: { OR: [{ id }, { employeeNumber: id }, { email: id }] },
        include: {
          department: true,
          designation: true,
          location: true,
          jobGrade: true,
          employmentType: true,
        },
      });
      if (item) return this.formatEmployee(item);
    } catch (err) {}

    const item = this.items.find(
      (i) => i.id === id || i.employeeNumber === id || i.email === id,
    );
    if (!item) throw new NotFoundException(`Employee with ID ${id} not found`);
    return item;
  }

  async create(data: any) {
    const firstName = data.firstName || data.name?.split(' ')[0] || 'New';
    const lastName = data.lastName || data.name?.split(' ').slice(1).join(' ') || 'Employee';
    const email = data.email || `${firstName.toLowerCase()}.${Date.now()}@example.com`;
    const employeeNumber = data.employeeNumber || `EMP-${Math.floor(1000 + Math.random() * 9000)}`;
    const phone = data.phone || null;
    const salary = data.salary ? parseFloat(data.salary) : null;
    const status = data.status || 'ACTIVE';
    const joiningDate = data.joiningDate ? new Date(data.joiningDate) : new Date();

    // Resolve Foreign Keys gracefully
    let departmentId: string | null = null;
    let designationId: string | null = null;
    let locationId: string | null = null;
    let jobGradeId: string | null = null;
    let employmentTypeId: string | null = null;

    try {
      if (data.departmentId) {
        const d = await this.prisma.hrmDepartment.findUnique({ where: { id: data.departmentId } });
        if (d) departmentId = d.id;
      } else if (data.department) {
        const d = await this.prisma.hrmDepartment.findFirst({
          where: { OR: [{ name: data.department }, { code: data.department }] },
        });
        if (d) departmentId = d.id;
      }
    } catch {}

    try {
      if (data.designationId) {
        const des = await this.prisma.hrmDesignation.findUnique({ where: { id: data.designationId } });
        if (des) designationId = des.id;
      } else if (data.designation) {
        const des = await this.prisma.hrmDesignation.findFirst({
          where: { OR: [{ title: data.designation }, { code: data.designation }] },
        });
        if (des) designationId = des.id;
      }
    } catch {}

    try {
      if (data.locationId) {
        const loc = await this.prisma.hrmLocation.findUnique({ where: { id: data.locationId } });
        if (loc) locationId = loc.id;
      } else if (data.location) {
        const loc = await this.prisma.hrmLocation.findFirst({
          where: { OR: [{ name: data.location }, { code: data.location }] },
        });
        if (loc) locationId = loc.id;
      }
    } catch {}

    try {
      if (data.jobGradeId) {
        const jg = await this.prisma.hrmJobGrade.findUnique({ where: { id: data.jobGradeId } });
        if (jg) jobGradeId = jg.id;
      } else if (data.jobGrade) {
        const jg = await this.prisma.hrmJobGrade.findFirst({
          where: { OR: [{ gradeLevel: data.jobGrade }, { gradeName: data.jobGrade }] },
        });
        if (jg) jobGradeId = jg.id;
      }
    } catch {}

    try {
      if (data.employmentTypeId) {
        const et = await this.prisma.hrmEmploymentType.findUnique({ where: { id: data.employmentTypeId } });
        if (et) employmentTypeId = et.id;
      } else if (data.employmentType) {
        const et = await this.prisma.hrmEmploymentType.findFirst({
          where: { OR: [{ name: data.employmentType }, { code: data.employmentType }] },
        });
        if (et) employmentTypeId = et.id;
      }
    } catch {}

    try {
      const created = await this.prisma.hrmEmployee.create({
        data: {
          ...(data.id ? { id: String(data.id) } : {}),
          employeeNumber,
          firstName,
          lastName,
          email,
          phone,
          salary,
          status,
          joiningDate,
          departmentId,
          designationId,
          locationId,
          jobGradeId,
          employmentTypeId,
        },
        include: {
          department: true,
          designation: true,
          location: true,
          jobGrade: true,
          employmentType: true,
        },
      });

      const formatted = this.formatEmployee(created);
      this.items.unshift(formatted);
      return formatted;
    } catch (err) {
      const newItem = {
        id: data.id || `emp-${Date.now()}`,
        employeeNumber,
        firstName,
        lastName,
        email,
        phone,
        department: data.department || 'Engineering',
        designation: data.designation || 'Staff Software Engineer',
        location: data.location || 'Austin HQ',
        jobGrade: data.jobGrade || 'L5',
        employmentType: data.employmentType || 'Full-time',
        status,
        salary,
        joiningDate: joiningDate.toISOString().split('T')[0],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        ...data,
      };
      this.items.unshift(newItem);
      return newItem;
    }
  }

  async update(id: string, data: any) {
    try {
      const updated = await this.prisma.hrmEmployee.update({
        where: { id },
        data: {
          ...(data.firstName ? { firstName: data.firstName } : {}),
          ...(data.lastName ? { lastName: data.lastName } : {}),
          ...(data.email ? { email: data.email } : {}),
          ...(data.phone !== undefined ? { phone: data.phone } : {}),
          ...(data.salary !== undefined ? { salary: parseFloat(data.salary) } : {}),
          ...(data.status ? { status: data.status } : {}),
          ...(data.joiningDate ? { joiningDate: new Date(data.joiningDate) } : {}),
        },
        include: {
          department: true,
          designation: true,
          location: true,
          jobGrade: true,
          employmentType: true,
        },
      });
      const formatted = this.formatEmployee(updated);
      const idx = this.items.findIndex((i) => i.id === id);
      if (idx !== -1) this.items[idx] = { ...this.items[idx], ...formatted };
      return formatted;
    } catch (err) {
      const index = this.items.findIndex((i) => i.id === id);
      if (index === -1) throw new NotFoundException(`Employee with ID ${id} not found`);
      this.items[index] = { ...this.items[index], ...data, updatedAt: new Date().toISOString() };
      return this.items[index];
    }
  }

  async remove(id: string) {
    try {
      const deleted = await this.prisma.hrmEmployee.delete({ where: { id } });
      const idx = this.items.findIndex((i) => i.id === id);
      if (idx !== -1) this.items.splice(idx, 1);
      return { message: 'Employee successfully deleted', item: deleted };
    } catch (err) {
      const index = this.items.findIndex((i) => i.id === id);
      if (index === -1) throw new NotFoundException(`Employee with ID ${id} not found`);
      const removed = this.items.splice(index, 1)[0];
      return { message: 'Employee successfully deleted', item: removed };
    }
  }
}

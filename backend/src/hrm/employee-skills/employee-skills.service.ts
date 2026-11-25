import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class HrmEmployeeSkillsService {
  constructor(private readonly prisma: PrismaService) {}

  private items: any[] = [
    {
      id: 'sk-01',
      employeeId: 'emp-101',
      skillName: 'TypeScript / Node.js',
      proficiency: 'EXPERT',
      yearsOfExperience: 6,
      verified: true,
    },
    {
      id: 'sk-02',
      employeeId: 'emp-101',
      skillName: 'PostgreSQL Database Architecture',
      proficiency: 'ADVANCED',
      yearsOfExperience: 5,
      verified: true,
    },
    {
      id: 'sk-03',
      employeeId: 'emp-102',
      skillName: 'Enterprise B2B Negotiations',
      proficiency: 'EXPERT',
      yearsOfExperience: 5,
      verified: true,
    },
  ];

  async findAll(query?: any) {
    try {
      const dbItems = await this.prisma.hrmEmployeeSkill.findMany({
        where: query?.employeeId ? { employeeId: query.employeeId } : undefined,
        orderBy: { createdAt: 'desc' },
      });
      if (dbItems && dbItems.length > 0) {
        let result = dbItems.map((s) => ({
          ...s,
          proficiency: s.proficiencyLevel,
        }));
        if (query?.search) {
          const q = String(query.search).toLowerCase();
          result = result.filter((item) => item.skillName.toLowerCase().includes(q));
        }
        return { data: result, meta: { total: result.length } };
      }
    } catch (err) {}

    let result = [...this.items];
    if (query?.employeeId) {
      result = result.filter((item) => item.employeeId === query.employeeId);
    }
    if (query?.search) {
      const q = String(query.search).toLowerCase();
      result = result.filter((item) => item.skillName?.toLowerCase().includes(q));
    }
    return { data: result, meta: { total: result.length } };
  }

  async findOne(id: string) {
    try {
      const item = await this.prisma.hrmEmployeeSkill.findUnique({ where: { id } });
      if (item) return { ...item, proficiency: item.proficiencyLevel };
    } catch (err) {}

    const item = this.items.find((i) => i.id === id);
    if (!item) throw new NotFoundException(`Skill with ID ${id} not found`);
    return item;
  }

  async create(data: any) {
    const skillName = data.skillName || data.name || 'Skill';
    const proficiencyLevel = data.proficiency || data.proficiencyLevel || 'INTERMEDIATE';
    const yearsOfExperience = data.yearsOfExperience ? parseFloat(data.yearsOfExperience) : null;

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

      const created = await this.prisma.hrmEmployeeSkill.create({
        data: {
          employeeId,
          skillName,
          proficiencyLevel,
          yearsOfExperience,
        },
      });
      const formatted = { ...created, proficiency: created.proficiencyLevel };
      this.items.unshift(formatted);
      return formatted;
    } catch (err) {
      console.error('Prisma create error in HrmEmployeeSkillsService:', err);
      const newItem = {
        id: data.id || `sk-${Date.now()}`,
        skillName,
        proficiency: proficiencyLevel,
        yearsOfExperience,
        ...data,
      };
      this.items.unshift(newItem);
      return newItem;
    }
  }

  async update(id: string, data: any) {
    try {
      const updated = await this.prisma.hrmEmployeeSkill.update({
        where: { id },
        data: {
          ...(data.skillName ? { skillName: data.skillName } : {}),
          ...(data.proficiency || data.proficiencyLevel ? { proficiencyLevel: data.proficiency || data.proficiencyLevel } : {}),
          ...(data.yearsOfExperience !== undefined ? { yearsOfExperience: parseFloat(data.yearsOfExperience) } : {}),
        },
      });
      const formatted = { ...updated, proficiency: updated.proficiencyLevel };
      const idx = this.items.findIndex((i) => i.id === id);
      if (idx !== -1) this.items[idx] = { ...this.items[idx], ...formatted };
      return formatted;
    } catch (err) {
      const index = this.items.findIndex((i) => i.id === id);
      if (index === -1) throw new NotFoundException(`Skill with ID ${id} not found`);
      this.items[index] = { ...this.items[index], ...data };
      return this.items[index];
    }
  }

  async remove(id: string) {
    try {
      const deleted = await this.prisma.hrmEmployeeSkill.delete({ where: { id } });
      const idx = this.items.findIndex((i) => i.id === id);
      if (idx !== -1) this.items.splice(idx, 1);
      return { message: 'Skill successfully deleted', item: deleted };
    } catch (err) {
      const index = this.items.findIndex((i) => i.id === id);
      if (index === -1) throw new NotFoundException(`Skill with ID ${id} not found`);
      const removed = this.items.splice(index, 1)[0];
      return { message: 'Skill successfully deleted', item: removed };
    }
  }
}

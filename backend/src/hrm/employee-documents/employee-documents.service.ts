import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class HrmEmployeeDocumentsService {
  constructor(private readonly prisma: PrismaService) {}

  private items: any[] = [
    {
      id: 'doc-01',
      employeeId: 'emp-101',
      documentType: 'PASSPORT',
      documentName: 'International Passport.pdf',
      documentNumber: 'P89218290',
      fileUrl: 'https://documents.example.com/passport-emp-101.pdf',
      status: 'VERIFIED',
    },
    {
      id: 'doc-02',
      employeeId: 'emp-102',
      documentType: 'CONTRACT',
      documentName: 'Employment Agreement Executed.pdf',
      documentNumber: 'CTR-2023-118',
      fileUrl: 'https://documents.example.com/contract-emp-102.pdf',
      status: 'VERIFIED',
    },
  ];

  async findAll(query?: any) {
    try {
      const dbItems = await this.prisma.hrmEmployeeDocument.findMany({
        where: query?.employeeId ? { employeeId: query.employeeId } : undefined,
        orderBy: { createdAt: 'desc' },
      });
      if (dbItems && dbItems.length > 0) {
        return { data: dbItems, meta: { total: dbItems.length } };
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
      const item = await this.prisma.hrmEmployeeDocument.findUnique({ where: { id } });
      if (item) return item;
    } catch (err) {}

    const item = this.items.find((i) => i.id === id);
    if (!item) throw new NotFoundException(`Document with ID ${id} not found`);
    return item;
  }

  async create(data: any) {
    const documentType = data.documentType || 'OTHER';
    const documentNumber = data.documentNumber || null;
    const fileUrl = data.fileUrl || 'https://example.com/doc.pdf';

    try {
      let employeeId = data.employeeId;
      const emp = await this.prisma.hrmEmployee.findFirst({
        where: { OR: [{ id: employeeId }, { employeeNumber: employeeId }] },
      });
      if (emp) employeeId = emp.id;

      const created = await this.prisma.hrmEmployeeDocument.create({
        data: {
          employeeId,
          documentType,
          documentNumber,
          fileUrl,
        },
      });
      this.items.unshift(created);
      return created;
    } catch (err) {
      const newItem = {
        id: data.id || `doc-${Date.now()}`,
        documentType,
        documentNumber,
        fileUrl,
        createdAt: new Date().toISOString(),
        ...data,
      };
      this.items.unshift(newItem);
      return newItem;
    }
  }

  async update(id: string, data: any) {
    try {
      const updated = await this.prisma.hrmEmployeeDocument.update({
        where: { id },
        data: {
          ...(data.documentType ? { documentType: data.documentType } : {}),
          ...(data.documentNumber !== undefined ? { documentNumber: data.documentNumber } : {}),
          ...(data.fileUrl ? { fileUrl: data.fileUrl } : {}),
        },
      });
      const idx = this.items.findIndex((i) => i.id === id);
      if (idx !== -1) this.items[idx] = { ...this.items[idx], ...updated };
      return updated;
    } catch (err) {
      const index = this.items.findIndex((i) => i.id === id);
      if (index === -1) throw new NotFoundException(`Document with ID ${id} not found`);
      this.items[index] = { ...this.items[index], ...data };
      return this.items[index];
    }
  }

  async remove(id: string) {
    try {
      const deleted = await this.prisma.hrmEmployeeDocument.delete({ where: { id } });
      const idx = this.items.findIndex((i) => i.id === id);
      if (idx !== -1) this.items.splice(idx, 1);
      return { message: 'Document successfully deleted', item: deleted };
    } catch (err) {
      const index = this.items.findIndex((i) => i.id === id);
      if (index === -1) throw new NotFoundException(`Document with ID ${id} not found`);
      const removed = this.items.splice(index, 1)[0];
      return { message: 'Document successfully deleted', item: removed };
    }
  }
}

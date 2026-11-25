import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class HrmLocationsService {
  constructor(private readonly prisma: PrismaService) {}

  private items: any[] = [
    {
      id: 'loc-01',
      code: 'ATX-HQ',
      name: 'Austin Headquarters',
      address: '100 Congress Ave',
      city: 'Austin',
      state: 'TX',
      country: 'USA',
      isHeadquarters: true,
      status: 'ACTIVE',
    },
    {
      id: 'loc-02',
      code: 'LON-01',
      name: 'London Office',
      address: '25 Bank Street, Canary Wharf',
      city: 'London',
      state: 'Greater London',
      country: 'UK',
      isHeadquarters: false,
      status: 'ACTIVE',
    },
    {
      id: 'loc-03',
      code: 'NYC-HUB',
      name: 'New York Hub',
      address: '350 5th Ave',
      city: 'New York',
      state: 'NY',
      country: 'USA',
      isHeadquarters: false,
      status: 'ACTIVE',
    },
    {
      id: 'loc-04',
      code: 'REMOTE',
      name: 'Global Remote Workplace',
      address: 'Digital Distributed',
      city: 'Global',
      state: 'Virtual',
      country: 'Worldwide',
      isHeadquarters: false,
      status: 'ACTIVE',
    },
  ];

  async findAll(query?: any) {
    try {
      const dbItems = await this.prisma.hrmLocation.findMany({
        orderBy: { createdAt: 'desc' },
      });
      if (dbItems && dbItems.length > 0) {
        let result = dbItems;
        if (query?.search) {
          const q = String(query.search).toLowerCase();
          result = result.filter(
            (item) =>
              item.name?.toLowerCase().includes(q) ||
              item.city?.toLowerCase().includes(q) ||
              item.country?.toLowerCase().includes(q) ||
              item.code?.toLowerCase().includes(q),
          );
        }
        if (query?.status) {
          result = result.filter((item) => item.status === query.status);
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
    return { data: result, meta: { total: result.length } };
  }

  async findOne(id: string) {
    try {
      const item = await this.prisma.hrmLocation.findFirst({
        where: { OR: [{ id }, { code: id }] },
      });
      if (item) return item;
    } catch (err) {}

    const item = this.items.find((i) => i.id === id || i.code === id);
    if (!item) throw new NotFoundException(`Location with ID ${id} not found`);
    return item;
  }

  async create(data: any) {
    const name = data.name || 'New Location';
    const code = data.code || name.substring(0, 3).toUpperCase();
    const address = data.address || null;
    const city = data.city || null;
    const state = data.state || null;
    const country = data.country || null;
    const isHeadquarters = Boolean(data.isHeadquarters);
    const status = data.status || 'ACTIVE';

    try {
      const created = await this.prisma.hrmLocation.create({
        data: {
          ...(data.id ? { id: String(data.id) } : {}),
          name,
          code,
          address,
          city,
          state,
          country,
          isHeadquarters,
          status,
        },
      });
      this.items.unshift(created);
      return created;
    } catch (err) {
      const newItem = {
        id: data.id || `loc-${Date.now()}`,
        name,
        code,
        address,
        city,
        state,
        country,
        isHeadquarters,
        status,
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
      const updated = await this.prisma.hrmLocation.update({
        where: { id },
        data: {
          ...(data.name ? { name: data.name } : {}),
          ...(data.code !== undefined ? { code: data.code } : {}),
          ...(data.address !== undefined ? { address: data.address } : {}),
          ...(data.city !== undefined ? { city: data.city } : {}),
          ...(data.state !== undefined ? { state: data.state } : {}),
          ...(data.country !== undefined ? { country: data.country } : {}),
          ...(data.isHeadquarters !== undefined ? { isHeadquarters: Boolean(data.isHeadquarters) } : {}),
          ...(data.status ? { status: data.status } : {}),
        },
      });
      const idx = this.items.findIndex((i) => i.id === id);
      if (idx !== -1) this.items[idx] = { ...this.items[idx], ...updated };
      return updated;
    } catch (err) {
      const index = this.items.findIndex((i) => i.id === id);
      if (index === -1) throw new NotFoundException(`Location with ID ${id} not found`);
      this.items[index] = { ...this.items[index], ...data, updatedAt: new Date().toISOString() };
      return this.items[index];
    }
  }

  async remove(id: string) {
    try {
      const deleted = await this.prisma.hrmLocation.delete({ where: { id } });
      const idx = this.items.findIndex((i) => i.id === id);
      if (idx !== -1) this.items.splice(idx, 1);
      return { message: 'Location successfully deleted', item: deleted };
    } catch (err) {
      const index = this.items.findIndex((i) => i.id === id);
      if (index === -1) throw new NotFoundException(`Location with ID ${id} not found`);
      const removed = this.items.splice(index, 1)[0];
      return { message: 'Location successfully deleted', item: removed };
    }
  }
}

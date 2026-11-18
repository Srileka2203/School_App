import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

export interface ErpIntegrationConnector {
  id?: string;
  name: string;
  type: string;
  status?: string;
  config?: any;
  lastSyncAt?: Date | string;
  recordsSyncedToday?: number;
  workspaceId?: string;
}

@Injectable()
export class IntegrationsService {
  constructor(private readonly prisma: PrismaService) {}

  async getConnectors(workspaceId?: string) {
    const where = workspaceId ? { workspaceId } : {};
    const [data, total] = await Promise.all([
      this.prisma.erpConnector.findMany({
        where,
        include: {
          logs: {
            take: 5,
            orderBy: { timestamp: 'desc' },
          },
        },
        orderBy: { name: 'asc' },
      }),
      this.prisma.erpConnector.count({ where }),
    ]);

    return {
      data,
      meta: { total },
    };
  }

  async triggerSync(id: string) {
    const connector = await this.prisma.erpConnector.findUnique({
      where: { id },
    });

    if (!connector) {
      throw new NotFoundException(`Connector ${id} not found`);
    }

    const updated = await this.prisma.erpConnector.update({
      where: { id },
      data: {
        lastSyncAt: new Date(),
        recordsSyncedToday: { increment: 10 },
      },
    });

    await this.prisma.erpIntegrationLog.create({
      data: {
        connectorId: id,
        level: 'INFO',
        message: `Sync completed successfully for ${connector.name}`,
        payload: { recordsProcessed: 10 },
      },
    });

    return {
      message: `Sync triggered successfully for ${connector.name}`,
      connector: updated,
    };
  }

  async getLogs(connectorId?: string) {
    const where = connectorId ? { connectorId } : {};
    return this.prisma.erpIntegrationLog.findMany({
      where,
      orderBy: { timestamp: 'desc' },
      take: 50,
    });
  }
}

import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

function formatDatabaseUrl(rawUrl?: string): string {
  if (!rawUrl) return '';
  try {
    const url = new URL(rawUrl);
    // Ensure pool_timeout is at least 30 seconds to prevent pool timeout under parallel bursts
    if (!url.searchParams.has('pool_timeout')) {
      url.searchParams.set('pool_timeout', '30');
    }
    // Ensure connection_limit is set (5 connections max for Supabase stability)
    if (!url.searchParams.has('connection_limit')) {
      url.searchParams.set('connection_limit', '5');
    }
    // Ensure connect_timeout is at least 30 seconds
    if (!url.searchParams.has('connect_timeout')) {
      url.searchParams.set('connect_timeout', '30');
    }
    // If pooler port 6543, ensure pgbouncer=true
    if (url.port === '6543' && !url.searchParams.has('pgbouncer')) {
      url.searchParams.set('pgbouncer', 'true');
    }
    return url.toString();
  } catch {
    return rawUrl;
  }
}

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  constructor() {
    const activeUrl = formatDatabaseUrl(
      process.env.DATABASE_URL || process.env.SUPABASE_POOLER_URL || process.env.DIRECT_URL,
    );

    super({
      datasources: {
        db: {
          url: activeUrl,
        },
      },
      log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    });
  }

  async onModuleInit() {
    const maxRetries = 5;
    const retryDelayMs = 2500;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        await this.$connect();
        this.logger.log('Successfully connected to database.');
        return;
      } catch (err: any) {
        this.logger.warn(
          `Database connection attempt ${attempt}/${maxRetries} failed: ${err.message || err}`,
        );
        if (attempt === maxRetries) {
          this.logger.error('Could not establish database connection after maximum retries.');
          throw err;
        }
        await new Promise((resolve) => setTimeout(resolve, retryDelayMs));
      }
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}

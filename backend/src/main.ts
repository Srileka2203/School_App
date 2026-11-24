import * as net from 'net';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { createValidationPipe } from './common/pipes/validation.pipe';

async function selectReachableDatabaseUrl(): Promise<void> {
  const directUrl = process.env.DIRECT_URL;
  const poolerUrl = process.env.SUPABASE_POOLER_URL;

  if (!directUrl && !poolerUrl) return;

  const parseHostPort = (urlStr?: string, defaultPort = 5432) => {
    if (!urlStr) return null;
    try {
      const match = urlStr.match(/@([^:/]+)(?::(\d+))?/);
      if (match) {
        return { host: match[1], port: match[2] ? parseInt(match[2], 10) : defaultPort };
      }
    } catch {}
    return null;
  };

  const direct = parseHostPort(directUrl, 5432);
  const pooler = parseHostPort(poolerUrl, 6543);

  const checkSocket = (target: { host: string; port: number } | null, timeoutMs = 4000): Promise<boolean> => {
    if (!target) return Promise.resolve(false);
    return new Promise((resolve) => {
      const s = new net.Socket();
      s.setTimeout(timeoutMs);
      s.on('connect', () => {
        s.destroy();
        resolve(true);
      });
      s.on('timeout', () => {
        s.destroy();
        resolve(false);
      });
      s.on('error', () => {
        resolve(false);
      });
      s.connect(target.port, target.host);
    });
  };

  const [poolerOk, directOk] = await Promise.all([
    checkSocket(pooler, 4000),
    checkSocket(direct, 4000),
  ]);

  if (poolerOk && poolerUrl) {
    console.log(`📡 Database route: pooler connection [${pooler?.host}:${pooler?.port}] is reachable.`);
    process.env.DATABASE_URL = poolerUrl;
  } else if (directOk && directUrl) {
    console.log(`📡 Database route: direct connection [${direct?.host}:${direct?.port}] is reachable.`);
    process.env.DATABASE_URL = directUrl;
  } else if (poolerUrl) {
    console.log(`📡 Database route: defaulting to pooler connection [${pooler?.host}:${pooler?.port}].`);
    process.env.DATABASE_URL = poolerUrl;
  }
}

async function bootstrap() {
  await selectReachableDatabaseUrl();
  const app = await NestFactory.create(AppModule);

  // Enable CORS
  app.enableCors({
    origin: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  // Global Validation Pipe
  app.useGlobalPipes(createValidationPipe());

  // Swagger Documentation Setup
  const config = new DocumentBuilder()
    .setTitle('CRM Backend REST API')
    .setDescription('Complete enterprise CRM REST API built with NestJS, Prisma ORM, and SQLite database.')
    .setVersion('1.0.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter your JWT token',
        in: 'header',
      },
      'JWT-auth',
    )
    .addTag('Auth', 'Authentication, user registration, token refresh, and password management')
    .addTag('Users', 'User management, status updates, roles, and related activities/deals')
    .addTag('Organizations', 'Company and customer account management')
    .addTag('Roles & Permissions', 'Role-based access control and permission management')
    .addTag('Contacts', 'Contact management and conversion to deals')
    .addTag('Leads', 'Lead tracking, scoring, pipeline assignment, and conversion')
    .addTag('Deals', 'Opportunity and revenue pipeline stages')
    .addTag('Pipelines & Stages', 'Customizable sales pipelines and stage management')
    .addTag('Activities', 'Calls, meetings, emails, and follow-ups')
    .addTag('Tasks', 'Task assignment, due dates, and completion tracking')
    .addTag('Notes', 'Notes attached to contacts, leads, and deals')
    .addTag('Products', 'Product catalog and deal pricing')
    .addTag('Notifications', 'In-app user notifications')
    .addTag('Dashboard & Reports', 'Business analytics, revenue stats, and sales reports')
    .addTag('Files', 'Attachment and file upload management')
    .addTag('Settings', 'System and user preference settings')
    .addTag('Calendar', 'Calendar events, meetings, and schedule overview')
    .addTag('Workspaces', 'Multi-tenant workspace isolation, members, invitations, roles, and settings')
    .addTag('Teams', 'Team management, members, activities, and performance metrics')
    .addTag('Lead Generation', 'Lead capture, lead sources, web forms, landing pages, scoring, qualification, routing, and analytics')
    .addTag('Custom Fields', 'Module 23: Dynamic custom fields, layout, validation, options management, entity integration, and safe type migration')
    .addTag('Tags', 'Module 24: Reusable tagging system for Leads, Contacts, Companies, Deals, Activities, and Documents with workspace isolation and usage statistics')
    .addTag('Audit Logs', 'Module 25: Comprehensive audit trail, entity change history, compliance export, and data governance')
    .addTag('Help & Support', 'Module 28: Help center, documentation, FAQs, contact support tickets, and user feedback')
    .addTag('HRM - Human Resource Management', 'Enterprise HRM Suite: employee lifecycle, payroll, attendance, shifts, leave, expenses, and talent')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  const swaggerCustomOptions = {
    swaggerOptions: {
      persistAuthorization: true,
      docExpansion: 'none',
      filter: true,
      showRequestDuration: true,
    },
    customSiteTitle: 'CRM Backend REST API Documentation',
  };

  SwaggerModule.setup('docs', app, document, swaggerCustomOptions);
  SwaggerModule.setup('api/docs', app, document, swaggerCustomOptions);
  SwaggerModule.setup('swagger', app, document, swaggerCustomOptions);

  const defaultPort = parseInt(String(process.env.PORT || 3000), 10);

  const listenWithRetry = async (portToTry: number, maxPortAttempts = 5): Promise<number> => {
    for (let attempt = 0; attempt < maxPortAttempts; attempt++) {
      const currentPort = portToTry + attempt;
      for (let retry = 0; retry < 3; retry++) {
        try {
          await app.listen(currentPort, '0.0.0.0');
          return currentPort;
        } catch (err: any) {
          if (err.code === 'EADDRINUSE') {
            if (retry < 2) {
              await new Promise((resolve) => setTimeout(resolve, 600));
              continue;
            }
            if (attempt < maxPortAttempts - 1) {
              console.warn(`⚠️ Port ${currentPort} is busy (EADDRINUSE). Trying port ${currentPort + 1}...`);
            }
            break;
          }
          throw err;
        }
      }
    }
    throw new Error(`Unable to bind server: all ports from ${portToTry} to ${portToTry + maxPortAttempts - 1} are in use.`);
  };

  const port = await listenWithRetry(defaultPort);
  console.log(`🚀 CRM Backend Server running at: http://localhost:${port}`);
  console.log(`📚 Swagger Documentation available at: http://localhost:${port}/docs, http://localhost:${port}/api/docs, and http://localhost:${port}/swagger`);
}

bootstrap();

import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import databaseConfig from './config/database.config';
import jwtConfig from './config/jwt.config';
import appConfig from './config/app.config';
import { DatabaseModule } from './database/database.module';
import { LoggerMiddleware } from './common/middleware/logger.middleware';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { PrismaExceptionFilter } from './common/filters/prisma-exception.filter';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { AuthModule } from './platform/auth/auth.module';
import { UsersModule } from './platform/users/users.module';
import { OrganizationsModule } from './platform/organizations/organizations.module';
import { RolesModule } from './platform/roles/roles.module';
import { ContactsModule } from './crm/contacts/contacts.module';
import { LeadsModule } from './crm/leads/leads.module';
import { DealsModule } from './crm/deals/deals.module';
import { PipelinesModule } from './crm/pipelines/pipelines.module';
import { ActivitiesModule } from './crm/activities/activities.module';
import { TasksModule } from './crm/tasks/tasks.module';
import { NotesModule } from './crm/notes/notes.module';
import { ProductsModule } from './crm/products/products.module';
import { NotificationsModule } from './platform/notifications/notifications.module';
import { ReportsModule } from './crm/reports/reports.module';
import { FilesModule } from './platform/files/files.module';
import { SettingsModule } from './platform/settings/settings.module';
import { CalendarModule } from './crm/calendar/calendar.module';
import { WorkspacesModule } from './platform/workspaces/workspaces.module';
import { TeamsModule } from './platform/teams/teams.module';
import { LeadGenerationModule } from './crm/lead-generation/lead-generation.module';
import { CommunicationsModule } from './crm/communications/communications.module';
import { SearchModule } from './crm/search/search.module';
import { AnalyticsModule } from './crm/analytics/analytics.module';
import { CustomFieldsModule } from './platform/custom-fields/custom-fields.module';
import { TagsModule } from './crm/tags/tags.module';
import { AuditLogsModule } from './platform/audit-logs/audit-logs.module';
import { HelpSupportModule } from './platform/help-support/help-support.module';
import { AppController } from './app.controller';

@Module({
  controllers: [AppController],
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig, jwtConfig, appConfig],
    }),
    DatabaseModule,
    AuthModule,
    UsersModule,
    OrganizationsModule,
    RolesModule,
    ContactsModule,
    LeadsModule,
    DealsModule,
    PipelinesModule,
    ActivitiesModule,
    TasksModule,
    NotesModule,
    ProductsModule,
    NotificationsModule,
    ReportsModule,
    FilesModule,
    SettingsModule,
    CalendarModule,
    WorkspacesModule,
    TeamsModule,
    LeadGenerationModule,
    CommunicationsModule,
    SearchModule,
    AnalyticsModule,
    CustomFieldsModule,
    TagsModule,
    AuditLogsModule,
    HelpSupportModule,
  ],
  providers: [
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
    {
      provide: APP_FILTER,
      useClass: PrismaExceptionFilter,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: TransformInterceptor,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}

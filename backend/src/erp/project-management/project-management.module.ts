import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../database/database.module';
import { ProjectManagementController } from './project-management.controller';
import { ProjectManagementService } from './project-management.service';

@Module({
  imports: [DatabaseModule],
  controllers: [ProjectManagementController],
  providers: [ProjectManagementService],
  exports: [ProjectManagementService],
})
export class ProjectManagementModule {}

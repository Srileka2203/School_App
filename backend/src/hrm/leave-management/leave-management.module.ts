import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../database/database.module';
import { HrmLeaveManagementController } from './leave-management.controller';
import { HrmLeaveManagementService } from './leave-management.service';

@Module({
  imports: [DatabaseModule],
  controllers: [HrmLeaveManagementController],
  providers: [HrmLeaveManagementService],
  exports: [HrmLeaveManagementService],
})
export class HrmLeaveManagementModule {}

import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../database/database.module';
import { QualityManagementController } from './quality-management.controller';
import { QualityManagementService } from './quality-management.service';

@Module({
  imports: [DatabaseModule],
  controllers: [QualityManagementController],
  providers: [QualityManagementService],
  exports: [QualityManagementService],
})
export class QualityManagementModule {}

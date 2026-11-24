import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../database/database.module';
import { HrmReportingController } from './reporting.controller';
import { HrmReportingService } from './reporting.service';

@Module({
  imports: [DatabaseModule],
  controllers: [HrmReportingController],
  providers: [HrmReportingService],
  exports: [HrmReportingService],
})
export class HrmReportingModule {}

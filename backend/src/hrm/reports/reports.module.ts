import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../database/database.module';
import { HrmReportsController } from './reports.controller';
import { HrmReportsService } from './reports.service';

@Module({
  imports: [DatabaseModule],
  controllers: [HrmReportsController],
  providers: [HrmReportsService],
  exports: [HrmReportsService],
})
export class HrmReportsModule {}

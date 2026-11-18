import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../database/database.module';
import { ErpReportsController } from './reports.controller';
import { ErpReportsService } from './reports.service';

@Module({
  imports: [DatabaseModule],
  controllers: [ErpReportsController],
  providers: [ErpReportsService],
  exports: [ErpReportsService],
})
export class ErpReportsModule {}

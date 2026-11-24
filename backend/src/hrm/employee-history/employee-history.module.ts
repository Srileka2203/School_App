import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../database/database.module';
import { HrmEmployeeHistoryController } from './employee-history.controller';
import { HrmEmployeeHistoryService } from './employee-history.service';

@Module({
  imports: [DatabaseModule],
  controllers: [HrmEmployeeHistoryController],
  providers: [HrmEmployeeHistoryService],
  exports: [HrmEmployeeHistoryService],
})
export class HrmEmployeeHistoryModule {}

import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../database/database.module';
import { HrmPerformanceController } from './performance.controller';
import { HrmPerformanceService } from './performance.service';

@Module({
  imports: [DatabaseModule],
  controllers: [HrmPerformanceController],
  providers: [HrmPerformanceService],
  exports: [HrmPerformanceService],
})
export class HrmPerformanceModule {}

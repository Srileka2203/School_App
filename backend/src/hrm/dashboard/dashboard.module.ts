import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../database/database.module';
import { HrmDashboardController } from './dashboard.controller';
import { HrmDashboardService } from './dashboard.service';

@Module({
  imports: [DatabaseModule],
  controllers: [HrmDashboardController],
  providers: [HrmDashboardService],
  exports: [HrmDashboardService],
})
export class HrmDashboardModule {}

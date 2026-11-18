import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../database/database.module';
import { ErpDashboardController } from './dashboard.controller';
import { ErpDashboardService } from './dashboard.service';

@Module({
  imports: [DatabaseModule],
  controllers: [ErpDashboardController],
  providers: [ErpDashboardService],
  exports: [ErpDashboardService],
})
export class ErpDashboardModule {}

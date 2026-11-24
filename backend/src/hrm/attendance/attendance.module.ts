import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../database/database.module';
import { HrmAttendanceController } from './attendance.controller';
import { HrmAttendanceService } from './attendance.service';

@Module({
  imports: [DatabaseModule],
  controllers: [HrmAttendanceController],
  providers: [HrmAttendanceService],
  exports: [HrmAttendanceService],
})
export class HrmAttendanceModule {}

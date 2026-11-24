import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../database/database.module';
import { HrmShiftsController } from './shifts.controller';
import { HrmShiftsService } from './shifts.service';

@Module({
  imports: [DatabaseModule],
  controllers: [HrmShiftsController],
  providers: [HrmShiftsService],
  exports: [HrmShiftsService],
})
export class HrmShiftsModule {}

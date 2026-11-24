import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../database/database.module';
import { HrmJobGradesController } from './job-grades.controller';
import { HrmJobGradesService } from './job-grades.service';

@Module({
  imports: [DatabaseModule],
  controllers: [HrmJobGradesController],
  providers: [HrmJobGradesService],
  exports: [HrmJobGradesService],
})
export class HrmJobGradesModule {}

import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../database/database.module';
import { HrmEmployeeEducationController } from './employee-education.controller';
import { HrmEmployeeEducationService } from './employee-education.service';

@Module({
  imports: [DatabaseModule],
  controllers: [HrmEmployeeEducationController],
  providers: [HrmEmployeeEducationService],
  exports: [HrmEmployeeEducationService],
})
export class HrmEmployeeEducationModule {}

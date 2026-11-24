import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../database/database.module';
import { HrmEmployeeExperienceController } from './employee-experience.controller';
import { HrmEmployeeExperienceService } from './employee-experience.service';

@Module({
  imports: [DatabaseModule],
  controllers: [HrmEmployeeExperienceController],
  providers: [HrmEmployeeExperienceService],
  exports: [HrmEmployeeExperienceService],
})
export class HrmEmployeeExperienceModule {}

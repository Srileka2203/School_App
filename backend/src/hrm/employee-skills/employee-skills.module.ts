import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../database/database.module';
import { HrmEmployeeSkillsController } from './employee-skills.controller';
import { HrmEmployeeSkillsService } from './employee-skills.service';

@Module({
  imports: [DatabaseModule],
  controllers: [HrmEmployeeSkillsController],
  providers: [HrmEmployeeSkillsService],
  exports: [HrmEmployeeSkillsService],
})
export class HrmEmployeeSkillsModule {}

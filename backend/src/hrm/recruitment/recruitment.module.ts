import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../database/database.module';
import { HrmRecruitmentController } from './recruitment.controller';
import { HrmRecruitmentService } from './recruitment.service';

@Module({
  imports: [DatabaseModule],
  controllers: [HrmRecruitmentController],
  providers: [HrmRecruitmentService],
  exports: [HrmRecruitmentService],
})
export class HrmRecruitmentModule {}

import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../database/database.module';
import { HrmTrainingController } from './training.controller';
import { HrmTrainingService } from './training.service';

@Module({
  imports: [DatabaseModule],
  controllers: [HrmTrainingController],
  providers: [HrmTrainingService],
  exports: [HrmTrainingService],
})
export class HrmTrainingModule {}

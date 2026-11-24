import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../database/database.module';
import { HrmEmploymentTypesController } from './employment-types.controller';
import { HrmEmploymentTypesService } from './employment-types.service';

@Module({
  imports: [DatabaseModule],
  controllers: [HrmEmploymentTypesController],
  providers: [HrmEmploymentTypesService],
  exports: [HrmEmploymentTypesService],
})
export class HrmEmploymentTypesModule {}

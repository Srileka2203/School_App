import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../database/database.module';
import { HrmDepartmentsController } from './departments.controller';
import { HrmDepartmentsService } from './departments.service';

@Module({
  imports: [DatabaseModule],
  controllers: [HrmDepartmentsController],
  providers: [HrmDepartmentsService],
  exports: [HrmDepartmentsService],
})
export class HrmDepartmentsModule {}

import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../database/database.module';
import { HrmEmployeesController } from './employees.controller';
import { HrmEmployeesService } from './employees.service';

@Module({
  imports: [DatabaseModule],
  controllers: [HrmEmployeesController],
  providers: [HrmEmployeesService],
  exports: [HrmEmployeesService],
})
export class HrmEmployeesModule {}

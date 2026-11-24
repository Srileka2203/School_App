import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../database/database.module';
import { HrmPayrollController } from './payroll.controller';
import { HrmPayrollService } from './payroll.service';

@Module({
  imports: [DatabaseModule],
  controllers: [HrmPayrollController],
  providers: [HrmPayrollService],
  exports: [HrmPayrollService],
})
export class HrmPayrollModule {}

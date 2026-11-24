import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../database/database.module';
import { HrmExpensesController } from './expenses.controller';
import { HrmExpensesService } from './expenses.service';

@Module({
  imports: [DatabaseModule],
  controllers: [HrmExpensesController],
  providers: [HrmExpensesService],
  exports: [HrmExpensesService],
})
export class HrmExpensesModule {}

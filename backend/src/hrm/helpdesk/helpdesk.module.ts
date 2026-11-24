import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../database/database.module';
import { HrmHelpdeskController } from './helpdesk.controller';
import { HrmHelpdeskService } from './helpdesk.service';

@Module({
  imports: [DatabaseModule],
  controllers: [HrmHelpdeskController],
  providers: [HrmHelpdeskService],
  exports: [HrmHelpdeskService],
})
export class HrmHelpdeskModule {}

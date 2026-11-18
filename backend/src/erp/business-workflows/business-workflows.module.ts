import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../database/database.module';
import { BusinessWorkflowsController } from './business-workflows.controller';
import { BusinessWorkflowsService } from './business-workflows.service';

@Module({
  imports: [DatabaseModule],
  controllers: [BusinessWorkflowsController],
  providers: [BusinessWorkflowsService],
  exports: [BusinessWorkflowsService],
})
export class BusinessWorkflowsModule {}

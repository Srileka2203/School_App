import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../database/database.module';
import { HrmEmployeeDocumentsController } from './employee-documents.controller';
import { HrmEmployeeDocumentsService } from './employee-documents.service';

@Module({
  imports: [DatabaseModule],
  controllers: [HrmEmployeeDocumentsController],
  providers: [HrmEmployeeDocumentsService],
  exports: [HrmEmployeeDocumentsService],
})
export class HrmEmployeeDocumentsModule {}

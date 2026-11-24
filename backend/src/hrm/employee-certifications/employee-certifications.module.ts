import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../database/database.module';
import { HrmEmployeeCertificationsController } from './employee-certifications.controller';
import { HrmEmployeeCertificationsService } from './employee-certifications.service';

@Module({
  imports: [DatabaseModule],
  controllers: [HrmEmployeeCertificationsController],
  providers: [HrmEmployeeCertificationsService],
  exports: [HrmEmployeeCertificationsService],
})
export class HrmEmployeeCertificationsModule {}

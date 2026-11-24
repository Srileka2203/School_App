import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../database/database.module';
import { HrmLocationsController } from './locations.controller';
import { HrmLocationsService } from './locations.service';

@Module({
  imports: [DatabaseModule],
  controllers: [HrmLocationsController],
  providers: [HrmLocationsService],
  exports: [HrmLocationsService],
})
export class HrmLocationsModule {}

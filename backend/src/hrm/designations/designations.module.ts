import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../database/database.module';
import { HrmDesignationsController } from './designations.controller';
import { HrmDesignationsService } from './designations.service';

@Module({
  imports: [DatabaseModule],
  controllers: [HrmDesignationsController],
  providers: [HrmDesignationsService],
  exports: [HrmDesignationsService],
})
export class HrmDesignationsModule {}

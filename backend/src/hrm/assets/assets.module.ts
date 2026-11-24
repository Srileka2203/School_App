import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../database/database.module';
import { HrmAssetsController } from './assets.controller';
import { HrmAssetsService } from './assets.service';

@Module({
  imports: [DatabaseModule],
  controllers: [HrmAssetsController],
  providers: [HrmAssetsService],
  exports: [HrmAssetsService],
})
export class HrmAssetsModule {}

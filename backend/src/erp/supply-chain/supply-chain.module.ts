import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../database/database.module';
import { SupplyChainController } from './supply-chain.controller';
import { SupplyChainService } from './supply-chain.service';

@Module({
  imports: [DatabaseModule],
  controllers: [SupplyChainController],
  providers: [SupplyChainService],
  exports: [SupplyChainService],
})
export class SupplyChainModule {}

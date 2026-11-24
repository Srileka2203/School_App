import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../database/database.module';
import { HrmOnboardingController } from './onboarding.controller';
import { HrmOnboardingService } from './onboarding.service';

@Module({
  imports: [DatabaseModule],
  controllers: [HrmOnboardingController],
  providers: [HrmOnboardingService],
  exports: [HrmOnboardingService],
})
export class HrmOnboardingModule {}

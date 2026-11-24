import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiBody } from '@nestjs/swagger';
import { HrmPerformanceService } from './performance.service';
import { JwtAuthGuard } from '../../platform/auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';

@ApiTags('HRM - Performance Reviews')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('hrm/performance')
export class HrmPerformanceController {
  constructor(private readonly service: HrmPerformanceService) {}

  @Get('reviews')
  @ApiOperation({ summary: 'List all employee appraisal reviews' })
  async getReviews() {
    return this.service.getReviews();
  }

  @Get('reviews/:id')
  @ApiOperation({ summary: 'Get performance appraisal details' })
  @ApiParam({ name: 'id', description: 'Review ID' })
  async getReview(@Param('id') id: string) {
    return this.service.getReview(id);
  }

  @Post('reviews')
  @ApiOperation({ summary: 'Submit a new performance review evaluation' })
  async createReview(@Body() body: any) {
    return this.service.createReview(body);
  }
}

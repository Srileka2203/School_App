import { Controller, Get, Post, Patch, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery, ApiParam, ApiBody } from '@nestjs/swagger';
import { HrmRecruitmentService } from './recruitment.service';
import { JwtAuthGuard } from '../../platform/auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';

@ApiTags('HRM - Recruitment & ATS')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('hrm/recruitment')
export class HrmRecruitmentController {
  constructor(private readonly service: HrmRecruitmentService) {}

  @Get('jobs')
  @ApiOperation({ summary: 'List open corporate job postings' })
  async getJobs() {
    return this.service.getJobs();
  }

  @Get('candidates')
  @ApiOperation({ summary: 'List applicants across recruitment pipelines' })
  @ApiQuery({ name: 'jobId', required: false })
  @ApiQuery({ name: 'stage', required: false })
  async getCandidates(@Query() query: any) {
    return this.service.getCandidates(query);
  }

  @Post('jobs')
  @ApiOperation({ summary: 'Publish new job requisition' })
  async createJob(@Body() body: any) {
    return this.service.createJob(body);
  }

  @Post('candidates')
  @ApiOperation({ summary: 'Register new applicant into ATS' })
  async createCandidate(@Body() body: any) {
    return this.service.createCandidate(body);
  }

  @Patch('candidates/:id/stage')
  @ApiOperation({ summary: 'Advance candidate recruitment stage' })
  @ApiParam({ name: 'id', description: 'Candidate ID' })
  @ApiBody({ schema: { type: 'object', properties: { stage: { type: 'string', example: 'OFFER_EXTENDED' } } } })
  async updateStage(@Param('id') id: string, @Body('stage') stage: string) {
    return this.service.updateCandidateStage(id, stage);
  }
}

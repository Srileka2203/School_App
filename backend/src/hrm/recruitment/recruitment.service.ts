import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class HrmRecruitmentService {
  constructor(private readonly prisma: PrismaService) {}

  private jobs = [
    { id: 'job-01', title: 'Senior Cloud Infrastructure Engineer', department: 'Engineering', openings: 2, applicantsCount: 34, location: 'Austin HQ / Remote', status: 'OPEN', postedAt: '2026-11-01' },
    { id: 'job-02', title: 'Enterprise Account Executive', department: 'Sales', openings: 3, applicantsCount: 48, location: 'London Office', status: 'OPEN', postedAt: '2026-11-05' },
    { id: 'job-03', title: 'Corporate Recruiter', department: 'Human Resources', openings: 1, applicantsCount: 22, location: 'Austin HQ', status: 'INTERVIEWING', postedAt: '2026-10-25' },
  ];

  private candidates = [
    { id: 'cand-01', jobId: 'job-01', fullName: 'Jonathan Pierce', email: 'jonathan.p@email.com', phone: '+1-555-8821', currentStage: 'TECHNICAL_INTERVIEW', rating: 4.5, resumeUrl: 'https://resumes.example.com/jpierce.pdf' },
    { id: 'cand-02', jobId: 'job-02', fullName: 'Clara Oswald', email: 'clara.o@email.com', phone: '+44-20-7946-0192', currentStage: 'OFFER_EXTENDED', rating: 4.8, resumeUrl: 'https://resumes.example.com/coswald.pdf' },
  ];

  async getJobs() {
    return { data: this.jobs, meta: { total: this.jobs.length } };
  }

  async getCandidates(query?: any) {
    let result = [...this.candidates];
    if (query?.jobId) result = result.filter((c) => c.jobId === query.jobId);
    if (query?.stage) result = result.filter((c) => c.currentStage === query.stage);
    return { data: result, meta: { total: result.length } };
  }

  async createJob(data: any) {
    const job = { id: `job-${Date.now()}`, applicantsCount: 0, status: 'OPEN', postedAt: new Date().toISOString(), ...data };
    this.jobs.unshift(job);
    return job;
  }

  async createCandidate(data: any) {
    const cand = { id: `cand-${Date.now()}`, currentStage: 'APPLIED', rating: 0, ...data };
    this.candidates.unshift(cand);
    return cand;
  }

  async updateCandidateStage(id: string, stage: string) {
    const cand = this.candidates.find((c) => c.id === id);
    if (!cand) throw new NotFoundException('Candidate not found');
    cand.currentStage = stage;
    return cand;
  }
}

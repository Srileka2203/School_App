import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class HrmRecruitmentService {
  constructor(private readonly prisma: PrismaService) {}

  private jobs: any[] = [
    { id: 'job-01', title: 'Senior Cloud Infrastructure Engineer', department: 'Engineering', openings: 2, applicantsCount: 34, location: 'Austin HQ / Remote', status: 'OPEN', postedAt: '2026-11-01' },
    { id: 'job-02', title: 'Enterprise Account Executive', department: 'Sales', openings: 3, applicantsCount: 48, location: 'London Office', status: 'OPEN', postedAt: '2026-11-05' },
    { id: 'job-03', title: 'Corporate Recruiter', department: 'Human Resources', openings: 1, applicantsCount: 22, location: 'Austin HQ', status: 'INTERVIEWING', postedAt: '2026-10-25' },
  ];

  private candidates = [
    { id: 'cand-01', jobId: 'job-01', fullName: 'Jonathan Pierce', email: 'jonathan.p@email.com', phone: '+1-555-8821', currentStage: 'TECHNICAL_INTERVIEW', rating: 4.5, resumeUrl: 'https://resumes.example.com/jpierce.pdf' },
    { id: 'cand-02', jobId: 'job-02', fullName: 'Clara Oswald', email: 'clara.o@email.com', phone: '+44-20-7946-0192', currentStage: 'OFFER_EXTENDED', rating: 4.8, resumeUrl: 'https://resumes.example.com/coswald.pdf' },
  ];

  async getJobs() {
    try {
      const dbJobs = await this.prisma.hrmJobPosting.findMany({
        include: { department: true },
        orderBy: { createdAt: 'desc' },
      });
      if (dbJobs && dbJobs.length > 0) {
        const result = dbJobs.map((j) => ({
          ...j,
          title: j.jobTitle,
          department: j.department?.name || null,
          openings: j.openingsCount,
          postedAt: j.createdAt.toISOString().split('T')[0],
          applicantsCount: 0,
        }));
        return { data: result, meta: { total: result.length } };
      }
    } catch (err) {}

    return { data: this.jobs, meta: { total: this.jobs.length } };
  }

  async getCandidates(query?: any) {
    let result = [...this.candidates];
    if (query?.jobId) result = result.filter((c) => c.jobId === query.jobId);
    if (query?.stage) result = result.filter((c) => c.currentStage === query.stage);
    return { data: result, meta: { total: result.length } };
  }

  async createJob(data: any) {
    const jobTitle = data.title || data.jobTitle || 'New Opening';
    const openingsCount = data.openings ? parseInt(data.openings, 10) : 1;
    const employmentType = data.employmentType || 'Full-time';
    const description = data.description || null;
    const status = data.status || 'OPEN';

    let departmentId: string | null = null;
    try {
      if (data.departmentId) {
        const d = await this.prisma.hrmDepartment.findUnique({ where: { id: data.departmentId } });
        if (d) departmentId = d.id;
      } else if (data.department) {
        const d = await this.prisma.hrmDepartment.findFirst({
          where: { OR: [{ name: data.department }, { code: data.department }] },
        });
        if (d) departmentId = d.id;
      }
    } catch {}

    try {
      const created = await this.prisma.hrmJobPosting.create({
        data: {
          jobTitle,
          departmentId,
          openingsCount,
          employmentType,
          description,
          status,
        },
        include: { department: true },
      });
      const formatted = {
        ...created,
        title: created.jobTitle,
        department: created.department?.name || null,
        openings: created.openingsCount,
        postedAt: created.createdAt.toISOString().split('T')[0],
        applicantsCount: 0,
      };
      this.jobs.unshift(formatted);
      return formatted;
    } catch (err) {
      const job = { id: `job-${Date.now()}`, applicantsCount: 0, status: 'OPEN', postedAt: new Date().toISOString(), ...data };
      this.jobs.unshift(job);
      return job;
    }
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

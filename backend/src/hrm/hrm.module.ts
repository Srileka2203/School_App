import { Module } from '@nestjs/common';
import { HrmDashboardModule } from './dashboard/dashboard.module';
import { HrmEmployeesModule } from './employees/employees.module';
import { HrmDepartmentsModule } from './departments/departments.module';
import { HrmDesignationsModule } from './designations/designations.module';
import { HrmLocationsModule } from './locations/locations.module';
import { HrmJobGradesModule } from './job-grades/job-grades.module';
import { HrmEmploymentTypesModule } from './employment-types/employment-types.module';
import { HrmEmployeeDocumentsModule } from './employee-documents/employee-documents.module';
import { HrmEmployeeEducationModule } from './employee-education/employee-education.module';
import { HrmEmployeeExperienceModule } from './employee-experience/employee-experience.module';
import { HrmEmployeeSkillsModule } from './employee-skills/employee-skills.module';
import { HrmEmployeeCertificationsModule } from './employee-certifications/employee-certifications.module';
import { HrmEmployeeHistoryModule } from './employee-history/employee-history.module';
import { HrmReportingModule } from './reporting/reporting.module';
import { HrmAttendanceModule } from './attendance/attendance.module';
import { HrmLeaveManagementModule } from './leave-management/leave-management.module';
import { HrmShiftsModule } from './shifts/shifts.module';
import { HrmPayrollModule } from './payroll/payroll.module';
import { HrmRecruitmentModule } from './recruitment/recruitment.module';
import { HrmOnboardingModule } from './onboarding/onboarding.module';
import { HrmPerformanceModule } from './performance/performance.module';
import { HrmExpensesModule } from './expenses/expenses.module';
import { HrmAssetsModule } from './assets/assets.module';
import { HrmTrainingModule } from './training/training.module';
import { HrmHelpdeskModule } from './helpdesk/helpdesk.module';
import { HrmReportsModule } from './reports/reports.module';

@Module({
  imports: [
    HrmDashboardModule,
    HrmEmployeesModule,
    HrmDepartmentsModule,
    HrmDesignationsModule,
    HrmLocationsModule,
    HrmJobGradesModule,
    HrmEmploymentTypesModule,
    HrmEmployeeDocumentsModule,
    HrmEmployeeEducationModule,
    HrmEmployeeExperienceModule,
    HrmEmployeeSkillsModule,
    HrmEmployeeCertificationsModule,
    HrmEmployeeHistoryModule,
    HrmReportingModule,
    HrmAttendanceModule,
    HrmLeaveManagementModule,
    HrmShiftsModule,
    HrmPayrollModule,
    HrmRecruitmentModule,
    HrmOnboardingModule,
    HrmPerformanceModule,
    HrmExpensesModule,
    HrmAssetsModule,
    HrmTrainingModule,
    HrmHelpdeskModule,
    HrmReportsModule,
  ],
  exports: [
    HrmDashboardModule,
    HrmEmployeesModule,
    HrmDepartmentsModule,
    HrmDesignationsModule,
    HrmLocationsModule,
    HrmJobGradesModule,
    HrmEmploymentTypesModule,
    HrmEmployeeDocumentsModule,
    HrmEmployeeEducationModule,
    HrmEmployeeExperienceModule,
    HrmEmployeeSkillsModule,
    HrmEmployeeCertificationsModule,
    HrmEmployeeHistoryModule,
    HrmReportingModule,
    HrmAttendanceModule,
    HrmLeaveManagementModule,
    HrmShiftsModule,
    HrmPayrollModule,
    HrmRecruitmentModule,
    HrmOnboardingModule,
    HrmPerformanceModule,
    HrmExpensesModule,
    HrmAssetsModule,
    HrmTrainingModule,
    HrmHelpdeskModule,
    HrmReportsModule,
  ],
})
export class HrmModule {}

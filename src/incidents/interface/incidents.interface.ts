import { IncidentStatus, IncidentType } from "../entity/incident.entity";

export interface ReportMetrics {
  totalReports: number;
  reportsByWeek: { week: Date; count: number }[];
  reportsByMonth: { month: Date; count: number }[];
  reportsByStatus: { status: IncidentStatus; count: number }[];
  reportsByType: { type: IncidentType; count: number }[];
}
export type ProjectStatus = 'on_track' | 'at_risk' | 'delayed';
export type AlertSeverity = 'critical' | 'warning' | 'info';
export type AlertStatus = 'open' | 'acknowledged' | 'resolved';

export interface Project {
  id: string;
  name: string;
  location: string;
  progress: number;
  status: ProjectStatus;
  budget: number;
  updatedAt: string;
}

export interface Alert {
  id: string;
  projectId: string;
  projectName: string;
  severity: AlertSeverity;
  title: string;
  description: string;
  status: AlertStatus;
  createdAt: string;
}

export interface Stats {
  totalProjects: number;
  totalAlerts: number;
  openAlerts: number;
  criticalAlerts: number;
  projectsAtRisk: number;
  avgProgress: number;
}

export interface AlertsPage {
  items: Alert[];
  nextCursor: string | null;
  total: number;
}

export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface AlertFilters {
  severity?: AlertSeverity | 'all';
  status?: AlertStatus | 'all';
  q?: string;
}

export interface CreateAlertInput {
  projectId: string;
  projectName: string;
  severity: AlertSeverity;
  title: string;
  description: string;
}

export type ProjectStatusFilter = ProjectStatus | 'all';

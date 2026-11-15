import type {
  Alert,
  AlertFilters,
  AlertsPage,
  CreateAlertInput,
  Paginated,
  Project,
  ProjectStatus,
  Stats,
} from '../types/domain';
import { getDb, nextId, persist } from './db';
import { isFaultMode } from './fault';

const READ_DELAY = [280, 640] as const;
const WRITE_DELAY = [420, 900] as const;

/** Error de la capa de servicios con estado HTTP y campo opcional. */
export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly field?: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

function wait(min: number, max: number): Promise<void> {
  const ms = min + Math.random() * (max - min);
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function simulateRead(): Promise<void> {
  await wait(READ_DELAY[0], READ_DELAY[1]);
}

async function simulateWrite(): Promise<void> {
  await wait(WRITE_DELAY[0], WRITE_DELAY[1]);
  if (isFaultMode()) {
    throw new ApiError(
      'No se pudo completar la operación (modo de prueba). Vuelve a intentarlo.',
      503,
    );
  }
}

export interface FetchAlertsParams extends AlertFilters {
  cursor?: string | null;
  limit?: number;
}

export async function fetchAlerts({
  cursor = null,
  limit = 6,
  severity = 'all',
  status = 'all',
  q = '',
}: FetchAlertsParams): Promise<AlertsPage> {
  await simulateRead();
  const db = getDb();
  const term = q.trim().toLowerCase();

  const filtered = db.alerts
    .filter((alert) => (severity === 'all' ? true : alert.severity === severity))
    .filter((alert) => (status === 'all' ? true : alert.status === status))
    .filter((alert) =>
      term
        ? `${alert.title} ${alert.description} ${alert.projectName}`
            .toLowerCase()
            .includes(term)
        : true,
    )
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const offset = cursor ? Number(cursor) : 0;
  const page = filtered.slice(offset, offset + limit);
  const nextOffset = offset + page.length;

  return {
    items: page,
    nextCursor: nextOffset < filtered.length ? String(nextOffset) : null,
    total: filtered.length,
  };
}

export async function createAlert(input: CreateAlertInput): Promise<Alert> {
  await simulateWrite();
  if (input.title.toLowerCase().includes('bloqueo')) {
    throw new ApiError(
      'Ese título está restringido por el servidor. Usa un título más descriptivo.',
      422,
      'title',
    );
  }

  const db = getDb();
  const project = db.projects.find((item) => item.id === input.projectId);
  const alert: Alert = {
    id: nextId('AL'),
    projectId: input.projectId,
    projectName: project?.name ?? input.projectName,
    severity: input.severity,
    title: input.title.trim(),
    description: input.description.trim(),
    status: 'open',
    createdAt: new Date().toISOString(),
  };

  db.alerts.unshift(alert);
  persist(db);
  return alert;
}

export async function acknowledgeAlert(id: string): Promise<Alert> {
  await simulateWrite();
  const db = getDb();
  const alert = db.alerts.find((item) => item.id === id);
  if (!alert) throw new ApiError('La alerta ya no existe.', 404);
  alert.status = 'acknowledged';
  persist(db);
  return { ...alert };
}

export async function deleteAlert(id: string): Promise<{ id: string }> {
  await simulateWrite();
  const db = getDb();
  const index = db.alerts.findIndex((item) => item.id === id);
  if (index === -1) throw new ApiError('La alerta ya no existe.', 404);
  db.alerts.splice(index, 1);
  persist(db);
  return { id };
}

export async function fetchProjects({
  page = 1,
  pageSize = 6,
}: { page?: number; pageSize?: number } = {}): Promise<Paginated<Project>> {
  await simulateRead();
  const db = getDb();
  const total = db.projects.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(Math.max(1, page), totalPages);
  const start = (safePage - 1) * pageSize;
  const items = [...db.projects]
    .sort((a, b) => a.name.localeCompare(b.name, 'es'))
    .slice(start, start + pageSize);

  return { items, total, page: safePage, pageSize, totalPages };
}

export async function updateProjectStatus(
  id: string,
  status: ProjectStatus,
): Promise<Project> {
  await simulateWrite();
  const db = getDb();
  const project = db.projects.find((item) => item.id === id);
  if (!project) throw new ApiError('El proyecto ya no existe.', 404);
  project.status = status;
  project.updatedAt = new Date().toISOString();
  persist(db);
  return { ...project };
}

export async function fetchStats(): Promise<Stats> {
  await simulateRead();
  const db = getDb();
  const totalProjects = db.projects.length;
  const totalAlerts = db.alerts.length;
  const openAlerts = db.alerts.filter((alert) => alert.status === 'open').length;
  const criticalAlerts = db.alerts.filter(
    (alert) => alert.severity === 'critical' && alert.status !== 'resolved',
  ).length;
  const projectsAtRisk = db.projects.filter((project) => project.status !== 'on_track').length;
  const avgProgress = totalProjects
    ? Math.round(db.projects.reduce((sum, project) => sum + project.progress, 0) / totalProjects)
    : 0;

  return { totalProjects, totalAlerts, openAlerts, criticalAlerts, projectsAtRisk, avgProgress };
}

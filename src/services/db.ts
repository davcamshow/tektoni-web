import type {
  Alert,
  AlertSeverity,
  AlertStatus,
  Project,
  ProjectStatus,
} from '../types/domain';

const DB_KEY = 'tektoni-web.db.v3';

interface DbShape {
  projects: Project[];
  alerts: Alert[];
  seq: number;
}

let memory: DbShape | null = null;

function isoDaysAgo(days: number, extraHours = 0): string {
  const date = new Date();
  date.setDate(date.getDate() - days);
  date.setHours(date.getHours() - extraHours);
  return date.toISOString();
}

const PROJECT_SEED: Array<Omit<Project, 'updatedAt'>> = [
  { id: 'P-001', name: 'Torre Residencial Norte', location: 'Morelia, Mich.', progress: 62, status: 'on_track', budget: 48_500_000 },
  { id: 'P-002', name: 'Hospital Regional Poniente', location: 'Uruapan, Mich.', progress: 41, status: 'at_risk', budget: 120_000_000 },
  { id: 'P-003', name: 'Centro Comercial Altavía', location: 'Morelia, Mich.', progress: 78, status: 'on_track', budget: 95_000_000 },
  { id: 'P-004', name: 'Puente Vehicular Bicentenario', location: 'Pátzcuaro, Mich.', progress: 33, status: 'delayed', budget: 62_000_000 },
  { id: 'P-005', name: 'Escuela Primaria Benito Juárez', location: 'Zitácuaro, Mich.', progress: 88, status: 'on_track', budget: 18_000_000 },
  { id: 'P-006', name: 'Unidad Deportiva La Huerta', location: 'Morelia, Mich.', progress: 55, status: 'at_risk', budget: 34_000_000 },
  { id: 'P-007', name: 'Fraccionamiento Los Encinos', location: 'Pátzcuaro, Mich.', progress: 24, status: 'delayed', budget: 76_000_000 },
  { id: 'P-008', name: 'Mercado Municipal de Abastos', location: 'Uruapan, Mich.', progress: 69, status: 'on_track', budget: 52_000_000 },
  { id: 'P-009', name: 'Colector Pluvial Sur', location: 'Morelia, Mich.', progress: 47, status: 'at_risk', budget: 41_000_000 },
  { id: 'P-010', name: 'Rehabilitación Av. Madero', location: 'Morelia, Mich.', progress: 92, status: 'on_track', budget: 28_000_000 },
  { id: 'P-011', name: 'Secundaria Técnica No. 5', location: 'Zitácuaro, Mich.', progress: 58, status: 'on_track', budget: 22_000_000 },
  { id: 'P-012', name: 'Planta de Tratamiento de Agua', location: 'Pátzcuaro, Mich.', progress: 12, status: 'delayed', budget: 88_000_000 },
];

const ALERT_TEMPLATES: Array<{
  title: string;
  description: string;
  severity: AlertSeverity;
}> = [
  {
    title: 'Fisura en muro de contención',
    description: 'Se detectó una fisura de 4 mm en el muro sur del nivel 3. Requiere revisión estructural antes de continuar.',
    severity: 'critical',
  },
  {
    title: 'Desfase en el presupuesto de obra',
    description: 'El gasto acumulado supera en 8 % lo programado para esta etapa del ejercicio.',
    severity: 'warning',
  },
  {
    title: 'Retraso en suministro de acero',
    description: 'El proveedor notificó un retraso de 5 días en la entrega de varilla del grado 60.',
    severity: 'warning',
  },
  {
    title: 'EPP incompleto en cuadrilla',
    description: 'La cuadrilla del frente 2 no cuenta con arnés certificado para trabajo en altura.',
    severity: 'critical',
  },
  {
    title: 'Colado fuera de norma',
    description: 'La muestra de concreto del eje C presentó resistencia menor a la especificada a los 7 días.',
    severity: 'critical',
  },
  {
    title: 'Humedad detectada en losa',
    description: 'Aparecieron manchas de humedad en la losa del segundo nivel tras las lluvias.',
    severity: 'warning',
  },
  {
    title: 'Avance mayor al programado',
    description: 'La partida de albañilería registra un avance 6 % por encima de lo planeado.',
    severity: 'info',
  },
  {
    title: 'Falta de señalización de seguridad',
    description: 'No se localizaron señalamientos de ruta de evacuación en el acceso provisional.',
    severity: 'warning',
  },
  {
    title: 'Retraso por condiciones climáticas',
    description: 'Las lluvias de la semana detuvieron los trabajos de terracería durante dos jornadas.',
    severity: 'info',
  },
  {
    title: 'Verificación de instalación eléctrica',
    description: 'La instalación eléctrica del núcleo B requiere prueba de continuidad documentada.',
    severity: 'warning',
  },
  {
    title: 'Extracción de material no autorizada',
    description: 'Se detectó salida de material pétreo sin remisión firmada en el acceso norte.',
    severity: 'critical',
  },
  {
    title: 'Actualización de planos pendiente',
    description: 'La última revisión de planos arquitectónicos no se cargó a la plataforma.',
    severity: 'info',
  },
];

function buildSeed(): DbShape {
  const projects: Project[] = PROJECT_SEED.map((project, index) => ({
    ...project,
    updatedAt: isoDaysAgo(index * 0.4, index % 6),
  }));

  const alerts: Alert[] = Array.from({ length: 24 }).map((_, index) => {
    const template = ALERT_TEMPLATES[index % ALERT_TEMPLATES.length];
    const project = projects[index % projects.length];
    const status: AlertStatus =
      index % 6 === 0 ? 'resolved' : index % 3 === 0 ? 'acknowledged' : 'open';
    return {
      id: `AL-${String(index + 1).padStart(4, '0')}`,
      projectId: project.id,
      projectName: project.name,
      severity: template.severity,
      title: template.title,
      description: template.description,
      status,
      createdAt: isoDaysAgo(index * 0.5, index % 9),
    };
  });

  return { projects, alerts, seq: 1000 };
}

function readFromStorage(): DbShape | null {
  try {
    const raw = localStorage.getItem(DB_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as DbShape;
    if (!parsed.projects || !parsed.alerts) return null;
    return parsed;
  } catch {
    return null;
  }
}

function writeToStorage(db: DbShape): void {
  try {
    localStorage.setItem(DB_KEY, JSON.stringify(db));
  } catch {
    /* almacenamiento no disponible: se mantiene solo en memoria */
  }
}

export function getDb(): DbShape {
  if (!memory) {
    memory = readFromStorage() ?? buildSeed();
    writeToStorage(memory);
  }
  return memory;
}

export function persist(db: DbShape): void {
  memory = db;
  writeToStorage(db);
}

export function nextId(prefix: string): string {
  const db = getDb();
  db.seq += 1;
  persist(db);
  return `${prefix}-${db.seq}`;
}

export function resetDb(): void {
  memory = buildSeed();
  writeToStorage(memory);
}

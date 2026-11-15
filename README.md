# Tektoni · Frontend (React + Design System + PWA)

Frontend web de **Tektoni**, una plataforma de control de avance de obra. Es un proyecto
**React + TypeScript** que consume la biblioteca de componentes **`tektoni-ui`** instalada
desde npm (Design System propio) y aplica TanStack Query, React Hook Form + Zod, Motion,
accesibilidad y PWA.

## Stack

- **React 19** + **TypeScript** + **Vite 6**
- **TanStack Query 5** (consultas, paginación y mutaciones optimistas)
- **React Hook Form 7** + **Zod 3** (`@hookform/resolvers`)
- **Motion** (framer-motion)
- **React Router 6**
- **vite-plugin-pwa** (Workbox)
- **`tektoni-ui@1.0.0`** — componentes y tokens del Design System

## Características

- Panel con indicadores y feed de alertas de obra.
- **Paginación** por cursor (`useInfiniteQuery`) y por página (`useQuery`).
- **Mutaciones optimistas** (crear, reconocer y eliminar) con snapshot, rollback e invalidación.
- Formulario accesible con RHF + Zod (`Controller` y `register`, `setError` para errores del servidor).
- Estados de carga, vacío, error+reintento, éxito y pending.
- **PWA** instalable, con service worker y funcionamiento sin conexión.
- Accesibilidad: semántica, teclado, foco visible, `aria-live` y diálogos con atrapado de foco.
- Modo de prueba para forzar fallos de red y demostrar el **rollback**.

## Requisitos

- Node.js 20+ (probado con Node 24)
- npm

## Instalación y ejecución

```bash
npm install
npm run dev       # desarrollo → http://127.0.0.1:5199
npm run build     # typecheck + build de producción
npm run preview   # sirve dist/ → http://127.0.0.1:4199
```

## Scripts

| Script | Descripción |
|---|---|
| `npm run dev` | Servidor de desarrollo (Vite). |
| `npm run build` | Verifica tipos y genera la build + PWA. |
| `npm run preview` | Sirve la build de producción. |
| `npm run typecheck` | `tsc --noEmit`. |
| `npm run icons` | Regenera los iconos PNG de la PWA. |

## Estructura

```text
src/
├── components/
│   ├── layout/      AppShell, Sidebar, SkipLink, OfflineBanner
│   ├── ui/          Dialog, StateView, ProgressMeter, FieldError, Select
│   ├── alerts/      AlertCard, AlertFeed, FilterBar, CreateAlertForm, diálogos
│   ├── projects/    ProjectRow, ProjectsTable, Pagination
│   ├── dashboard/   DashboardStats, KpiCard
│   └── a11y/        LiveAnnouncer
├── pages/           DashboardPage, ProjectsPage, SettingsPage, NotFoundPage
├── hooks/           use-alerts, use-projects, use-stats, use-alert-filters, use-online-status
├── services/        api.ts (mock con latencia/fallos), db.ts, fault.ts
├── schemas/         alert.ts (Zod)
├── config/          query-client.ts
├── lib/             query-keys.ts, format.ts, a11y.ts
├── providers/       AppProviders, QueryDevtools
├── types/           domain.ts
├── App.tsx
├── main.tsx
└── index.css
```

## Design System

Los estilos consumen las variables CSS que expone `tektoni-ui` (`--color-*`, `--font-*`,
`--radius-*`, `--shadow-soft`), manteniendo la identidad visual definida en Figma.
Componentes usados: `Navbar`, `Button`, `Input`, `Select`, `SearchBar`, `Tabs`, `Switch`,
`Alert`, `Toast`, `Spinner` e `Icon`.

## Reporte

El reporte del proyecto (portada, índice y capturas) está en:

- `report/Reporte-Tektoni.pdf`

## Licencia

Uso académico — Instituto Tecnológico de Morelia.

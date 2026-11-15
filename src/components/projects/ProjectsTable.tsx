import { memo } from 'react';

import type { Project, ProjectStatus } from '../../types/domain';
import { ProjectRow } from './ProjectRow';

interface ProjectsTableProps {
  projects: Project[];
  onStatusChange: (id: string, status: ProjectStatus) => void;
  pendingId?: string;
}

export const ProjectsTable = memo(function ProjectsTable({
  projects,
  onStatusChange,
  pendingId,
}: ProjectsTableProps) {
  return (
    <div className="table-wrap">
      <table className="table">
        <caption className="tk-visually-hidden">
          Proyectos de obra con su avance, estado y última actualización
        </caption>
        <thead>
          <tr>
            <th scope="col">Proyecto</th>
            <th scope="col">Avance</th>
            <th scope="col">Estado</th>
            <th scope="col">Actualizado</th>
          </tr>
        </thead>
        <tbody>
          {projects.map((project) => (
            <ProjectRow
              key={project.id}
              project={project}
              onStatusChange={onStatusChange}
              pending={pendingId === project.id}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
});

import { memo } from 'react';
import { Spinner } from 'tektoni-ui';

import { formatRelative } from '../../lib/format';
import type { Project, ProjectStatus } from '../../types/domain';
import { ProgressMeter } from '../ui/ProgressMeter';
import { Select } from '../ui/Select';

const STATUS_OPTIONS = [
  { value: 'on_track', label: 'En tiempo' },
  { value: 'at_risk', label: 'En riesgo' },
  { value: 'delayed', label: 'Retrasado' },
];

interface ProjectRowProps {
  project: Project;
  onStatusChange: (id: string, status: ProjectStatus) => void;
  pending: boolean;
}

/** Fila de proyecto memoizada: solo re-renderiza si cambian sus props. */
export const ProjectRow = memo(function ProjectRow({
  project,
  onStatusChange,
  pending,
}: ProjectRowProps) {
  return (
    <tr>
      <th scope="row" className="project-name">
        <span className="project-name__title">{project.name}</span>
        <span className="muted">{project.location}</span>
      </th>
      <td>
        <ProgressMeter value={project.progress} label={`Avance de ${project.name}`} />
      </td>
      <td>
        <div className="status-cell">
          <Select
            aria-label={`Estado de ${project.name}`}
            value={project.status}
            onChange={(value) => onStatusChange(project.id, value as ProjectStatus)}
            options={STATUS_OPTIONS}
            disabled={pending}
          />
          {pending ? <Spinner size="sm" /> : null}
        </div>
      </td>
      <td>
        <time dateTime={project.updatedAt}>{formatRelative(project.updatedAt)}</time>
      </td>
    </tr>
  );
});

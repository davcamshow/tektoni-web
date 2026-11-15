import { Button } from 'tektoni-ui';

interface PaginationProps {
  page: number;
  totalPages: number;
  total: number;
  pageSize: number;
  isFetching: boolean;
  onPrev: () => void;
  onNext: () => void;
}

export function Pagination({
  page,
  totalPages,
  total,
  pageSize,
  isFetching,
  onPrev,
  onNext,
}: PaginationProps) {
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);

  return (
    <nav className="pagination" aria-label="Paginación de proyectos">
      <p className="pagination__status" role="status" aria-live="polite">
        {isFetching
          ? 'Cargando página…'
          : `Página ${page} de ${totalPages} · Mostrando ${from}–${to} de ${total}`}
      </p>
      <div className="pagination__actions">
        <Button
          variant="secondary"
          size="sm"
          fullWidth={false}
          onClick={onPrev}
          disabled={page <= 1 || isFetching}
          aria-label="Página anterior"
        >
          Anterior
        </Button>
        <Button
          variant="secondary"
          size="sm"
          fullWidth={false}
          onClick={onNext}
          disabled={page >= totalPages || isFetching}
          aria-label="Página siguiente"
        >
          Siguiente
        </Button>
      </div>
    </nav>
  );
}

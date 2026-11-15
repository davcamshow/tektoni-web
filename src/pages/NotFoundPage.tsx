import { Link } from 'react-router-dom';
import { Navbar } from 'tektoni-ui';

export function NotFoundPage() {
  return (
    <>
      <Navbar title="Página no encontrada" back={false} />
      <div className="page page--narrow">
        <p className="page__lead">
          La ruta que buscas no existe o se movió. Vuelve al panel para continuar.
        </p>
        <p>
          <Link to="/" className="text-link">
            Volver al panel de control
          </Link>
        </p>
      </div>
    </>
  );
}

import { NavLink } from 'react-router-dom';
import { cn } from 'tektoni-ui';

interface SidebarLink {
  to: string;
  label: string;
  end?: boolean;
}

const LINKS: SidebarLink[] = [
  { to: '/', label: 'Panel', end: true },
  { to: '/proyectos', label: 'Proyectos' },
  { to: '/ajustes', label: 'Ajustes' },
];

export function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="brand">
        <span className="brand__mark" aria-hidden="true">
          T
        </span>
        <span className="brand__name">Tektoni</span>
      </div>

      <nav className="sidebar__nav" aria-label="Navegación principal">
        <ul role="list">
          {LINKS.map((link) => (
            <li key={link.to}>
              <NavLink
                to={link.to}
                end={link.end}
                className={({ isActive }) => cn('nav-link', isActive && 'nav-link--active')}
              >
                {link.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <p className="sidebar__note">
        Design System
        <br />
        tektoni-ui v1.0.0
      </p>
    </aside>
  );
}

import React from 'react';
import { NavLink, Outlet, Link } from 'react-router-dom';

export const AppLayout: React.FC = () => {
  const navItems = [
    { label: 'Inicio', path: '/inicio' },
    { label: 'Carga de Datos', path: '/carga-datos' },
    { label: 'Mapa', path: '/mapa' },
    { label: 'Asistente', path: '/asistente' },
    { label: 'Estadísticas', path: '/estadisticas' },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#F4F6F4]">
      {/* Header institucional */}
      <header className="bg-[#163A2B] text-white px-6 md:px-10 py-4 flex justify-between items-center shadow-sm select-none">
        <Link to="/inicio" className="flex items-center gap-2.5 text-white no-underline">
          <span className="text-lg font-bold font-brand tracking-wide">Senzaccento</span>
          <span className="text-xs bg-white/15 px-2 py-0.5 rounded text-white font-medium">Hera</span>
        </Link>

        <nav className="flex items-center gap-2">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `text-sm font-medium px-4 py-2 rounded-full transition-colors duration-200 no-underline ${
                  isActive
                    ? 'bg-white/20 text-white shadow-xs'
                    : 'text-[#A3C2B5] hover:text-white hover:bg-white/10'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </header>

      {/* Contenido de la página actual */}
      <div className="flex-1 flex flex-col">
        <Outlet />
      </div>
    </div>
  );
};


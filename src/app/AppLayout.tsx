import React, { useState } from 'react';
import { NavLink, Outlet, Link, useNavigate } from 'react-router-dom';
import { LogOut, User as UserIcon, Menu, X } from 'lucide-react';
import Swal from 'sweetalert2';
import { useAuth } from '@/features/auth/AuthContext';

export const AppLayout: React.FC = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { label: 'Inicio', path: '/inicio' },
    { label: 'Carga de Datos', path: '/carga-datos' },
    { label: 'Mapa', path: '/mapa' },
    { label: 'Asistente', path: '/asistente' },
    { label: 'Estadísticas', path: '/estadisticas' },
  ];

  const handleLogout = async () => {
    const result = await Swal.fire({
      icon: 'question',
      title: '¿Cerrar sesión?',
      text: '¿Estás seguro de que deseas salir de tu cuenta?',
      showCancelButton: true,
      confirmButtonText: 'Sí, cerrar sesión',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#163A2B',
      cancelButtonColor: '#666666',
      customClass: { popup: 'rounded-2xl' },
    });

    if (result.isConfirmed) {
      await signOut();
      navigate('/login');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F4F6F4]">
      {/* Header institucional */}
      <header className="bg-[#163A2B] text-white px-4 sm:px-6 md:px-10 py-3.5 flex justify-between items-center shadow-sm select-none sticky top-0 z-40">
        <Link to="/inicio" className="flex items-center gap-2.5 text-white no-underline">
          <span className="text-lg font-bold font-brand tracking-wide">Senzaccento</span>
          <span className="text-xs bg-white/15 px-2 py-0.5 rounded text-white font-medium">Hera</span>
        </Link>

        {/* Navegación Desktop */}
        <nav className="hidden lg:flex items-center gap-1.5">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `text-xs font-semibold px-3.5 py-1.5 rounded-full transition-colors duration-200 no-underline ${
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

        {/* Acciones de usuario y Cerrar Sesión (Desktop) */}
        <div className="hidden lg:flex items-center gap-3">
          {user && (
            <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-white/10 border border-white/15 text-xs text-[#D0E6DC] max-w-[200px] truncate">
              <UserIcon className="w-3.5 h-3.5 shrink-0 text-[#86CEAB]" />
              <span className="truncate">{user.email}</span>
            </div>
          )}

          <button
            type="button"
            onClick={handleLogout}
            title="Cerrar sesión"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold text-white/90 bg-red-950/40 hover:bg-red-900/60 border border-red-500/30 hover:text-white cursor-pointer transition-all"
          >
            <LogOut className="w-3.5 h-3.5 text-red-300" />
            <span>Cerrar sesión</span>
          </button>
        </div>

        {/* Botón menú móvil */}
        <div className="flex lg:hidden items-center gap-2">
          <button
            type="button"
            onClick={handleLogout}
            title="Cerrar sesión"
            className="p-1.5 rounded-lg bg-white/10 text-white/90 hover:text-white hover:bg-white/15 cursor-pointer border-none"
          >
            <LogOut className="w-4 h-4 text-red-300" />
          </button>

          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1.5 rounded-lg bg-white/10 text-white hover:bg-white/15 cursor-pointer border-none"
            aria-label="Abrir menú de navegación"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* Menú desplegable Móvil */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#163A2B] border-t border-white/10 px-4 py-4 space-y-2 animate-in slide-in-from-top-2">
          {user && (
            <div className="px-3 py-2 text-xs text-[#86CEAB] flex items-center gap-2 border-b border-white/10 mb-2">
              <UserIcon className="w-3.5 h-3.5" />
              <span className="truncate">{user.email}</span>
            </div>
          )}

          <div className="space-y-1">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `block text-xs font-semibold px-4 py-2.5 rounded-xl no-underline ${
                    isActive
                      ? 'bg-white/20 text-white'
                      : 'text-[#A3C2B5] hover:text-white hover:bg-white/10'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </div>

          <div className="pt-2 border-t border-white/10">
            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                handleLogout();
              }}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold text-red-200 bg-red-950/40 border border-red-500/30 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Cerrar sesión</span>
            </button>
          </div>
        </div>
      )}

      {/* Contenido de la página actual */}
      <div className="flex-1 flex flex-col">
        <Outlet />
      </div>
    </div>
  );
};

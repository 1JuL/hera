import React, { useState } from 'react';
import { NavLink, Outlet, Link, useNavigate } from 'react-router-dom';
import { LogOut, User as UserIcon, Menu, X, Sun, Moon, Eye } from 'lucide-react';
import Swal from 'sweetalert2';
import { useAuth } from '@/features/auth/AuthContext';
import { useAccessibility } from '@/features/accessibility/AccessibilityContext';
import { AccessibilityModal } from '@/features/accessibility/AccessibilityModal';
import { PwaInstallPrompt, PWA_DISMISS_SESSION_KEY } from '@/features/pwa/PwaInstallPrompt';

export const AppLayout: React.FC = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { settings, toggleTheme } = useAccessibility();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [accessibilityOpen, setAccessibilityOpen] = useState(false);

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
      try {
        sessionStorage.removeItem(PWA_DISMISS_SESSION_KEY);
      } catch {
        // Ignore storage errors
      }
      await signOut();
      navigate('/login');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F4F6F4] pt-[60px] sm:pt-[64px]">
      {/* Header institucional fijo on-top */}
      <header className="bg-[#163A2B] text-white px-4 sm:px-6 md:px-10 h-[60px] sm:h-[64px] flex justify-between items-center shadow-md select-none fixed top-0 inset-x-0 z-50">
        <Link to="/inicio" className="flex items-center gap-3 text-white no-underline group" title="HERA - Inicio">
          <img
            src="/hera-logo-dark.svg"
            alt="HERA"
            className="h-6 sm:h-7 w-auto select-none transition-transform group-hover:scale-105"
          />
          <span className="hidden sm:inline-block text-[11px] font-medium text-white/50 tracking-wider uppercase border-l border-white/20 pl-2.5">
            Senzaccento
          </span>
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

        {/* Acciones de usuario, Accesibilidad, Tema y Cerrar Sesión (Desktop) */}
        <div className="hidden lg:flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => setAccessibilityOpen(true)}
            title="Ajustes de Lectura y Tamaño de Letra"
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-[#86CEAB] cursor-pointer border border-white/15 transition-colors flex items-center justify-center"
            aria-label="Abrir ajustes de lectura y tamaño de letra"
          >
            <Eye className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={toggleTheme}
            title={settings.theme === 'dark' ? 'Cambiar a Modo Claro' : 'Cambiar a Modo Oscuro'}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-[#86CEAB] cursor-pointer border border-white/15 transition-colors flex items-center justify-center"
            aria-label="Cambiar tema claro u oscuro"
          >
            {settings.theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

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
            onClick={() => setAccessibilityOpen(true)}
            title="Ajustes de Lectura y Tamaño de Letra"
            className="p-1.5 rounded-lg bg-white/10 text-[#86CEAB] hover:bg-white/15 cursor-pointer border-none"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={toggleTheme}
            title={settings.theme === 'dark' ? 'Cambiar a Modo Claro' : 'Cambiar a Modo Oscuro'}
            className="p-1.5 rounded-lg bg-white/10 text-[#86CEAB] hover:bg-white/15 cursor-pointer border-none"
          >
            {settings.theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
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

      {/* Menú desplegable Móvil (Siempre visible on-top sobre cualquier scroll) */}
      {mobileMenuOpen && (
        <>
          <div
            onClick={() => setMobileMenuOpen(false)}
            className="lg:hidden fixed inset-0 top-[60px] bg-black/50 backdrop-blur-2xs z-40"
          />
          <div className="lg:hidden fixed top-[60px] inset-x-0 z-50 bg-[#163A2B] border-t border-white/10 px-4 py-4 space-y-2 shadow-2xl max-h-[calc(100vh-60px)] overflow-y-auto animate-in slide-in-from-top-2">
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
                    `block text-sm font-semibold px-4 py-3 rounded-xl no-underline ${
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
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-bold text-red-200 bg-red-950/40 border border-red-500/30 cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>Cerrar sesión</span>
              </button>
            </div>
          </div>
        </>
      )}

      {/* Contenido de la página actual */}
      <div className="flex-1 flex flex-col">
        <Outlet />
      </div>

      {/* Modal de Accesibilidad y Lectura */}
      <AccessibilityModal
        isOpen={accessibilityOpen}
        onClose={() => setAccessibilityOpen(false)}
      />

      {/* Sugerencia compacta de instalación PWA */}
      <PwaInstallPrompt />
    </div>
  );
};

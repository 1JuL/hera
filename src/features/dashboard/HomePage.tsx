import React from 'react';
import { Link } from 'react-router-dom';

export const HomePage: React.FC = () => {
  return (
    <main className="max-w-[1200px] w-full mx-auto px-5 py-8 flex-1">
      <div className="mb-6">
        <span className="text-xs text-[#163A2B] font-bold uppercase tracking-wider block mb-1">
          Panel General
        </span>
        <h1 className="text-3xl md:text-4xl font-bold text-[#1E1E1E] mb-1">
          Hera
        </h1>
        <p className="text-sm text-[#666666]">
          Selecciona un módulo
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Módulo 1: Carga de Datos */}
        <Link
          to="/carga-datos"
          className="bg-white rounded-xl p-6 flex flex-col justify-between min-h-[250px] shadow-sm hover:-translate-y-1 transition-all duration-200 border border-transparent hover:border-[#E0E0E0] no-underline group"
        >
          <p className="text-sm text-[#666666] leading-relaxed">
            Importa y gestiona tus fuentes de datos
          </p>
          <div>
            <h3 className="text-lg font-bold text-[#1E1E1E] mb-2 group-hover:text-[#163A2B] transition-colors">
              Cargar Datos
            </h3>
            <span className="text-xs text-[#163A2B] font-semibold flex items-center gap-1">
              → Ir al módulo
            </span>
          </div>
        </Link>

        {/* Módulo 2: Mapa de Oportunidades (Destacado / Principal) */}
        <Link
          to="/mapa"
          className="bg-[#163A2B] text-white rounded-xl p-6 flex flex-col justify-between min-h-[250px] shadow-md hover:-translate-y-1 transition-all duration-200 no-underline relative overflow-hidden"
        >
          <span className="bg-white/20 text-white text-[10px] font-semibold px-2.5 py-1 rounded-sm w-fit uppercase tracking-wider">
            Principal
          </span>
          <div>
            <p className="text-sm text-[#D0E6DC] leading-relaxed mb-3">
              Visualiza zonas y tecnologías de interés
            </p>
            <h3 className="text-xl font-bold text-white mb-2">
              Mapa de Oportunidades
            </h3>
            <span className="text-xs text-[#86CEAB] font-semibold flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#86CEAB] inline-block animate-pulse"></span>
              Módulo activo
            </span>
          </div>
        </Link>

        {/* Módulo 3: Asistente */}
        <Link
          to="/asistente"
          className="bg-white rounded-xl p-6 flex flex-col justify-between min-h-[250px] shadow-sm hover:-translate-y-1 transition-all duration-200 border border-transparent hover:border-[#E0E0E0] no-underline group"
        >
          <p className="text-sm text-[#666666] leading-relaxed">
            Consultas inteligentes y análisis guiado
          </p>
          <div>
            <h3 className="text-lg font-bold text-[#1E1E1E] mb-2 group-hover:text-[#163A2B] transition-colors">
              Asistente
            </h3>
            <span className="text-xs text-[#163A2B] font-semibold flex items-center gap-1">
              → Ir al módulo
            </span>
          </div>
        </Link>

        {/* Módulo 4: Estadísticas */}
        <Link
          to="/estadisticas"
          className="bg-white rounded-xl p-6 flex flex-col justify-between min-h-[250px] shadow-sm hover:-translate-y-1 transition-all duration-200 border border-transparent hover:border-[#E0E0E0] no-underline group"
        >
          <p className="text-sm text-[#666666] leading-relaxed">
            Métricas, tendencias y reportes analíticos
          </p>
          <div>
            <h3 className="text-lg font-bold text-[#1E1E1E] mb-2 group-hover:text-[#163A2B] transition-colors">
              Estadísticas
            </h3>
            <span className="text-xs text-[#163A2B] font-semibold flex items-center gap-1">
              → Ir al módulo
            </span>
          </div>
        </Link>
      </div>
    </main>
  );
};


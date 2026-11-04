import React, { useState } from 'react';
import { AREAS_DATA } from './data/areas';
import { Area } from './types';
import { AreaCard } from './components/AreaCard';
import { AreaDetailModal } from './components/AreaDetailModal';

export const MapPage: React.FC = () => {
  const [selectedArea, setSelectedArea] = useState<Area | null>(null);

  const areasList = Object.values(AREAS_DATA);

  return (
    <main className="max-w-[1200px] w-full mx-auto px-5 py-8 flex-1">
      {/* Header del Mapa */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-6">
        <div>
          <span className="bg-[#163A2B] text-white text-[11px] font-bold px-3.5 py-1.5 rounded-full inline-block mb-3">
            Hera - Mapa de soluciones
          </span>
          <h1 className="text-2xl md:text-[26px] font-bold text-[#163A2B] mb-1">
            Mapa de Soluciones Tecnológicas
          </h1>
          <p className="text-[13px] text-[#666666]">
            Explora cada área de la empresa y las herramientas que la sostienen.
          </p>
        </div>
        <div className="text-[11px] font-bold text-[#1E1E1E] uppercase tracking-wider bg-white/70 px-3 py-1.5 rounded-md border border-[#E0E0E0]/60">
          6 ÁREAS - 18 SOLUCIONES
        </div>
      </div>

      {/* Grid de 6 Tarjetas Pastel */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {areasList.map((area) => (
          <AreaCard
            key={area.id}
            area={area}
            onSelect={(selected) => setSelectedArea(selected)}
          />
        ))}
      </div>

      {/* Modal interactivo de Detalle (Frames) */}
      <AreaDetailModal
        area={selectedArea}
        onClose={() => setSelectedArea(null)}
      />
    </main>
  );
};


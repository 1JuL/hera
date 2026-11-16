import React from 'react';
import { ArrowRight, AlertCircle } from 'lucide-react';
import { Area } from '../types';
import { getAreaIcon } from '../ui';

interface AreaCardProps {
  area: Area;
  isPriority?: boolean;
  onSelect: (area: Area) => void;
}

export const AreaCard: React.FC<AreaCardProps> = ({
  area,
  isPriority,
  onSelect,
}) => {
  const IconComponent = getAreaIcon(area.iconName);

  return (
    <div
      data-area-card="true"
      onClick={() => onSelect(area)}
      style={{ backgroundColor: area.bgCard }}
      className={`rounded-2xl p-6 cursor-pointer hover:-translate-y-1.5 hover:shadow-lg transition-all duration-200 flex flex-col justify-between min-h-[220px] border relative group ${
        isPriority
          ? 'border-[#163A2B] ring-2 ring-[#86CEAB]/50 shadow-sm'
          : 'border-black/5 hover:border-[#163A2B]/20 shadow-2xs'
      }`}
    >
      <div>
        {/* Badge sutil de prioridad si aplica */}
        {isPriority && (
          <div className="mb-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#163A2B] text-white shadow-2xs">
            <AlertCircle className="w-3.5 h-3.5 text-[#86CEAB]" />
            <span>Prioridad recomendada</span>
          </div>
        )}

        {/* Encabezado: Icono y Nombre del Área */}
        <div className="flex items-center gap-3.5 mb-3.5">
          <div
            style={{ backgroundColor: area.bgIcon, color: area.colorIcon }}
            className="w-13 h-13 rounded-2xl flex items-center justify-center font-medium shrink-0 shadow-2xs group-hover:scale-105 transition-transform"
          >
            <IconComponent className="w-6 h-6" />
          </div>

          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-gray-500 block">
              Área {area.code}
            </span>
            <h3 className="text-xl font-bold text-gray-900 group-hover:text-[#163A2B] transition-colors leading-tight font-brand">
              {area.title}
            </h3>
          </div>
        </div>

        {/* Descripción del área con tamaño legible y buen contraste */}
        <p className="text-sm text-gray-700 leading-relaxed mb-4 line-clamp-3">
          {area.desc}
        </p>
      </div>

      {/* Pie de la tarjeta: cantidad de herramientas y botón para abrir */}
      <div className="pt-4 border-t border-black/5 flex items-center justify-between">
        <span
          style={{ backgroundColor: area.badgeBg, color: area.badgeColor }}
          className="inline-block px-3.5 py-1.5 rounded-full text-xs font-bold shadow-2xs"
        >
          {area.tools.length} herramientas
        </span>

        <span className="text-sm font-bold text-[#163A2B] flex items-center gap-1.5 group-hover:translate-x-1.5 transition-transform">
          <span>Ver detalles</span>
          <ArrowRight className="w-4 h-4" />
        </span>
      </div>
    </div>
  );
};

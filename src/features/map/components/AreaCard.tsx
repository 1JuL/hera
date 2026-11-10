import React from 'react';
import {
  CircleDollarSign,
  Megaphone,
  Receipt,
  Users,
  Boxes,
  MessageSquare,
  Shield,
  Truck,
  Cpu,
  Zap,
  ArrowRight,
  AlertCircle,
} from 'lucide-react';
import { Area } from '../types';

interface AreaCardProps {
  area: Area;
  isPriority?: boolean;
  priorityReason?: string;
  onSelect: (area: Area) => void;
}

const ICON_MAP: Record<string, React.FC<{ className?: string }>> = {
  CircleDollarSign,
  Megaphone,
  Receipt,
  Users,
  Boxes,
  MessageSquare,
  Shield,
  Truck,
  Cpu,
  Zap,
};

export const AreaCard: React.FC<AreaCardProps> = ({
  area,
  isPriority,
  onSelect,
}) => {
  const IconComponent = ICON_MAP[area.iconName] || CircleDollarSign;

  return (
    <div
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
          <div className="mb-3 inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#163A2B] text-white shadow-2xs">
            <AlertCircle className="w-3 h-3 text-[#86CEAB]" />
            <span>Prioridad recomendada</span>
          </div>
        )}

        {/* Encabezado: Icono y Nombre del Área */}
        <div className="flex items-center gap-3.5 mb-3">
          <div
            style={{ backgroundColor: area.bgIcon, color: area.colorIcon }}
            className="w-12 h-12 rounded-2xl flex items-center justify-center font-medium shrink-0 shadow-2xs group-hover:scale-105 transition-transform"
          >
            <IconComponent className="w-6 h-6" />
          </div>

          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500 block">
              Área {area.code}
            </span>
            <h3 className="text-lg font-bold text-gray-900 group-hover:text-[#163A2B] transition-colors leading-tight font-brand">
              {area.title}
            </h3>
          </div>
        </div>

        {/* Únicamente la descripción del área para equilibrio visual */}
        <p className="text-xs text-gray-600 leading-relaxed mb-4 line-clamp-3">
          {area.desc}
        </p>
      </div>

      {/* Pie de la tarjeta: cantidad de herramientas y botón para abrir */}
      <div className="pt-3.5 border-t border-black/5 flex items-center justify-between">
        <span
          style={{ backgroundColor: area.badgeBg, color: area.badgeColor }}
          className="inline-block px-3 py-1 rounded-full text-xs font-bold shadow-2xs"
        >
          {area.tools.length} herramientas
        </span>

        <span className="text-xs font-bold text-[#163A2B] flex items-center gap-1 group-hover:translate-x-1.5 transition-transform">
          <span>Ver detalles</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </span>
      </div>
    </div>
  );
};

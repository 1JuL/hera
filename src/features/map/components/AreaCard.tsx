import React from 'react';
import {
  CircleDollarSign,
  Megaphone,
  Receipt,
  Users,
  Boxes,
  MessageSquare,
  Shield,
  Zap,
  ArrowRight,
  Sparkles,
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
  Zap,
};

export const AreaCard: React.FC<AreaCardProps> = ({
  area,
  isPriority,
  priorityReason,
  onSelect,
}) => {
  const IconComponent = ICON_MAP[area.iconName] || CircleDollarSign;

  const hasAiTools = area.tools.some((t) => t.hasAi);
  const hasOpenSource = area.tools.some((t) => t.pricingType === 'open_source');
  const hasFreeTools = area.tools.some((t) => t.pricingType === 'free');

  return (
    <div
      onClick={() => onSelect(area)}
      style={{ backgroundColor: area.bgCard }}
      className={`rounded-2xl p-6 cursor-pointer hover:-translate-y-1.5 hover:shadow-lg transition-all duration-200 flex flex-col justify-between min-h-[260px] border relative group ${
        isPriority
          ? 'border-[#163A2B] ring-2 ring-[#86CEAB]/50 shadow-md'
          : 'border-black/5 hover:border-[#163A2B]/20'
      }`}
    >
      <div>
        {/* Badge de prioridad diagnóstica si aplica */}
        {isPriority && (
          <div className="mb-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-[#163A2B] text-white shadow-xs">
            <AlertCircle className="w-3.5 h-3.5 text-[#86CEAB]" />
            <span>Área prioritaria recomendada</span>
          </div>
        )}

        {/* Encabezado con Icono y Título */}
        <div className="flex items-start gap-3.5 mb-3">
          <div
            style={{ backgroundColor: area.bgIcon, color: area.colorIcon }}
            className="w-12 h-12 rounded-xl flex items-center justify-center font-medium shrink-0 shadow-2xs group-hover:scale-105 transition-transform"
          >
            <IconComponent className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500 block">
              Área {area.code}
            </span>
            <h3 className="text-lg font-bold text-gray-900 group-hover:text-[#163A2B] transition-colors leading-tight">
              {area.title}
            </h3>
          </div>
        </div>

        {/* Descripción amigable */}
        <p className="text-xs text-gray-600 leading-relaxed mb-4">
          {area.desc}
        </p>

        {priorityReason && isPriority && (
          <div className="mb-3 p-2 rounded-lg bg-emerald-50/80 border border-emerald-200 text-[11px] text-[#163A2B]">
            <strong>Brecha detectada:</strong> {priorityReason}
          </div>
        )}

        {/* Badges de características */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {hasAiTools && (
            <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-amber-100/80 text-amber-900 border border-amber-200/60 px-2 py-0.5 rounded-md">
              <Sparkles className="w-2.5 h-2.5 text-amber-600" />
              IA Integrada
            </span>
          )}
          {hasOpenSource && (
            <span className="text-[10px] font-bold bg-purple-100/80 text-purple-900 border border-purple-200/60 px-2 py-0.5 rounded-md">
              Open Source
            </span>
          )}
          {hasFreeTools && (
            <span className="text-[10px] font-bold bg-emerald-100/80 text-emerald-900 border border-emerald-200/60 px-2 py-0.5 rounded-md">
              100% Gratis
            </span>
          )}
        </div>
      </div>

      {/* Footer de la tarjeta */}
      <div className="pt-3 border-t border-black/5 flex items-center justify-between">
        <span
          style={{ backgroundColor: area.badgeBg, color: area.badgeColor }}
          className="inline-block px-3 py-1 rounded-full text-xs font-bold shadow-2xs"
        >
          {area.tools.length} Herramientas TIC
        </span>

        <span className="text-xs font-bold text-[#163A2B] flex items-center gap-1 group-hover:translate-x-1 transition-transform">
          <span>Explorar área</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </span>
      </div>
    </div>
  );
};

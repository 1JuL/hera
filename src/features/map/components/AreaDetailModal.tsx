import React, { useState, useEffect } from 'react';
import {
  X,
  CircleDollarSign,
  Megaphone,
  Receipt,
  Users,
  Boxes,
  MessageSquare,
  Shield,
  Zap,
  Sparkles,
  ExternalLink,
  Lightbulb,
  CheckCircle2,
  Tag,
  ArrowRight,
  Filter,
} from 'lucide-react';
import { Area, TicTool } from '../types';

interface AreaDetailModalProps {
  area: Area | null;
  onClose: () => void;
  onSelectTool: (tool: TicTool) => void;
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

export const AreaDetailModal: React.FC<AreaDetailModalProps> = ({
  area,
  onClose,
  onSelectTool,
}) => {
  const [filterType, setFilterType] = useState<string>('all');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (area) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [area, onClose]);

  if (!area) return null;

  const IconComponent = ICON_MAP[area.iconName] || CircleDollarSign;

  const filteredTools = area.tools.filter((tool) => {
    if (filterType === 'all') return true;
    if (filterType === 'ai') return tool.hasAi;
    if (filterType === 'open_source') return tool.pricingType === 'open_source';
    if (filterType === 'free') return tool.pricingType === 'free' || tool.pricingType === 'freemium';
    if (filterType === 'paid') return tool.pricingType === 'paid_low_cost';
    return true;
  });

  const getPricingBadge = (pricingType: string) => {
    switch (pricingType) {
      case 'open_source':
        return 'bg-purple-100 text-purple-900 border-purple-200';
      case 'free':
        return 'bg-emerald-100 text-emerald-900 border-emerald-200';
      case 'freemium':
        return 'bg-blue-100 text-blue-900 border-blue-200';
      case 'paid_low_cost':
        return 'bg-amber-100 text-amber-900 border-amber-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl w-full max-w-4xl my-6 p-5 sm:p-8 shadow-2xl relative animate-in zoom-in-95 duration-200 border border-gray-100 max-h-[92vh] flex flex-col"
      >
        {/* Botón cerrar */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 flex items-center justify-center border-none cursor-pointer transition-colors z-10"
          title="Cerrar ventana"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Encabezado del Área */}
        <div className="border-b border-gray-100 pb-4 mb-4">
          <div className="flex items-center gap-3.5 mb-2">
            <div
              style={{ backgroundColor: area.bgIcon, color: area.colorIcon }}
              className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-2xs"
            >
              <IconComponent className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[11px] uppercase font-bold text-gray-500 tracking-wider block">
                Área de Diagnóstico {area.code}
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 font-brand">
                {area.title}
              </h2>
            </div>
          </div>

          <p className="text-xs sm:text-sm text-gray-600 leading-relaxed mb-3">
            {area.desc}
          </p>

          <div className="text-[11px] text-[#163A2B] bg-[#E8F5EE] px-3 py-1.5 rounded-lg inline-block border border-[#86CEAB]/50 font-medium">
            {area.diagnosticRelation}
          </div>
        </div>

        {/* Barra de Filtros de herramientas */}
        <div className="flex flex-wrap items-center gap-1.5 mb-4 pb-2 border-b border-gray-100">
          <span className="text-xs font-bold text-gray-500 mr-2 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" /> Filtrar:
          </span>
          <button
            type="button"
            onClick={() => setFilterType('all')}
            className={`text-xs font-semibold px-3 py-1 rounded-full transition-colors cursor-pointer border ${
              filterType === 'all'
                ? 'bg-[#163A2B] text-white border-[#163A2B]'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border-transparent'
            }`}
          >
            Todas ({area.tools.length})
          </button>
          <button
            type="button"
            onClick={() => setFilterType('ai')}
            className={`text-xs font-semibold px-3 py-1 rounded-full transition-colors cursor-pointer border flex items-center gap-1 ${
              filterType === 'ai'
                ? 'bg-amber-600 text-white border-amber-600'
                : 'bg-amber-50 text-amber-900 hover:bg-amber-100 border-amber-200'
            }`}
          >
            <Sparkles className="w-3 h-3 text-amber-500" />
            Con IA
          </button>
          <button
            type="button"
            onClick={() => setFilterType('open_source')}
            className={`text-xs font-semibold px-3 py-1 rounded-full transition-colors cursor-pointer border ${
              filterType === 'open_source'
                ? 'bg-purple-700 text-white border-purple-700'
                : 'bg-purple-50 text-purple-900 hover:bg-purple-100 border-purple-200'
            }`}
          >
            Open Source
          </button>
          <button
            type="button"
            onClick={() => setFilterType('free')}
            className={`text-xs font-semibold px-3 py-1 rounded-full transition-colors cursor-pointer border ${
              filterType === 'free'
                ? 'bg-emerald-700 text-white border-emerald-700'
                : 'bg-emerald-50 text-emerald-900 hover:bg-emerald-100 border-emerald-200'
            }`}
          >
            Gratis / Freemium
          </button>
          <button
            type="button"
            onClick={() => setFilterType('paid')}
            className={`text-xs font-semibold px-3 py-1 rounded-full transition-colors cursor-pointer border ${
              filterType === 'paid'
                ? 'bg-blue-700 text-white border-blue-700'
                : 'bg-blue-50 text-blue-900 hover:bg-blue-100 border-blue-200'
            }`}
          >
            Bajo Costo
          </button>
        </div>

        {/* Lista de Herramientas TIC con Scroll */}
        <div className="overflow-y-auto space-y-4 pr-1 flex-1">
          {filteredTools.length === 0 ? (
            <div className="text-center py-8 text-gray-500 text-xs">
              No se encontraron herramientas con el filtro seleccionado en esta área.
            </div>
          ) : (
            filteredTools.map((tool) => (
              <div
                key={tool.id}
                className="bg-white border border-gray-200 rounded-xl p-4 sm:p-5 shadow-2xs hover:shadow-md hover:border-[#86CEAB] transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Encabezado de la herramienta */}
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-bold text-gray-900">
                        {tool.name}
                      </h3>
                      <span className="text-xs text-gray-500">· {tool.category}</span>
                    </div>

                    <div className="flex flex-wrap items-center gap-1.5">
                      <span
                        className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${getPricingBadge(
                          tool.pricingType
                        )}`}
                      >
                        {tool.pricingLabel}
                      </span>
                      {tool.hasAi && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-amber-50 text-amber-900 border border-amber-200 px-2 py-0.5 rounded-full">
                          <Sparkles className="w-3 h-3 text-amber-600" />
                          IA
                        </span>
                      )}
                      <span className="text-[11px] font-semibold text-gray-600 bg-gray-100 px-2 py-0.5 rounded-full">
                        {tool.difficulty}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-gray-600 leading-relaxed mb-3">
                    {tool.shortDesc}
                  </p>

                  {/* Problema y Beneficio en 2 columnas */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-3 text-xs">
                    <div className="bg-red-50/60 p-2.5 rounded-lg border border-red-100">
                      <span className="font-bold text-red-900 block mb-0.5">
                        Problema que resuelve:
                      </span>
                      <p className="text-red-950 leading-snug">
                        {tool.problemSolved}
                      </p>
                    </div>

                    <div className="bg-[#E8F5EE] p-2.5 rounded-lg border border-[#86CEAB]/50">
                      <span className="font-bold text-[#163A2B] block mb-0.5 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-[#163A2B]" />
                        ¿Cómo mejora tu negocio?
                      </span>
                      <p className="text-[#0e261c] leading-snug font-medium">
                        {tool.concreteBenefit}
                      </p>
                    </div>
                  </div>

                  <div className="text-[11px] text-gray-600 flex items-center gap-1.5 mb-3">
                    <Tag className="w-3 h-3 text-gray-400 shrink-0" />
                    <span>
                      <strong>Costo:</strong> {tool.pricingDetail}
                    </span>
                  </div>
                </div>

                {/* Botones de acción */}
                <div className="pt-3 border-t border-gray-100 flex flex-wrap items-center justify-between gap-2">
                  <span className="text-xs font-bold text-[#163A2B] bg-[#E8F5EE] px-2.5 py-1 rounded-md">
                    Impacto: {tool.impactMetric}
                  </span>

                  <div className="flex items-center gap-2">
                    <a
                      href={tool.websiteUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-semibold text-gray-600 hover:text-gray-900 px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors inline-flex items-center gap-1 no-underline"
                    >
                      <span>Sitio oficial</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>

                    <button
                      type="button"
                      onClick={() => onSelectTool(tool)}
                      className="text-xs font-bold text-white bg-[#163A2B] hover:bg-[#0e261c] px-3.5 py-1.5 rounded-lg transition-colors cursor-pointer inline-flex items-center gap-1.5 shadow-2xs"
                    >
                      <Lightbulb className="w-3.5 h-3.5 text-amber-300" />
                      <span>Ver Guía de Implementación</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

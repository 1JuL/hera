import React, { useState, useEffect } from 'react';
import {
  X,
  Sparkles,
  ExternalLink,
  Lightbulb,
  CheckCircle2,
  Tag,
  ArrowRight,
  Filter,
} from 'lucide-react';
import { Area, TicTool } from '../types';
import { getAreaIcon, getPricingBadge } from '../ui';

interface AreaDetailModalProps {
  area: Area | null;
  onClose: () => void;
  onSelectTool: (tool: TicTool) => void;
}

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

  const IconComponent = getAreaIcon(area.iconName);

  const filteredTools = area.tools.filter((tool) => {
    if (filterType === 'all') return true;
    if (filterType === 'ai') return tool.hasAi;
    if (filterType === 'open_source') return tool.pricingType === 'open_source';
    if (filterType === 'free') return tool.pricingType === 'free' || tool.pricingType === 'freemium';
    if (filterType === 'paid') return tool.pricingType === 'paid_low_cost';
    return true;
  });

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl w-full max-w-4xl my-2 sm:my-6 p-4 sm:p-8 shadow-2xl relative animate-in zoom-in-95 duration-200 border border-gray-100 max-h-[92vh] flex flex-col"
      >
        {/* Botón cerrar */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 sm:top-5 sm:right-5 w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 flex items-center justify-center border-none cursor-pointer transition-colors z-10"
          title="Cerrar ventana"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Encabezado compacto fijo (solo título e ícono para no quitar espacio al scroll en móvil) */}
        <div className="border-b border-gray-100 pb-3.5 mb-3.5 pr-10 shrink-0">
          <div className="flex items-center gap-3.5">
            <div
              style={{ backgroundColor: area.bgIcon, color: area.colorIcon }}
              className="w-11 h-11 sm:w-13 sm:h-13 rounded-2xl flex items-center justify-center shrink-0 shadow-2xs"
            >
              <IconComponent className="w-6 h-6 sm:w-7 sm:h-7" />
            </div>
            <div>
              <span className="text-xs uppercase font-bold text-gray-500 tracking-wider block">
                Área de Diagnóstico {area.code}
              </span>
              <h2 className="text-xl sm:text-3xl font-bold text-gray-900 font-brand leading-tight">
                {area.title}
              </h2>
            </div>
          </div>
        </div>

        {/* Contenido desplazable unificado (descripción, problemas, filtros y herramientas) */}
        <div className="overflow-y-auto space-y-5 pr-1 flex-1">
          <div className="space-y-4">
            <p className="text-sm sm:text-base text-gray-700 leading-relaxed">
              {area.desc}
            </p>

            {area.commonProblems && area.commonProblems.length > 0 && (
              <div className="bg-amber-50/80 border border-amber-200/70 rounded-xl p-4 text-sm">
                <span className="font-bold text-amber-950 block mb-1.5 flex items-center gap-1.5">
                  <Lightbulb className="w-4 h-4 text-amber-600 shrink-0" />
                  Problemas frecuentes que resuelve esta área en micronegocios:
                </span>
                <ul className="list-disc list-inside text-amber-900 space-y-1 pl-1">
                  {area.commonProblems.map((prob, idx) => (
                    <li key={idx} className="leading-relaxed">{prob}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Barra de Filtros de herramientas (desplazable horizontalmente en móvil) */}
          <div className="flex items-center gap-2 pb-3 border-b border-gray-100 overflow-x-auto sm:flex-wrap">
            <span className="text-xs sm:text-sm font-bold text-gray-600 mr-1 flex items-center gap-1.5 shrink-0">
              <Filter className="w-4 h-4 text-gray-400" /> Filtrar:
            </span>
            <button
              type="button"
              onClick={() => setFilterType('all')}
              className={`text-xs sm:text-sm font-semibold px-3.5 py-1.5 rounded-xl transition-colors cursor-pointer border shrink-0 ${
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
              className={`text-xs sm:text-sm font-semibold px-3.5 py-1.5 rounded-xl transition-colors cursor-pointer border flex items-center gap-1.5 shrink-0 ${
                filterType === 'ai'
                  ? 'bg-amber-600 text-white border-amber-600'
                  : 'bg-amber-50 text-amber-900 hover:bg-amber-100 border-amber-200'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              Con IA
            </button>
            <button
              type="button"
              onClick={() => setFilterType('open_source')}
              className={`text-xs sm:text-sm font-semibold px-3.5 py-1.5 rounded-xl transition-colors cursor-pointer border shrink-0 ${
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
              className={`text-xs sm:text-sm font-semibold px-3.5 py-1.5 rounded-xl transition-colors cursor-pointer border shrink-0 ${
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
              className={`text-xs sm:text-sm font-semibold px-3.5 py-1.5 rounded-xl transition-colors cursor-pointer border shrink-0 ${
                filterType === 'paid'
                  ? 'bg-blue-700 text-white border-blue-700'
                  : 'bg-blue-50 text-blue-900 hover:bg-blue-100 border-blue-200'
              }`}
            >
              Bajo Costo
            </button>
          </div>

          {/* Lista de Herramientas TIC */}
          <div className="space-y-5">
          {filteredTools.length === 0 ? (
            <div className="text-center py-10 text-gray-500 text-sm">
              No se encontraron herramientas con el filtro seleccionado en esta área.
            </div>
          ) : (
            filteredTools.map((tool) => (
              <div
                key={tool.id}
                className="bg-white border border-gray-200 hover:border-[#86CEAB] rounded-2xl p-5 sm:p-6 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Encabezado de la herramienta */}
                  <div className="flex flex-wrap items-center justify-between gap-3 mb-2.5">
                    <div className="flex items-baseline gap-2.5">
                      <h3 className="text-xl font-bold text-gray-900">
                        {tool.name}
                      </h3>
                      <span className="text-sm text-gray-500 font-medium">· {tool.category}</span>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`text-xs font-bold px-3 py-1 rounded-full border ${getPricingBadge(
                          tool.pricingType
                        )}`}
                      >
                        {tool.pricingLabel}
                      </span>
                      {tool.hasAi && (
                        <span className="inline-flex items-center gap-1.5 text-xs font-bold bg-amber-50 text-amber-900 border border-amber-200 px-2.5 py-1 rounded-full">
                          <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                          IA
                        </span>
                      )}
                      <span className="text-xs font-semibold text-gray-600 bg-gray-100 px-2.5 py-1 rounded-full">
                        {tool.difficulty}
                      </span>
                    </div>
                  </div>

                  {/* Descripción con texto amplio y legible */}
                  <p className="text-sm sm:text-[15px] text-gray-700 leading-relaxed mb-4">
                    {tool.shortDesc}
                  </p>

                  {/* Distribución limpia y menos saturada de Reto y Beneficio */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 mb-4">
                    <div className="bg-gray-50/90 p-4 rounded-xl border border-gray-200/80">
                      <span className="text-xs font-bold text-gray-600 uppercase tracking-wider block mb-1">
                        Reto que resuelve:
                      </span>
                      <p className="text-sm text-gray-800 leading-relaxed">
                        {tool.problemSolved}
                      </p>
                    </div>

                    <div className="bg-[#E8F5EE]/80 p-4 rounded-xl border border-[#86CEAB]/60">
                      <span className="text-xs font-bold text-[#163A2B] uppercase tracking-wider block mb-1 flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-[#163A2B]" />
                        Impacto en tu negocio:
                      </span>
                      <p className="text-sm text-[#0e261c] leading-relaxed font-medium">
                        {tool.concreteBenefit}
                      </p>
                    </div>
                  </div>

                  {/* Detalle de precios */}
                  <div className="text-xs sm:text-sm text-gray-600 flex items-center gap-2 mb-4">
                    <Tag className="w-4 h-4 text-gray-400 shrink-0" />
                    <span>
                      <strong className="text-gray-800">Costo:</strong> {tool.pricingDetail}
                    </span>
                  </div>
                </div>

                {/* Botones de acción y métrica de impacto */}
                <div className="pt-4 border-t border-gray-100 flex flex-wrap items-center justify-between gap-3">
                  <span className="text-xs sm:text-sm font-bold text-[#163A2B] bg-[#E8F5EE] border border-[#86CEAB]/60 px-3 py-1.5 rounded-lg">
                    Impacto: {tool.impactMetric}
                  </span>

                  <div className="flex items-center gap-2.5">
                    <a
                      href={tool.websiteUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs sm:text-sm font-semibold text-gray-700 hover:text-gray-900 px-3.5 py-2 rounded-xl hover:bg-gray-100 transition-colors inline-flex items-center gap-1.5 no-underline"
                    >
                      <span>Sitio oficial</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>

                    <button
                      type="button"
                      onClick={() => onSelectTool(tool)}
                      className="text-xs sm:text-sm font-bold text-white bg-[#163A2B] hover:bg-[#0e261c] px-4 py-2 rounded-xl transition-all cursor-pointer inline-flex items-center gap-2 shadow-xs"
                    >
                      <Lightbulb className="w-4 h-4 text-amber-300" />
                      <span>Ver Guía de Implementación</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
          </div>
        </div>
      </div>
    </div>
  );
};

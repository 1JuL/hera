import React, { useEffect } from 'react';
import {
  X,
  ExternalLink,
  Bot,
  CheckCircle2,
  Lightbulb,
  Sparkles,
  ShieldCheck,
  Tag,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { TicTool } from '../types';
import { getPricingBadge } from '../ui';

interface ToolImplementationModalProps {
  tool: TicTool | null;
  areaTitle?: string;
  onClose: () => void;
  onAskAssistant?: (prompt: string) => void;
}

export const ToolImplementationModal: React.FC<ToolImplementationModalProps> = ({
  tool,
  areaTitle,
  onClose,
  onAskAssistant,
}) => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (tool) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [tool, onClose]);

  if (!tool) return null;

  const handleConsultAssistant = () => {
    const prompt = `Hola Hera, me interesa implementar la herramienta "${tool.name}" en mi negocio (Área: ${areaTitle || 'General'}). ¿Qué recomendaciones prácticas me das para empezar y cómo puedo aprovechar su beneficio de "${tool.impactMetric}" sin complicarme?`;
    onClose();
    if (onAskAssistant) {
      onAskAssistant(prompt);
      return;
    }
    navigate('/asistente', {
      state: {
        initialPrompt: prompt,
      },
    });
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl w-full max-w-3xl my-6 p-6 sm:p-8 shadow-2xl relative animate-in zoom-in-95 duration-200 border border-gray-100 max-h-[92vh] flex flex-col"
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

        {/* Encabezado fijo */}
        <div className="border-b border-gray-100 pb-5 mb-5">
          <div className="flex flex-wrap items-center gap-2 mb-2.5">
            <span className="text-xs font-bold text-[#163A2B] bg-[#E8F5EE] px-3 py-1 rounded-full uppercase tracking-wider">
              {areaTitle || 'Solución TIC'}
            </span>
            <span
              className={`text-xs font-bold px-3 py-1 rounded-full border ${getPricingBadge(
                tool.pricingType
              )}`}
            >
              {tool.pricingLabel}
            </span>
            {tool.hasAi && (
              <span className="inline-flex items-center gap-1.5 text-xs font-bold bg-amber-50 text-amber-900 border border-amber-200 px-3 py-1 rounded-full">
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                Inteligencia Artificial
              </span>
            )}
            <span className="text-xs font-semibold text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
              Dificultad: {tool.difficulty}
            </span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 font-brand">
            {tool.name}
          </h2>
          <p className="text-sm sm:text-base text-gray-700 mt-2 leading-relaxed">
            {tool.shortDesc}
          </p>
        </div>

        {/* Contenido con scroll */}
        <div className="overflow-y-auto space-y-6 pr-1 flex-1">
          {/* Tarjeta de impacto y problema con tipografía amplia */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-gray-50/90 border border-gray-200 rounded-xl p-4">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-600 flex items-center gap-1.5 mb-1.5">
                <span className="w-2 h-2 rounded-full bg-red-500 inline-block"></span>
                Reto o proceso manual que resuelve:
              </span>
              <p className="text-sm sm:text-[15px] text-gray-800 leading-relaxed">
                {tool.problemSolved}
              </p>
            </div>

            <div className="bg-[#E8F5EE] border border-[#86CEAB]/60 rounded-xl p-4">
              <span className="text-xs font-bold uppercase tracking-wider text-[#163A2B] flex items-center gap-1.5 mb-1.5">
                <CheckCircle2 className="w-4 h-4 text-[#163A2B]" />
                ¿Cómo mejora tu negocio?
              </span>
              <p className="text-sm sm:text-[15px] text-[#0e261c] leading-relaxed font-medium">
                {tool.concreteBenefit}
              </p>
            </div>
          </div>

          {/* Información de costos y recomendado */}
          <div className="bg-gray-50/80 rounded-xl p-4 border border-gray-200/80 text-sm text-gray-700 space-y-2">
            <div className="flex items-start gap-2.5">
              <Tag className="w-4 h-4 text-gray-500 shrink-0 mt-0.5" />
              <span>
                <strong className="text-gray-900">Modelo de precios:</strong> {tool.pricingDetail}
              </span>
            </div>
            {tool.recommendedFor && (
              <div className="flex items-start gap-2.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  <strong className="text-gray-900">Ideal para:</strong> {tool.recommendedFor}
                </span>
              </div>
            )}
            {tool.hasAi && tool.aiFeature && (
              <div className="flex items-start gap-2.5 text-amber-900 bg-amber-50/90 p-2.5 rounded-lg border border-amber-200/70">
                <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Funcionalidad IA:</strong> {tool.aiFeature}
                </span>
              </div>
            )}
          </div>

          {/* Guía inicial de implementación de mínimo 3 pasos */}
          <div>
            <div className="flex items-center justify-between mb-3.5">
              <h3 className="text-sm sm:text-base font-bold uppercase tracking-wider text-gray-900 flex items-center gap-2">
                <Lightbulb className="w-4 h-4 text-amber-600" />
                Guía de Implementación Inicial (Paso a Paso)
              </h3>
              <span className="text-xs text-gray-500 font-medium">
                {tool.implementationSteps.length} pasos prácticos
              </span>
            </div>

            <div className="space-y-3.5">
              {tool.implementationSteps.map((step) => (
                <div
                  key={step.step}
                  className="bg-white border border-gray-200 hover:border-[#86CEAB] rounded-xl p-4 sm:p-5 shadow-2xs transition-colors"
                >
                  <div className="flex items-start gap-3.5">
                    <span className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#163A2B] text-white text-xs sm:text-sm font-bold flex items-center justify-center shrink-0 mt-0.5">
                      {step.step}
                    </span>
                    <div className="flex-1">
                      <h4 className="text-sm sm:text-base font-bold text-gray-900 mb-1">
                        {step.title}
                      </h4>
                      <p className="text-sm text-gray-700 leading-relaxed">
                        {step.description}
                      </p>
                      {step.tip && (
                        <div className="mt-2.5 text-xs sm:text-sm text-[#163A2B] bg-[#E8F5EE] px-3 py-2 rounded-lg flex items-center gap-2 border border-[#86CEAB]/40">
                          <span className="font-bold shrink-0">Tip de Hera:</span>
                          <span>{step.tip}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Acciones inferiores fijas */}
        <div className="border-t border-gray-100 pt-5 mt-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleConsultAssistant}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-xs sm:text-sm font-bold bg-[#E8F5EE] text-[#163A2B] hover:bg-[#d0eede] transition-colors cursor-pointer border border-[#86CEAB]/60"
          >
            <Bot className="w-4 h-4 text-[#163A2B]" />
            <span>Preguntar a Hera sobre esta herramienta</span>
          </button>

          <a
            href={tool.websiteUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-xs sm:text-sm font-bold bg-[#163A2B] text-white hover:bg-[#0e261c] transition-colors no-underline cursor-pointer shadow-xs"
          >
            <span>Visitar sitio oficial</span>
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { Info, Check, X } from 'lucide-react';
import {
  BENCHMARKS,
  USER_FLAGS,
  BenchmarkIndicator,
  SegmentKey,
} from '../benchmarks';

interface NationalBenchmarkCardProps {
  answers: Record<string, any>;
}

export const NationalBenchmarkCard: React.FC<NationalBenchmarkCardProps> = ({ answers }) => {
  const [selectedSegment, setSelectedSegment] = useState<'cabeceras' | 'nacional'>('cabeceras');

  // Separar indicadores por bloques
  const daneIndicators = BENCHMARKS.filter((b) => b.block === 'micronegocios_dane');
  const formalIndicators = BENCHMARKS.filter((b) => b.block === 'mipymes_formales');

  // Helper para renderizar una fila de indicador
  const renderIndicatorRow = (item: BenchmarkIndicator, segment: SegmentKey) => {
    const userFlagFn = USER_FLAGS[item.id];
    const userFlag = userFlagFn ? userFlagFn(answers) : null;

    // Si USER_FLAGS[id] devuelve null, se omite la fila según especificación
    if (userFlag === null) {
      return null;
    }

    const value = item.values[segment];
    if (value === undefined) {
      return null;
    }

    const valueText = `${value.toLocaleString('es-CO', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} %`;

    return (
      <div
        key={item.id}
        className="p-3.5 sm:p-4 rounded-xl bg-[#F8FAF9] border border-[#E0E0E0] flex flex-col md:flex-row md:items-center justify-between gap-3 hover:border-[#86CEAB]/70 transition-colors"
      >
        {/* Etiqueta + Tooltip + Tu Negocio */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-xs sm:text-sm font-semibold text-[#1E1E1E]">
              {item.label}
            </span>

            {/* Tooltip accesible */}
            <div className="relative group/tip inline-flex items-center">
              <button
                type="button"
                aria-label={`Detalles de fuente: ${item.label}`}
                className="text-[#888888] hover:text-[#163A2B] focus:text-[#163A2B] p-0.5 rounded cursor-pointer transition-colors"
              >
                <Info className="w-3.5 h-3.5" />
              </button>
              <div
                role="tooltip"
                className="invisible group-hover/tip:visible group-focus-within/tip:visible opacity-0 group-hover/tip:opacity-100 group-focus-within/tip:opacity-100 transition-all duration-150 absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-3 bg-[#163A2B] text-white text-[11px] rounded-xl shadow-xl z-30 pointer-events-none border border-[#86CEAB]/30"
              >
                <div className="font-bold text-[#86CEAB] mb-0.5">
                  {item.source} ({item.year})
                </div>
                <div className="text-[#D0E6DC] leading-snug">
                  {item.universe}
                </div>
                {item.derived && (
                  <div className="text-[10px] text-amber-200/90 border-t border-white/15 pt-1 mt-1.5 font-medium">
                    Calculado a partir de la cifra publicada
                  </div>
                )}
                <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-[#163A2B]" />
              </div>
            </div>
          </div>

          {/* Estado del usuario: Sí / No */}
          <div className="mt-1.5 flex items-center gap-2">
            <span
              className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full border ${
                userFlag
                  ? 'bg-[#E8F5EE] text-[#163A2B] border-[#86CEAB]'
                  : 'bg-[#F0F2F1] text-[#555555] border-[#D0D4D2]'
              }`}
            >
              {userFlag ? (
                <>
                  <Check className="w-3 h-3 text-[#163A2B]" />
                  <span>Tu negocio: Sí</span>
                </>
              ) : (
                <>
                  <X className="w-3 h-3 text-[#666666]" />
                  <span>Tu negocio: No</span>
                </>
              )}
            </span>
          </div>
        </div>

        {/* Barra de progreso y texto de referencia */}
        <div className="w-full md:w-64 shrink-0 flex flex-col gap-1.5">
          <div className="flex justify-between items-center text-xs text-[#555555]">
            <span className="font-medium text-[#1E1E1E]">
              {valueText} de los micronegocios también lo hace
            </span>
          </div>

          <div
            className="w-full bg-[#E5E9E7] h-2.5 rounded-full overflow-hidden"
            role="progressbar"
            aria-valuenow={value}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`${item.label}: ${valueText}`}
          >
            <div
              className="bg-[#163A2B] h-full rounded-full transition-all duration-300"
              style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
            />
          </div>
        </div>
      </div>
    );
  };

  const visibleDane = daneIndicators
    .map((ind) => renderIndicatorRow(ind, selectedSegment))
    .filter(Boolean);

  const visibleFormal = formalIndicators
    .map((ind) => renderIndicatorRow(ind, 'micro_formal'))
    .filter(Boolean);

  return (
    <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-xs border border-[#E0E0E0]">
      {/* Encabezado de la Tarjeta */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-5 border-b border-[#E0E0E0]">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#163A2B] bg-[#E8F5EE] px-2.5 py-0.5 rounded-sm">
            Punto de referencia (Nacional)
          </span>
          <h3 className="text-lg sm:text-xl font-bold text-[#1E1E1E] font-brand mt-1.5">
            Comparativa con micronegocios de Colombia
          </h3>
        </div>

        {/* Selector de Segmento para DANE */}
        <div className="flex items-center gap-1 bg-[#F4F6F4] p-1 rounded-xl border border-[#E0E0E0]">
          <button
            type="button"
            onClick={() => setSelectedSegment('cabeceras')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              selectedSegment === 'cabeceras'
                ? 'bg-[#163A2B] text-white shadow-2xs'
                : 'text-[#666666] hover:text-[#1E1E1E]'
            }`}
          >
            Cabeceras municipales (Urbano)
          </button>
          <button
            type="button"
            onClick={() => setSelectedSegment('nacional')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              selectedSegment === 'nacional'
                ? 'bg-[#163A2B] text-white shadow-2xs'
                : 'text-[#666666] hover:text-[#1E1E1E]'
            }`}
          >
            Total nacional
          </button>
        </div>
      </div>

      <div className="mt-6 space-y-8">
        {/* Bloque 1: Micronegocios de Colombia (DANE, 2024) */}
        <div>
          <div className="mb-3">
            <h4 className="text-xs font-bold text-[#1E1E1E] uppercase tracking-wider">
              Micronegocios de Colombia (DANE, 2024)
            </h4>
            <p className="text-[11px] text-[#666666]">
              Indicadores del sector micronegocio según segmento territorial (
              {selectedSegment === 'cabeceras' ? 'cabeceras municipales' : 'total nacional'}
              ).
            </p>
          </div>

          <div className="space-y-2.5">
            {visibleDane.length > 0 ? (
              visibleDane
            ) : (
              <p className="text-xs text-[#888888] italic py-2">
                Completa el cuestionario de diagnóstico para visualizar la comparativa de este bloque.
              </p>
            )}
          </div>
        </div>

        {/* Bloque 2: Mipymes formales (CIPE 2024, ACOPI 2022) */}
        <div>
          <div className="mb-3">
            <h4 className="text-xs font-bold text-[#1E1E1E] uppercase tracking-wider">
              Mipymes formales (CIPE 2024, ACOPI 2022)
            </h4>
            <p className="text-[11px] text-[#666666]">
              Apropiación digital y capacidades organizacionales en microempresas del segmento formal.
            </p>
          </div>

          <div className="space-y-2.5">
            {visibleFormal.length > 0 ? (
              visibleFormal
            ) : (
              <p className="text-xs text-[#888888] italic py-2">
                Completa el cuestionario de diagnóstico para visualizar la comparativa de este bloque.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Pie de Fuentes */}
      <div className="mt-8 pt-4 border-t border-[#E0E0E0] text-[11px] text-[#666666] leading-relaxed">
        Fuentes: DANE EMICRON 2024, CIPE/CNC/iNNpulsa 2024, ACOPI 2022. Datos nacionales; no son específicos de Sabana Centro.
      </div>
    </div>
  );
};

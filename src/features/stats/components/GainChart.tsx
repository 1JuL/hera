import React, { useState } from 'react';

const MONTHS = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
const DATA_NON_TECH = [8.0, 9.0, 9.5, 12.0, 13.5, 15.0, 13.8, 15.5, 16.2, 17.0, 17.8, 19.83];
const DATA_TECH = [4.0, 5.0, 5.5, 6.0, 6.5, 7.0, 7.2, 7.5, 7.8, 8.0, 8.2, 8.62];

export const GainChart: React.FC = () => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const maxTotal = 30; // Max escala Y en millones

  return (
    <div className="w-full flex flex-col justify-between h-[270px]">
      {/* Leyenda */}
      <div className="flex justify-end gap-4 text-xs mb-3">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-xs bg-[#163A2B] inline-block"></span>
          <span className="text-[#666666]">Aporte no tecnológico</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-xs bg-[#86CEAB] inline-block"></span>
          <span className="text-[#666666]">Aporte tecnológico</span>
        </div>
      </div>

      {/* Gráfico SVG interactivo */}
      <div className="relative flex-1 flex items-end w-full pb-6 pt-2">
        {/* Líneas guía de fondo */}
        <div className="absolute inset-0 flex flex-col justify-between pointer-events-none pb-6">
          {[30, 20, 10, 0].map((val) => (
            <div key={val} className="w-full flex items-center border-b border-[#E0E0E0]/50 text-[10px] text-[#999]">
              <span className="w-8 shrink-0">${val}M</span>
              <div className="flex-1"></div>
            </div>
          ))}
        </div>

        {/* Barras de datos */}
        <div className="relative w-full h-full flex items-end justify-between pl-8 z-10">
          {MONTHS.map((month, idx) => {
            const nonTech = DATA_NON_TECH[idx];
            const tech = DATA_TECH[idx];
            const total = nonTech + tech;

            const nonTechHeightPercent = (nonTech / maxTotal) * 100;
            const techHeightPercent = (tech / maxTotal) * 100;

            const isHovered = hoveredIdx === idx;

            return (
              <div
                key={month}
                className="flex-1 flex flex-col items-center h-full justify-end relative group cursor-pointer px-1"
                onMouseEnter={() => setHoveredIdx(idx)}
                onMouseLeave={() => setHoveredIdx(null)}
              >
                {/* Tooltip flotante */}
                {isHovered && (
                  <div className="absolute -top-12 z-20 bg-[#163A2B] text-white text-[11px] p-2 rounded-md shadow-lg pointer-events-none whitespace-nowrap">
                    <div className="font-bold">{month}: ${(total).toFixed(2)}M</div>
                    <div className="text-[10px] text-[#86CEAB]">Tecnológico: ${tech.toFixed(2)}M</div>
                    <div className="text-[10px] text-[#D0E6DC]">No tec: ${nonTech.toFixed(2)}M</div>
                  </div>
                )}

                {/* Columna apilada */}
                <div className="w-full max-w-[28px] flex flex-col justify-end transition-transform duration-200 group-hover:scale-105">
                  {/* Segmento superior: Aporte tecnológico */}
                  <div
                    style={{ height: `${techHeightPercent * 1.8}px` }}
                    className="w-full bg-[#86CEAB] rounded-t-[4px] relative flex items-center justify-center text-[9px] font-bold text-[#163A2B]"
                  >
                    {techHeightPercent > 12 && (
                      <span className="opacity-80">${tech.toFixed(0)}</span>
                    )}
                  </div>
                  {/* Segmento inferior: Aporte no tecnológico */}
                  <div
                    style={{ height: `${nonTechHeightPercent * 1.8}px` }}
                    className="w-full bg-[#163A2B] rounded-b-[4px] relative flex items-center justify-center text-[9px] font-bold text-white"
                  >
                    {nonTechHeightPercent > 15 && (
                      <span className="opacity-90">${nonTech.toFixed(0)}</span>
                    )}
                  </div>
                </div>

                {/* Etiqueta del mes */}
                <span className="absolute -bottom-5 text-[11px] text-[#666666] font-medium">
                  {month}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};


import React, { useEffect } from 'react';
import { Area } from '../types';

interface AreaDetailModalProps {
  area: Area | null;
  onClose: () => void;
}

export const AreaDetailModal: React.FC<AreaDetailModalProps> = ({ area, onClose }) => {
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

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-[20px] w-full max-w-[420px] p-7 shadow-2xl relative animate-in zoom-in-95 duration-200"
      >
        {/* Botón cerrar */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 w-7 h-7 rounded-full bg-[#F0F0F0] hover:bg-[#E4E4E4] text-[#666666] font-bold flex items-center justify-center border-none cursor-pointer transition-colors text-sm"
        >
          ✕
        </button>

        {/* Encabezado del Área */}
        <div className="flex items-center gap-3 mb-3">
          <div
            style={{ backgroundColor: area.bgIcon, color: area.colorIcon }}
            className="w-10 h-10 rounded-full flex items-center justify-center text-lg font-medium"
          >
            {area.icon}
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-[#666666] tracking-wider block">
              Área
            </span>
            <div className="text-xl font-bold text-[#1E1E1E]">
              {area.title}
            </div>
          </div>
        </div>

        {/* Descripción */}
        <p className="text-xs text-[#666666] leading-relaxed mb-4">
          {area.desc}
        </p>

        {/* Subtítulo soluciones */}
        <div className="text-xs font-bold text-[#1E1E1E] uppercase tracking-wide mb-3">
          3 Soluciones Tecnológicas:
        </div>

        {/* Lista de Soluciones */}
        <div className="flex flex-col gap-2.5">
          {area.solutions.map((sol, index) => (
            <div
              key={index}
              style={{ backgroundColor: area.itemBg }}
              className="p-3.5 rounded-xl border border-black/5"
            >
              <h4 className="text-[13px] font-bold text-[#1E1E1E] mb-1 flex items-center gap-1.5">
                <span className="text-[10px]">▶</span> {sol.name}
              </h4>
              <p className="text-[11px] text-[#4A5568] opacity-90 leading-snug">
                {sol.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};


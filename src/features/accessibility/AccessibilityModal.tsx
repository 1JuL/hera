import React, { useEffect } from 'react';
import { X, Eye, Type, RotateCcw } from 'lucide-react';
import { useAccessibility, ScaleLevel } from './AccessibilityContext';

interface AccessibilityModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SCALE_OPTIONS: { value: ScaleLevel; label: string }[] = [
  { value: 'normal', label: 'Normal' },
  { value: 'large', label: 'Grande' },
  { value: 'xlarge', label: 'Muy Grande' },
];

export const AccessibilityModal: React.FC<AccessibilityModalProps> = ({ isOpen, onClose }) => {
  const { settings, setSubtitleSize, setAuxSize } = useAccessibility();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl w-full max-w-lg p-6 shadow-2xl relative animate-in zoom-in-95 duration-200 border border-gray-100"
      >
        {/* Botón cerrar */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 flex items-center justify-center border-none cursor-pointer transition-colors"
          title="Cerrar ventana"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Encabezado */}
        <div className="flex items-center gap-3 pb-4 mb-5 border-b border-gray-100">
          <div className="w-10 h-10 rounded-xl bg-[#E8F5EE] text-[#163A2B] flex items-center justify-center shrink-0">
            <Eye className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900 font-brand">
              Ajustes de Lectura
            </h2>
            <p className="text-xs text-gray-600">
              Ajusta el tamaño de letra para mayor comodidad visual.
            </p>
          </div>
        </div>

        {/* Controles */}
        <div className="space-y-4">
          {/* Subtítulos y secciones */}
          <div className="bg-gray-50/80 p-4 rounded-xl border border-gray-200/80 space-y-2.5">
            <div className="flex items-center gap-2">
              <Type className="w-4 h-4 text-[#163A2B]" />
              <span className="text-sm font-bold text-gray-900">
                Subtítulos y secciones
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {SCALE_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setSubtitleSize(opt.value)}
                  className={`py-2 px-3 rounded-lg text-xs font-bold transition-colors cursor-pointer border ${
                    settings.subtitleSize === opt.value
                      ? 'bg-[#163A2B] text-white border-[#163A2B]'
                      : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Textos descriptivos y guías */}
          <div className="bg-gray-50/80 p-4 rounded-xl border border-gray-200/80 space-y-2.5">
            <div className="flex items-center gap-2">
              <Type className="w-4 h-4 text-[#163A2B]" />
              <span className="text-sm font-bold text-gray-900">
                Textos descriptivos y guías
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {SCALE_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setAuxSize(opt.value)}
                  className={`py-2 px-3 rounded-lg text-xs font-bold transition-colors cursor-pointer border ${
                    settings.auxSize === opt.value
                      ? 'bg-[#163A2B] text-white border-[#163A2B]'
                      : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Vista previa compacta */}
          <div className="p-3.5 rounded-xl bg-[#E8F5EE] border border-[#86CEAB]/60">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#163A2B] block mb-1">
              Vista previa
            </span>
            <h3 className="text-lg font-bold text-[#163A2B] font-brand mb-0.5">
              Subtítulo de ejemplo
            </h3>
            <p className="text-sm text-[#0e261c] leading-relaxed">
              Así se verán los textos descriptivos y guías en la plataforma.
            </p>
          </div>
        </div>

        {/* Acciones */}
        <div className="flex items-center justify-between gap-3 pt-5 mt-5 border-t border-gray-100">
          <button
            type="button"
            onClick={() => {
              setSubtitleSize('normal');
              setAuxSize('large');
            }}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors cursor-pointer border-none"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Restaurar</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-[#163A2B] text-white hover:bg-[#0e261c] transition-colors cursor-pointer border-none shadow-xs"
          >
            Listo
          </button>
        </div>
      </div>
    </div>
  );
};

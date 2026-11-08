import React from 'react';
import { Check, AlertCircle } from 'lucide-react';
import { Question } from '../schema/types';

interface QuestionFieldProps {
  question: Question;
  value: any;
  onChange: (val: any) => void;
  error?: string;
}

export const QuestionField: React.FC<QuestionFieldProps> = ({
  question,
  value,
  onChange,
  error,
}) => {
  const isMulti = question.type === 'multi';
  const isScale = question.type === 'scale';
  const isText = question.type === 'text';
  const isBoolean = question.type === 'boolean';

  // Manejo de multi-selección
  const handleMultiToggle = (optVal: string) => {
    const currentList: string[] = Array.isArray(value) ? [...value] : [];
    if (currentList.includes(optVal)) {
      onChange(currentList.filter((item) => item !== optVal));
    } else {
      onChange([...currentList, optVal]);
    }
  };

  return (
    <div className="bg-white border border-[#E0E0E0]/80 rounded-xl p-5 shadow-xs transition-all hover:border-[#163A2B]/40">
      {/* Encabezado de la pregunta */}
      <div className="mb-3">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[11px] font-bold text-[#163A2B] bg-[#E8F5EE] px-2 py-0.5 rounded-sm">
            {question.id}
          </span>
          {question.tier === 'extended' && (
            <span className="text-[10px] font-semibold text-[#8A4810] bg-[#FDE8D7] px-2 py-0.5 rounded-sm">
              Opcional
            </span>
          )}
          {question.required && (
            <span className="text-[11px] text-red-600 font-bold">*</span>
          )}
        </div>
        <label className="text-sm md:text-base font-semibold text-[#1E1E1E] block leading-snug">
          {question.label}
        </label>
        {question.help && (
          <p className="text-xs text-[#666666] mt-1 leading-relaxed">
            {question.help}
          </p>
        )}
      </div>

      {/* Tipo Texto */}
      {isText && (
        <textarea
          rows={2}
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Escriba su respuesta aquí..."
          className="w-full text-sm p-3 border border-[#E0E0E0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#163A2B]/20 focus:border-[#163A2B] bg-white text-[#1E1E1E]"
        />
      )}

      {/* Tipo Booleano */}
      {isBoolean && (
        <label className="flex items-start gap-3 cursor-pointer p-3 rounded-lg border border-[#E0E0E0] hover:bg-[#F8FAF9] min-h-[48px]">
          <input
            type="checkbox"
            checked={Boolean(value)}
            onChange={(e) => onChange(e.target.checked)}
            className="w-5 h-5 mt-0.5 accent-[#163A2B] cursor-pointer"
          />
          <span className="text-sm text-[#1E1E1E] font-medium leading-relaxed">
            Sí, acepto los términos y condiciones de tratamiento de datos.
          </span>
        </label>
      )}

      {/* Tipo Escala 1 al 5 */}
      {isScale && (
        <div className="pt-2">
          <div className="flex items-center gap-2 sm:gap-4 max-w-md">
            {[1, 2, 3, 4, 5].map((num) => {
              const isSelected = value === num;
              return (
                <button
                  key={num}
                  type="button"
                  onClick={() => onChange(num)}
                  className={`flex-1 min-h-[48px] rounded-xl font-bold text-sm transition-all cursor-pointer flex flex-col items-center justify-center border ${
                    isSelected
                      ? 'bg-[#163A2B] text-white border-[#163A2B] shadow-sm scale-105'
                      : 'bg-[#F8FAF9] text-[#1E1E1E] border-[#E0E0E0] hover:bg-[#E8F5EE] hover:text-[#163A2B]'
                  }`}
                >
                  <span className="text-base">{num}</span>
                </button>
              );
            })}
          </div>
          <div className="flex justify-between text-[11px] text-[#666666] max-w-md px-1 mt-1.5">
            <span>1: Mínimo</span>
            <span>5: Máximo</span>
          </div>
        </div>
      )}

      {/* Tipo Selección Única y Rangos */}
      {(question.type === 'single' || question.type === 'range') && question.options && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
          {question.options.map((opt) => {
            const isSelected = value === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => onChange(opt.value)}
                className={`text-left p-3.5 rounded-xl border text-xs sm:text-[13px] font-medium transition-all cursor-pointer min-h-[48px] flex items-center justify-between gap-2 ${
                  isSelected
                    ? 'bg-[#E8F5EE] border-[#163A2B] text-[#163A2B] font-semibold ring-1 ring-[#163A2B]'
                    : 'bg-[#F9FAF9] border-[#E0E0E0] text-[#1E1E1E] hover:bg-white hover:border-[#163A2B]/50'
                }`}
              >
                <span>{opt.label}</span>
                <span
                  className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                    isSelected ? 'border-[#163A2B] bg-[#163A2B]' : 'border-[#CCCCCC]'
                  }`}
                >
                  {isSelected && <span className="w-1.5 h-1.5 bg-white rounded-full"></span>}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* Tipo Selección Múltiple */}
      {isMulti && question.options && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
          {question.options.map((opt) => {
            const isChecked = Array.isArray(value) && value.includes(opt.value);
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => handleMultiToggle(opt.value)}
                className={`text-left p-3.5 rounded-xl border text-xs sm:text-[13px] font-medium transition-all cursor-pointer min-h-[48px] flex items-center justify-between gap-2 ${
                  isChecked
                    ? 'bg-[#E8F5EE] border-[#163A2B] text-[#163A2B] font-semibold ring-1 ring-[#163A2B]'
                    : 'bg-[#F9FAF9] border-[#E0E0E0] text-[#1E1E1E] hover:bg-white hover:border-[#163A2B]/50'
                }`}
              >
                <span>{opt.label}</span>
                <span
                  className={`w-4 h-4 rounded-md border flex items-center justify-center shrink-0 text-white ${
                    isChecked ? 'border-[#163A2B] bg-[#163A2B]' : 'border-[#CCCCCC]'
                  }`}
                >
                  {isChecked && <Check className="w-3 h-3 text-white" />}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* Mensaje de error de validación */}
      {error && (
        <p className="text-xs text-red-600 font-medium mt-2 flex items-center gap-1.5">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
          <span>{error}</span>
        </p>
      )}
    </div>
  );
};

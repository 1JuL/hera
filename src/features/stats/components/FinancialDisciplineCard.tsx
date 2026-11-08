import React from 'react';
import { CheckCircle2, Circle } from 'lucide-react';
import { DiagnosticScores } from '@/features/diagnostic/schema/types';

interface FinancialDisciplineCardProps {
  financial: DiagnosticScores['financialDiscipline'];
}

export const FinancialDisciplineCard: React.FC<FinancialDisciplineCardProps> = ({
  financial,
}) => {
  const items = [
    {
      label: 'Registro sistemático de ventas (Excel o Software)',
      passed: financial.registersSales,
      tip: 'Registrar ventas digitalmente evita fugas de dinero y permite anticipar temporadas.',
    },
    {
      label: 'Costeo exacto de productos o servicios',
      passed: financial.knowsCosts,
      tip: 'Conocer costos unitarios previene vender con márgenes negativos o pérdidas ocultas.',
    },
    {
      label: 'Precios fijados por costos y margen estructurado',
      passed: financial.structuredPricing,
      tip: 'Fijar precios por margen protege la sostenibilidad frente a la inflación.',
    },
    {
      label: 'Separación total de cuentas personales y del negocio',
      passed: financial.separatesPersonalFinances,
      tip: 'Separar finanzas personales permite conocer la rentabilidad real de la empresa.',
    },
  ];

  return (
    <div className="bg-white p-5 rounded-2xl border border-[#E0E0E0] shadow-xs">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h4 className="text-sm font-bold text-[#1E1E1E]">
            Disciplina Financiera y Control del Negocio
          </h4>
          <p className="text-xs text-[#666666]">
            Prácticas fundamentales para la formalización y toma de decisiones
          </p>
        </div>
        <div className="text-right">
          <span className="text-2xl font-bold text-[#163A2B]">
            {financial.score}%
          </span>
          <span className="text-[10px] text-[#666666] block">Nivel de orden</span>
        </div>
      </div>

      <div className="space-y-2.5">
        {items.map((item, i) => (
          <div
            key={i}
            className={`p-3 rounded-xl border text-xs flex items-start gap-2.5 ${
              item.passed
                ? 'bg-[#E8F5EE] border-[#86CEAB]/60 text-[#163A2B]'
                : 'bg-[#F9FAF9] border-[#E0E0E0] text-[#666666]'
            }`}
          >
            <div className="shrink-0 mt-0.5">
              {item.passed ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              ) : (
                <Circle className="w-4 h-4 text-gray-400" />
              )}
            </div>
            <div className="flex-1">
              <span className="font-semibold block">{item.label}</span>
              {!item.passed && (
                <span className="text-[11px] text-[#888] block mt-0.5">
                  Oportunidad: {item.tip}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

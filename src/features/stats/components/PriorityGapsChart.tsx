import React from 'react';
import { CheckCircle } from 'lucide-react';
import { DiagnosticScores } from '@/features/diagnostic/schema/types';

interface PriorityGapsChartProps {
  gaps: DiagnosticScores['priorityGaps'];
}

export const PriorityGapsChart: React.FC<PriorityGapsChartProps> = ({ gaps }) => {
  if (gaps.length === 0) {
    return (
      <div className="p-6 text-center bg-[#E8F5EE] rounded-xl text-[#163A2B]">
        <CheckCircle className="w-8 h-8 text-[#163A2B] mx-auto mb-2" />
        <h4 className="text-sm font-bold">¡Sin brechas críticas detectadas!</h4>
        <p className="text-xs opacity-80 mt-1">
          Las actividades prioritarias de tu negocio cuentan con herramientas digitales básicas o especializadas.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {gaps.slice(0, 5).map((gap, index) => {
        const isUrgent = gap.importance === 5;
        return (
          <div
            key={gap.activityId}
            className="p-3.5 bg-[#FFFDF7] border border-[#F3E8C9] rounded-xl flex items-center justify-between gap-3 shadow-2xs hover:border-[#86CEAB] transition-colors"
          >
            <div className="flex items-start gap-2.5">
              <span className="w-5 h-5 rounded-full bg-[#163A2B] text-white flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                {index + 1}
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-[#8A4810] bg-[#FDE8D7] px-1.5 py-0.2 rounded-xs">
                    {gap.areaId}
                  </span>
                  <span className="text-xs font-bold text-[#1E1E1E]">
                    {gap.activityName}
                  </span>
                </div>
                <span className="text-[11px] text-[#666666] block mt-0.5">
                  Estado actual: <strong>{gap.currentStateLabel}</strong>
                </span>
              </div>
            </div>

            <div className="text-right shrink-0">
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  isUrgent
                    ? 'bg-red-100 text-red-700'
                    : 'bg-amber-100 text-amber-800'
                }`}
              >
                Prioridad {gap.importance}/5
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
};

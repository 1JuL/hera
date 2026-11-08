import React, { useState } from 'react';
import {
  CircleDollarSign,
  Megaphone,
  Receipt,
  Users,
  Boxes,
  MessageSquare,
  Shield,
  Check,
} from 'lucide-react';
import { Answers, AreaId, Question } from '../schema/types';

interface ActivityMatrixProps {
  questions: Question[];
  answers: Answers;
  onAnswerChange: (id: string, val: any) => void;
}

const AREA_LABELS: Record<AreaId, { title: string; subtitle: string; icon: React.FC<{ className?: string }> }> = {
  VEN: { title: 'Ventas y Comercial', subtitle: 'Cotizaciones, registro y seguimiento', icon: CircleDollarSign },
  MKT: { title: 'Marketing y Comunicación', subtitle: 'Redes, publicidad y catálogo', icon: Megaphone },
  FIN: { title: 'Contabilidad y Finanzas', subtitle: 'Facturación, impuestos y caja', icon: Receipt },
  RRH: { title: 'Gestión de Personal', subtitle: 'Turnos, nómina y capacitación', icon: Users },
  OPE: { title: 'Operaciones e Inventario', subtitle: 'Stock, compras y producción', icon: Boxes },
  CLI: { title: 'Servicio al Cliente', subtitle: 'Atención por WhatsApp y PQRS', icon: MessageSquare },
  ADM: { title: 'Administración y Seguridad', subtitle: 'Respaldos, claves y documentos', icon: Shield },
};

const SCALE_OPTIONS = [
  { val: '0', label: '0. No lo hago', desc: 'No se realiza o no aplica' },
  { val: '1', label: '1. Manual', desc: 'Papel, memoria o recibos' },
  { val: '2', label: '2. Básico', desc: 'Excel, WhatsApp, notas' },
  { val: '3', label: '3. Especializado', desc: 'Software o app dedicada' },
];

export const ActivityMatrix: React.FC<ActivityMatrixProps> = ({
  questions,
  answers,
  onAnswerChange,
}) => {
  const areaIds: AreaId[] = ['VEN', 'MKT', 'FIN', 'RRH', 'OPE', 'CLI', 'ADM'];
  const [activeTab, setActiveTab] = useState<AreaId>('VEN');

  const currentAreaInfo = AREA_LABELS[activeTab];
  const ActiveIcon = currentAreaInfo.icon;
  const areaQuestions = questions.filter(
    (q) => q.area === activeTab && !q.id.endsWith('-IMP')
  );
  const impQuestion = questions.find((q) => q.id === `E-${activeTab}-IMP`);
  const impValue = answers[`E-${activeTab}-IMP`] ? Number(answers[`E-${activeTab}-IMP`]) : null;

  return (
    <div className="space-y-6">
      {/* Selector de pestañas por área */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none border-b border-[#E0E0E0]">
        {areaIds.map((areaId) => {
          const isSelected = activeTab === areaId;
          const AreaIcon = AREA_LABELS[areaId].icon;
          const questionsInArea = questions.filter((q) => q.area === areaId && !q.id.endsWith('-IMP'));
          const answeredInArea = questionsInArea.filter(
            (q) => answers[q.id] !== undefined && answers[q.id] !== null && answers[q.id] !== ''
          ).length;
          const isComplete = answeredInArea === questionsInArea.length && answers[`E-${areaId}-IMP`];

          return (
            <button
              key={areaId}
              type="button"
              onClick={() => setActiveTab(areaId)}
              className={`px-3 py-2.5 rounded-xl font-medium text-xs whitespace-nowrap transition-all cursor-pointer flex items-center gap-2 shrink-0 border ${
                isSelected
                  ? 'bg-[#163A2B] text-white border-[#163A2B] shadow-xs'
                  : 'bg-white text-[#1E1E1E] border-[#E0E0E0] hover:bg-[#E8F5EE]'
              }`}
            >
              <AreaIcon className="w-3.5 h-3.5" />
              <span>{areaId}</span>
              {isComplete && <Check className="w-3 h-3 text-[#86CEAB]" />}
            </button>
          );
        })}
      </div>

      {/* Encabezado del área activa */}
      <div className="bg-[#E8F5EE] border border-[#86CEAB]/40 rounded-xl p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[#163A2B] text-white flex items-center justify-center">
            <ActiveIcon className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-base font-bold text-[#163A2B]">
              {currentAreaInfo.title}
            </h3>
            <p className="text-xs text-[#163A2B]/80">
              {currentAreaInfo.subtitle}
            </p>
          </div>
        </div>
        <div className="text-right">
          <span className="text-xs font-bold text-[#163A2B] bg-white px-2.5 py-1 rounded-md shadow-2xs">
            {questions.filter((q) => q.area === activeTab && !q.id.endsWith('-IMP') && answers[q.id] !== undefined).length} / {areaQuestions.length}
          </span>
        </div>
      </div>

      {/* Lista de actividades en tarjetas táctiles */}
      <div className="space-y-4">
        {areaQuestions.map((q) => {
          const currentVal = answers[q.id] !== undefined ? String(answers[q.id]) : '';

          return (
            <div
              key={q.id}
              className="bg-white border border-[#E0E0E0] rounded-xl p-4 shadow-xs"
            >
              <div className="flex items-start gap-2 mb-3">
                <span className="text-[10px] font-bold text-[#163A2B] bg-[#F4F6F4] px-1.5 py-0.5 rounded-sm shrink-0">
                  {q.id}
                </span>
                <h4 className="text-sm font-semibold text-[#1E1E1E] leading-snug">
                  {q.label}
                </h4>
              </div>

              {/* Botones de selección 0, 1, 2, 3 */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {SCALE_OPTIONS.map((opt) => {
                  const isChosen = currentVal === opt.val;
                  return (
                    <button
                      key={opt.val}
                      type="button"
                      onClick={() => onAnswerChange(q.id, opt.val)}
                      className={`min-h-[48px] p-2 rounded-lg border text-left transition-all cursor-pointer flex flex-col justify-center ${
                        isChosen
                          ? 'bg-[#163A2B] text-white border-[#163A2B] shadow-xs'
                          : 'bg-[#F9FAF9] text-[#1E1E1E] border-[#E0E0E0] hover:bg-[#E8F5EE] hover:border-[#163A2B]/40'
                      }`}
                    >
                      <span className="text-xs font-bold leading-tight block">
                        {opt.label}
                      </span>
                      <span
                        className={`text-[10px] block mt-0.5 truncate ${
                          isChosen ? 'text-[#86CEAB]' : 'text-[#666666]'
                        }`}
                      >
                        {opt.desc}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Pregunta de Importancia al final del bloque */}
      {impQuestion && (
        <div className="bg-[#FFFDF7] border border-[#F3E8C9] rounded-xl p-5 shadow-xs">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold text-[#8A4810] bg-[#FDE8D7] px-2 py-0.5 rounded-sm">
              Prioridad
            </span>
            <span className="text-xs text-red-600 font-bold">*</span>
          </div>
          <h4 className="text-sm font-bold text-[#1E1E1E] mb-1">
            {impQuestion.label}
          </h4>
          <p className="text-xs text-[#666666] mb-3">
            {impQuestion.help}
          </p>

          <div className="flex items-center gap-2 max-w-sm">
            {[1, 2, 3, 4, 5].map((star) => {
              const isSelected = impValue === star;
              return (
                <button
                  key={star}
                  type="button"
                  onClick={() => onAnswerChange(impQuestion.id, star)}
                  className={`flex-1 min-h-[48px] rounded-xl font-bold text-sm transition-all cursor-pointer border flex flex-col items-center justify-center ${
                    isSelected
                      ? 'bg-[#163A2B] text-white border-[#163A2B] shadow-xs scale-105'
                      : 'bg-white text-[#1E1E1E] border-[#E0E0E0] hover:bg-[#E8F5EE]'
                  }`}
                >
                  <span className="text-base">{star}</span>
                </button>
              );
            })}
          </div>
          <div className="flex justify-between text-[11px] text-[#666666] max-w-sm px-1 mt-1">
            <span>1: Baja</span>
            <span>5: Urgente</span>
          </div>
        </div>
      )}
    </div>
  );
};

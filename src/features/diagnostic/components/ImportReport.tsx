import React from 'react';
import { AlertTriangle, CheckCircle2 } from 'lucide-react';
import { ImportValidationReport } from '../lib/excel/excelService';

interface ImportReportProps {
  report: ImportValidationReport;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ImportReport: React.FC<ImportReportProps> = ({
  report,
  onConfirm,
  onCancel,
}) => {
  return (
    <div className="space-y-4">
      {/* Resumen numérico */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-[#E8F5EE] border border-[#86CEAB]/50 p-3 rounded-xl text-center">
          <span className="text-xl font-bold text-[#163A2B] block">
            {report.answeredCount}
          </span>
          <span className="text-[11px] text-[#163A2B]/80 font-medium">
            Válidas leídas
          </span>
        </div>
        <div className="bg-[#FFFDF7] border border-[#F3E8C9] p-3 rounded-xl text-center">
          <span className="text-xl font-bold text-[#8A4810] block">
            {report.emptyCount}
          </span>
          <span className="text-[11px] text-[#8A4810]/80 font-medium">
            Sin responder
          </span>
        </div>
        <div className="bg-[#FDF2F2] border border-[#F5C2C2] p-3 rounded-xl text-center">
          <span className="text-xl font-bold text-[#991B1B] block">
            {report.invalidCount}
          </span>
          <span className="text-[11px] text-[#991B1B]/80 font-medium">
            Con errores
          </span>
        </div>
      </div>

      {/* Lista de advertencias o errores si los hay */}
      {report.errors.length > 0 && (
        <div className="border border-red-200 bg-red-50/50 rounded-xl p-3 max-h-[160px] overflow-y-auto">
          <h4 className="text-xs font-bold text-red-800 mb-2 flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
            <span>Detalles de los valores no reconocidos:</span>
          </h4>
          <ul className="text-[11px] text-red-700 space-y-1.5 list-disc pl-4">
            {report.errors.map((err, i) => (
              <li key={i}>
                <strong>[{err.id}] {err.label}:</strong> {err.reason} (Valor: &quot;{String(err.value)}&quot;)
              </li>
            ))}
          </ul>
        </div>
      )}

      {report.errors.length === 0 ? (
        <div className="text-xs text-[#163A2B] bg-[#E8F5EE] p-3 rounded-xl font-medium flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Todas las respuestas leídas coinciden perfectamente con el esquema versionado ({report.version}).</span>
        </div>
      ) : (
        <p className="text-xs text-[#666666]">
          Las preguntas con errores o sin responder se precargarán vacías en el formulario web para que puedas completarlas en pantalla.
        </p>
      )}

      {/* Botones de acción */}
      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 py-2.5 px-4 rounded-xl border border-[#E0E0E0] text-[#666666] font-semibold text-xs hover:bg-[#F4F6F4] cursor-pointer"
        >
          Descartar
        </button>
        <button
          type="button"
          onClick={onConfirm}
          className="flex-1 py-2.5 px-4 rounded-xl bg-[#163A2B] hover:bg-[#112D21] text-white font-semibold text-xs shadow-xs cursor-pointer"
        >
          Aplicar y continuar en el formulario
        </button>
      </div>
    </div>
  );
};

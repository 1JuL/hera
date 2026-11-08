import React, { useState } from 'react';
import {
  FileEdit,
  FileSpreadsheet,
  Download,
  FileCode,
  Sparkles,
  ArrowLeft,
  ArrowRight,
  Upload,
  X,
  Check,
} from 'lucide-react';
import { useDraftResponse } from '../diagnostic/hooks/useDraftResponse';
import questionnaireSchema from '../diagnostic/schema/questionnaire.v1.json';
import { QuestionnaireSchema } from '../diagnostic/schema/types';
import { QuestionnaireWizard } from '../diagnostic/components/QuestionnaireWizard';
import { ImportDialog } from '../diagnostic/components/ImportDialog';
import {
  downloadExcelTemplateOrAnswers,
  downloadJsonAudit,
} from '../diagnostic/lib/excel/excelService';

export const DataUploadPage: React.FC = () => {
  const schema = questionnaireSchema as unknown as QuestionnaireSchema;
  const { draft, setAnswers, loadSampleData, resetDiagnostic } = useDraftResponse();

  const [wizardOpen, setWizardOpen] = useState(false);
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 4000);
  };

  // Cálculo de preguntas respondidas
  const answeredCount = Object.keys(draft.answers).filter(
    (k) => draft.answers[k] !== undefined && draft.answers[k] !== null && draft.answers[k] !== ''
  ).length;

  const hasDraft = answeredCount > 1;

  return (
    <main className="max-w-[1200px] w-full mx-auto px-4 sm:px-6 py-8 flex-1">
      {/* Notificación flotante */}
      {notification && (
        <div className="mb-6 p-4 bg-[#E8F5EE] border border-[#86CEAB] text-[#163A2B] text-xs font-semibold rounded-xl flex items-center justify-between shadow-xs animate-in fade-in">
          <span>{notification}</span>
          <button
            type="button"
            onClick={() => setNotification(null)}
            className="text-[#163A2B] font-bold p-1 bg-transparent border-none cursor-pointer hover:opacity-80"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Si el wizard está abierto, renderizarlo a pantalla completa */}
      {wizardOpen ? (
        <div className="space-y-4">
          <button
            type="button"
            onClick={() => setWizardOpen(false)}
            className="text-xs font-semibold text-[#163A2B] hover:underline flex items-center gap-1.5 cursor-pointer bg-white px-3 py-1.5 rounded-lg border border-[#E0E0E0] shadow-2xs"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Volver a Carga de Datos y Herramientas</span>
          </button>
          <QuestionnaireWizard onClose={() => setWizardOpen(false)} />
        </div>
      ) : (
        <div className="space-y-8">
          {/* Encabezado */}
          <div className="bg-white rounded-2xl p-6 sm:p-8 border border-[#E0E0E0]/80 shadow-xs">
            <div className="max-w-2xl">
              <span className="text-xs text-[#163A2B] font-bold uppercase tracking-wider block mb-1">
                Diagnóstico Empresarial
              </span>
              <h1 className="text-2xl sm:text-3xl font-bold text-[#1E1E1E] mb-2 font-brand">
                Carga de Datos y Diagnóstico Tecnológico
              </h1>
              <p className="text-xs sm:text-sm text-[#666666] leading-relaxed">
                El diagnóstico TIC de Senzaccento es la base para identificar brechas y generar su mapa de oportunidades. Puede completarlo directamente en el formulario web o importar la plantilla diligenciada en Excel.
              </p>
            </div>

            {/* Estado actual del cuestionario */}
            <div className="mt-6 pt-5 border-t border-[#E0E0E0] flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span
                  className={`w-3 h-3 rounded-full ${
                    draft.status === 'completed'
                      ? 'bg-emerald-500'
                      : hasDraft
                      ? 'bg-amber-500 animate-pulse'
                      : 'bg-gray-400'
                  }`}
                />
                <span className="text-xs font-semibold text-[#1E1E1E] flex items-center gap-1.5">
                  <span>Estado:</span>
                  {draft.status === 'completed' ? (
                    <span className="text-emerald-700 flex items-center gap-1">
                      <span>Diagnóstico Completado</span>
                      <Check className="w-3.5 h-3.5" />
                    </span>
                  ) : hasDraft ? (
                    `Borrador en curso (${answeredCount} respuestas)`
                  ) : (
                    'Sin iniciar'
                  )}
                </span>
              </div>

              {hasDraft && (
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      if (confirm('¿Desea reiniciar el diagnóstico y borrar las respuestas guardadas?')) {
                        resetDiagnostic();
                        showNotification('Se ha reiniciado el borrador.');
                      }
                    }}
                    className="text-xs text-red-600 hover:text-red-800 font-semibold cursor-pointer underline bg-transparent border-none"
                  >
                    Reiniciar borrador
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Dos tarjetas de acción principales */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Opción 1: Completar en línea */}
            <div className="bg-white rounded-2xl p-6 sm:p-8 border border-[#E0E0E0] shadow-xs flex flex-col justify-between hover:shadow-sm transition-all">
              <div>
                <div className="w-12 h-12 rounded-xl bg-[#163A2B] text-white flex items-center justify-center mb-4 shadow-2xs">
                  <FileEdit className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-bold text-[#1E1E1E] mb-2 font-brand">
                  Cuestionario de Diagnóstico en Línea
                </h3>
                <p className="text-xs text-[#666666] leading-relaxed mb-6">
                  Responda de forma guiada en su celular o computador. Cuenta con modo rápido (~10 minutos) o modo completo. Guarda automáticamente su progreso.
                </p>
              </div>

              <div>
                <button
                  type="button"
                  onClick={() => setWizardOpen(true)}
                  className="w-full bg-[#163A2B] hover:bg-[#112D21] text-white py-3 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs flex items-center justify-center gap-2"
                >
                  <span>{hasDraft ? 'Continuar Cuestionario' : 'Iniciar Cuestionario en Línea'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Opción 2: Importar plantilla Excel */}
            <div className="bg-white rounded-2xl p-6 sm:p-8 border border-[#E0E0E0] shadow-xs flex flex-col justify-between hover:shadow-sm transition-all">
              <div>
                <div className="w-12 h-12 rounded-xl bg-[#86CEAB] text-[#163A2B] flex items-center justify-center mb-4 shadow-2xs">
                  <FileSpreadsheet className="w-6 h-6 text-[#163A2B]" />
                </div>
                <h3 className="text-lg font-bold text-[#1E1E1E] mb-2 font-brand">
                  Importar Cuestionario en Excel (.xlsx)
                </h3>
                <p className="text-xs text-[#666666] leading-relaxed mb-6">
                  Descargue la plantilla oficial, complétela fuera de línea con su equipo o contador, y súbala. El sistema valida las respuestas y las integra con el diagnóstico.
                </p>
              </div>

              <div className="space-y-2.5">
                <button
                  type="button"
                  onClick={() => setImportDialogOpen(true)}
                  className="w-full bg-[#E8F5EE] hover:bg-[#D0E6DC] text-[#163A2B] border border-[#86CEAB]/60 py-3 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Subir archivo diligenciado (.xlsx / .csv / .json)</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    downloadExcelTemplateOrAnswers(schema);
                    showNotification('Descargando plantilla oficial en blanco...');
                  }}
                  className="w-full text-center text-xs text-[#163A2B] font-semibold hover:underline py-1 cursor-pointer bg-transparent border-none flex items-center justify-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Descargar plantilla en blanco (.csv / Excel)</span>
                </button>
              </div>
            </div>
          </div>

          {/* Barra de herramientas adicionales de exportación y demostración */}
          <div className="bg-white rounded-2xl p-6 border border-[#E0E0E0]/80 shadow-xs">
            <h4 className="text-xs font-bold text-[#1E1E1E] uppercase tracking-wider mb-4">
              Herramientas de Exportación y Auditoría
            </h4>

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => {
                  downloadExcelTemplateOrAnswers(schema, draft.answers);
                  showNotification('Exportando respuestas en formato compatible...');
                }}
                className="px-4 py-2.5 rounded-xl border border-[#E0E0E0] bg-[#F8FAF9] hover:bg-[#E8F5EE] text-[#163A2B] text-xs font-semibold cursor-pointer transition-colors flex items-center gap-2"
              >
                <FileSpreadsheet className="w-4 h-4" />
                <span>Exportar mis respuestas (Excel/CSV)</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  downloadJsonAudit(draft.answers, schema);
                  showNotification('Descargando copia de auditoría en JSON...');
                }}
                className="px-4 py-2.5 rounded-xl border border-[#E0E0E0] bg-[#F8FAF9] hover:bg-[#E8F5EE] text-[#163A2B] text-xs font-semibold cursor-pointer transition-colors flex items-center gap-2"
              >
                <FileCode className="w-4 h-4" />
                <span>Exportar copia JSON (Auditoría)</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  loadSampleData();
                  showNotification('Datos de prueba cargados. Ya puedes ver el análisis completo en Estadísticas.');
                }}
                className="px-4 py-2.5 rounded-xl border border-[#86CEAB] bg-[#E8F5EE] hover:bg-[#D0E6DC] text-[#163A2B] text-xs font-bold cursor-pointer transition-colors ml-auto flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                <span>Cargar respuestas de prueba (Demo)</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de importación */}
      <ImportDialog
        isOpen={importDialogOpen}
        schema={schema}
        onClose={() => setImportDialogOpen(false)}
        onApplyAnswers={(importedAnswers) => {
          setAnswers(importedAnswers);
          showNotification('Respuestas importadas con éxito. Puedes revisarlas en el cuestionario.');
          setWizardOpen(true);
        }}
      />
    </main>
  );
};

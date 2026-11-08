import React, { useState, useRef } from 'react';
import { UploadCloud, X } from 'lucide-react';
import { QuestionnaireSchema, Answers } from '../schema/types';
import { parseImportFile, ImportValidationReport } from '../lib/excel/excelService';
import { ImportReport } from './ImportReport';

interface ImportDialogProps {
  isOpen: boolean;
  schema: QuestionnaireSchema;
  onApplyAnswers: (answers: Answers) => void;
  onClose: () => void;
}

export const ImportDialog: React.FC<ImportDialogProps> = ({
  isOpen,
  schema,
  onApplyAnswers,
  onClose,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [report, setReport] = useState<ImportValidationReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      setErrorMessage('El archivo excede el tamaño máximo permitido de 2 MB.');
      return;
    }

    setLoading(true);
    setErrorMessage(null);

    try {
      const result = await parseImportFile(file, schema);
      setReport(result);
    } catch (err: any) {
      setErrorMessage(err.message || 'Error al procesar el archivo');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = () => {
    if (report) {
      onApplyAnswers(report.parsedAnswers);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl w-full max-w-lg p-6 md:p-8 shadow-2xl relative">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-[#F0F0F0] text-[#666] font-bold flex items-center justify-center border-none cursor-pointer hover:bg-[#E4E4E4] transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <h3 className="text-xl font-bold text-[#163A2B] mb-1">
          Importar Cuestionario Senzaccento
        </h3>
        <p className="text-xs text-[#666666] mb-5">
          Sube el archivo diligenciado (.xlsx, .csv o .json) generado a partir de la plantilla oficial.
        </p>

        <input
          ref={fileInputRef}
          type="file"
          accept=".xlsx,.csv,.json"
          onChange={handleFileChange}
          className="hidden"
        />

        {!report && (
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-[#86CEAB] hover:border-[#163A2B] bg-[#F8FAF9] rounded-2xl p-8 text-center cursor-pointer transition-colors"
          >
            <div className="w-12 h-12 rounded-full bg-[#E8F5EE] text-[#163A2B] flex items-center justify-center mx-auto mb-3">
              <UploadCloud className="w-6 h-6 text-[#163A2B]" />
            </div>
            <h4 className="text-sm font-bold text-[#1E1E1E] mb-1">
              Haz clic para seleccionar tu archivo
            </h4>
            <p className="text-xs text-[#666666] mb-3">
              Formatos aceptados: .xlsx, .csv o .json (hasta 2 MB)
            </p>
            <span className="inline-block text-xs font-semibold bg-[#163A2B] text-white px-4 py-2 rounded-lg">
              Examinar archivos
            </span>
          </div>
        )}

        {loading && (
          <div className="py-8 text-center text-sm text-[#163A2B] font-semibold animate-pulse">
            Validando estructura y respuestas con el esquema {schema.version}...
          </div>
        )}

        {errorMessage && (
          <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-xl text-xs border border-red-200">
            {errorMessage}
          </div>
        )}

        {report && (
          <ImportReport
            report={report}
            onConfirm={handleConfirm}
            onCancel={() => {
              setReport(null);
            }}
          />
        )}
      </div>
    </div>
  );
};

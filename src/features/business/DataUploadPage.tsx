import React, { useRef, useState } from 'react';

export const DataUploadPage: React.FC = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);
  const [questionnaireActive, setQuestionnaireActive] = useState(false);

  const handleSelectFiles = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFileName(e.target.files[0].name);
    }
  };

  return (
    <main className="max-w-[1200px] w-full mx-auto px-5 py-10 flex justify-center items-start flex-1">
      <div className="bg-white rounded-xl p-8 md:p-10 max-w-[550px] w-full shadow-sm border border-[#E0E0E0]/60">
        <div className="mb-8">
          <span className="text-xs text-[#666666] block mb-1.5 font-medium">
            Carga de datos
          </span>
          <h1 className="text-2xl md:text-[28px] font-bold text-[#1E1E1E] mb-2">
            Carga de Datos
          </h1>
          <p className="text-[13px] text-[#666666] leading-relaxed">
            Sube los archivos de tu empresa para analizar tu modelo de negocio y tecnologías
          </p>
        </div>

        {/* Input oculto para selección de archivos */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.xlsx,.xls,.docx,.csv"
          className="hidden"
          onChange={handleFileChange}
        />

        <div className="flex flex-col sm:flex-row gap-5">
          {/* Opción 1: Subir Archivos */}
          <div className="flex-1 bg-[#F8FAF9] border border-[#E0E0E0] rounded-xl p-6 flex flex-col justify-between min-h-[280px]">
            <div>
              <div className="w-11 h-11 rounded-[10px] bg-[#163A2B] flex items-center justify-center text-white mb-4 shadow-xs">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                  <polyline points="17 8 12 3 7 8"></polyline>
                  <line x1="12" y1="3" x2="12" y2="15"></line>
                </svg>
              </div>
              <h3 className="text-base font-bold text-[#1E1E1E] mb-2 leading-tight">
                Subir Archivos
              </h3>
              <p className="text-[11px] text-[#666666] leading-relaxed mb-4">
                Sube documentos, reportes financieros o archivos de tu empresa para un análisis completo
              </p>
              {selectedFileName && (
                <div className="text-[11px] bg-[#E8F5EE] text-[#163A2B] font-medium p-2 rounded-md mb-3 truncate">
                  📄 {selectedFileName}
                </div>
              )}
            </div>
            <button
              type="button"
              onClick={handleSelectFiles}
              className="w-full bg-[#163A2B] hover:bg-[#112D21] text-white py-2.5 px-3 rounded-2xl text-[11px] font-semibold transition-colors cursor-pointer"
            >
              {selectedFileName ? 'Cambiar archivo' : 'Seleccionar archivos'}
            </button>
          </div>

          {/* Opción 2: Cuestionario de Diagnóstico */}
          <div className="flex-1 bg-[#F8FAF9] border border-[#E0E0E0] rounded-xl p-6 flex flex-col justify-between min-h-[280px]">
            <div>
              <div className="w-11 h-11 rounded-[10px] bg-[#163A2B] flex items-center justify-center text-white mb-4 shadow-xs">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="8" y1="6" x2="21" y2="6"></line>
                  <line x1="8" y1="12" x2="21" y2="12"></line>
                  <line x1="8" y1="18" x2="21" y2="18"></line>
                  <line x1="3" y1="6" x2="3.01" y2="6"></line>
                  <line x1="3" y1="12" x2="3.01" y2="12"></line>
                  <line x1="3" y1="18" x2="3.01" y2="18"></line>
                </svg>
              </div>
              <h3 className="text-base font-bold text-[#1E1E1E] mb-2 leading-tight">
                Cuestionario de Diagnóstico
              </h3>
              <p className="text-[11px] text-[#666666] leading-relaxed mb-4">
                Responde un cuestionario rápido para diagnosticar el estado actual de tu negocio y tecnología
              </p>
              {questionnaireActive && (
                <div className="text-[11px] bg-[#E8F5EE] text-[#163A2B] font-medium p-2 rounded-md mb-3">
                  ✓ Formulario preparado (HU1)
                </div>
              )}
            </div>
            <button
              type="button"
              onClick={() => setQuestionnaireActive(true)}
              className="w-full bg-[#163A2B] hover:bg-[#112D21] text-white py-2.5 px-3 rounded-2xl text-[11px] font-semibold transition-colors cursor-pointer"
            >
              Iniciar cuestionario
            </button>
          </div>
        </div>
      </div>
    </main>
  );
};


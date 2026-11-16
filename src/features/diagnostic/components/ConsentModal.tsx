import React from 'react';
import { ShieldCheck } from 'lucide-react';

interface ConsentModalProps {
  isOpen: boolean;
  onAccept: () => void;
  onCancel: () => void;
}

export const ConsentModal: React.FC<ConsentModalProps> = ({
  isOpen,
  onAccept,
  onCancel,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl w-full max-w-lg p-6 md:p-8 shadow-2xl relative">
        <div className="w-12 h-12 rounded-full bg-[#E8F5EE] text-[#163A2B] flex items-center justify-center mb-4">
          <ShieldCheck className="w-7 h-7 text-[#163A2B]" />
        </div>

        <h3 className="text-xl font-bold text-[#163A2B] mb-2">
          Aviso de Privacidad y Tratamiento de Datos
        </h3>

        <div className="text-xs text-[#4A5568] space-y-3 leading-relaxed max-h-[260px] overflow-y-auto pr-2 border-y border-[#E0E0E0] py-3 my-4">
          <p>
            En cumplimiento de la <strong>Ley Estatutaria 1581 de 2012</strong> (Habeas Data) y decretos reglamentarios en Colombia, la plataforma <strong>Hera</strong> (Grupo Senzaccento - Universidad de La Sabana) informa a los usuarios que:
          </p>
          <ul className="list-disc pl-4 space-y-1">
            <li>
              <strong>Finalidad exclusiva:</strong> La información recopilada mediante este cuestionario tiene como único propósito diagnosticar el estado tecnológico de su microempresa, generar recomendaciones de soluciones TIC personalizadas y calcular estadísticas agregadas.
            </li>
            <li>
              <strong>Datos solicitados:</strong> Solo se solicitan datos operativos y comerciales del negocio (nombre comercial, municipio, sector, canales y rangos de ventas). <em>No se solicitan datos bancarios, contraseñas, documentos de identidad ni el NIT personal.</em>
            </li>
            <li>
              <strong>Privacidad garantizada:</strong> Sus datos no se venderán, compartirán ni transferirán a terceros para fines publicitarios.
            </li>
            <li>
              <strong>Derechos del titular:</strong> Usted puede solicitar en cualquier momento la actualización, rectificación o eliminación total de las respuestas de su negocio.
            </li>
          </ul>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 py-3 px-4 rounded-xl border border-[#E0E0E0] text-[#666666] font-semibold text-xs hover:bg-[#F4F6F4] cursor-pointer transition-colors"
          >
            Cancelar y volver
          </button>
          <button
            type="button"
            onClick={onAccept}
            className="flex-1 py-3 px-4 rounded-xl bg-[#163A2B] hover:bg-[#112D21] text-white font-semibold text-xs shadow-xs cursor-pointer transition-colors"
          >
            Acepto y deseo comenzar
          </button>
        </div>
      </div>
    </div>
  );
};

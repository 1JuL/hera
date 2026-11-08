import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Zap, Check, ArrowLeft, ArrowRight } from 'lucide-react';
import questionnaireSchema from '../schema/questionnaire.v1.json';
import { QuestionnaireSchema } from '../schema/types';
import { useDraftResponse } from '../hooks/useDraftResponse';
import { QuestionField } from './QuestionField';
import { ActivityMatrix } from './ActivityMatrix';
import { ConsentModal } from './ConsentModal';
import { isQuestionVisible } from '../schema/visibility';

interface QuestionnaireWizardProps {
  onClose?: () => void;
}

export const QuestionnaireWizard: React.FC<QuestionnaireWizardProps> = ({ onClose }) => {
  const navigate = useNavigate();
  const schema = questionnaireSchema as unknown as QuestionnaireSchema;

  const {
    draft,
    setAnswer,
    setTierMode,
    setCurrentSectionIndex,
    completeDiagnostic,
  } = useDraftResponse();

  const [showConsentModal, setShowConsentModal] = useState(!draft.answers['K01']);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const sections = schema.sections;
  const currentSection = sections[draft.currentSectionIndex] || sections[0];

  // Preguntas visibles en la sección actual
  const currentSectionQuestions = useMemo(() => {
    return schema.questions.filter(
      (q) => q.section === currentSection.id && isQuestionVisible(q, draft.answers, draft.tierMode)
    );
  }, [schema.questions, currentSection.id, draft.answers, draft.tierMode]);

  // Cálculo del progreso general según el modo activo
  const progressStats = useMemo(() => {
    const allVisible = schema.questions.filter((q) =>
      isQuestionVisible(q, draft.answers, draft.tierMode)
    );
    const answered = allVisible.filter((q) => {
      const a = draft.answers[q.id];
      return a !== undefined && a !== null && a !== '' && (!Array.isArray(a) || a.length > 0);
    });
    const percentage = allVisible.length > 0 ? Math.round((answered.length / allVisible.length) * 100) : 0;
    return {
      total: allVisible.length,
      answered: answered.length,
      percentage,
    };
  }, [schema.questions, draft.answers, draft.tierMode]);

  const handleNextSection = async () => {
    // Validar preguntas requeridas de la sección actual
    const errors: Record<string, string> = {};
    for (const q of currentSectionQuestions) {
      if (q.required) {
        const val = draft.answers[q.id];
        if (val === undefined || val === null || val === '' || (Array.isArray(val) && val.length === 0)) {
          errors[q.id] = 'Por favor responde esta pregunta antes de continuar.';
        }
      }
    }

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      window.scrollTo({ top: 100, behavior: 'smooth' });
      return;
    }

    setValidationErrors({});

    if (draft.currentSectionIndex < sections.length - 1) {
      setCurrentSectionIndex(draft.currentSectionIndex + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      // Último paso: completar
      await completeDiagnostic();
      navigate('/estadisticas');
    }
  };

  const handlePrevSection = () => {
    if (draft.currentSectionIndex > 0) {
      setValidationErrors({});
      setCurrentSectionIndex(draft.currentSectionIndex - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleConsentAccept = () => {
    setAnswer('K01', true);
    setShowConsentModal(false);
    if (draft.currentSectionIndex === 0) {
      setCurrentSectionIndex(1); // Pasar directamente a Sección A
    }
  };

  const isLastSection = draft.currentSectionIndex === sections.length - 1;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-[#E0E0E0] overflow-hidden flex flex-col">
      {/* Barra Superior con Selector de Modo y Progreso */}
      <div className="bg-[#163A2B] text-white p-5 md:p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
          <div>
            <span className="text-[11px] font-bold tracking-wider uppercase text-[#86CEAB]">
              Autodiagnóstico TIC · Senzaccento
            </span>
            <h2 className="text-xl md:text-2xl font-bold font-brand text-white">
              {currentSection.title}
            </h2>
            <p className="text-xs text-[#D0E6DC]">
              {currentSection.subtitle}
            </p>
          </div>

          {/* Selector de modo Core vs Completo */}
          <div className="bg-white/10 p-1 rounded-xl flex items-center border border-white/15">
            <button
              type="button"
              onClick={() => setTierMode('core')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                draft.tierMode === 'core'
                  ? 'bg-white text-[#163A2B] shadow-2xs'
                  : 'text-white/80 hover:text-white'
              }`}
            >
              <Zap className="w-3.5 h-3.5 text-[#163A2B]" />
              <span>Rápido (~10 min)</span>
            </button>
            <button
              type="button"
              onClick={() => setTierMode('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                draft.tierMode === 'all'
                  ? 'bg-white text-[#163A2B] shadow-2xs'
                  : 'text-white/80 hover:text-white'
              }`}
            >
              Completo
            </button>
          </div>
        </div>

        {/* Barra de progreso */}
        <div>
          <div className="flex justify-between text-xs text-[#D0E6DC] mb-1.5 font-medium">
            <span>
              Paso {draft.currentSectionIndex + 1} de {sections.length}: {currentSection.title}
            </span>
            <span>
              {progressStats.answered} de {progressStats.total} preguntas ({progressStats.percentage}%)
            </span>
          </div>
          <div className="w-full bg-white/20 h-2.5 rounded-full overflow-hidden">
            <div
              className="bg-[#86CEAB] h-full transition-all duration-300 rounded-full"
              style={{ width: `${progressStats.percentage}%` }}
            />
          </div>
        </div>
      </div>

      {/* Stepper de Secciones */}
      <div className="bg-[#F8FAF9] border-b border-[#E0E0E0] px-4 py-3 flex gap-2 overflow-x-auto scrollbar-none">
        {sections.map((sec, idx) => {
          const isActive = idx === draft.currentSectionIndex;
          const isPassed = idx < draft.currentSectionIndex;

          return (
            <button
              key={sec.id}
              type="button"
              onClick={() => {
                if (draft.answers['K01'] || sec.id === 'K') {
                  setCurrentSectionIndex(idx);
                }
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold shrink-0 transition-all cursor-pointer flex items-center gap-1.5 border ${
                isActive
                  ? 'bg-[#163A2B] text-white border-[#163A2B]'
                  : isPassed
                  ? 'bg-[#E8F5EE] text-[#163A2B] border-[#86CEAB]/60'
                  : 'bg-white text-[#666] border-[#E0E0E0]'
              }`}
            >
              <span>{sec.id}.</span>
              <span>{sec.title}</span>
              {isPassed && <Check className="w-3 h-3 text-[#163A2B]" />}
            </button>
          );
        })}
      </div>

      {/* Cuerpo del Formulario */}
      <div className="p-6 md:p-8 flex-1 bg-[#F4F6F4]/50">
        {currentSection.id === 'E' ? (
          // Sección E: Matriz de Actividades
          <ActivityMatrix
            questions={currentSectionQuestions}
            answers={draft.answers}
            onAnswerChange={setAnswer}
          />
        ) : (
          // Demás secciones
          <div className="space-y-5 max-w-3xl mx-auto">
            {currentSectionQuestions.map((q) => (
              <QuestionField
                key={q.id}
                question={q}
                value={draft.answers[q.id]}
                onChange={(val) => setAnswer(q.id, val)}
                error={validationErrors[q.id]}
              />
            ))}
          </div>
        )}
      </div>

      {/* Barra Inferior de Navegación y Guardado */}
      <div className="bg-white border-t border-[#E0E0E0] p-4 sm:p-5 flex flex-col sm:flex-row justify-between items-center gap-3">
        <div className="flex items-center gap-2 text-xs text-[#666666]">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>Borrador guardado automáticamente</span>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          {draft.currentSectionIndex > 0 && (
            <button
              type="button"
              onClick={handlePrevSection}
              className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl border border-[#E0E0E0] text-[#1E1E1E] text-xs font-semibold hover:bg-[#F4F6F4] cursor-pointer transition-colors flex items-center justify-center gap-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Anterior</span>
            </button>
          )}

          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl text-xs font-semibold text-[#666666] hover:text-[#1E1E1E] cursor-pointer"
            >
              Guardar y cerrar
            </button>
          )}

          <button
            type="button"
            onClick={handleNextSection}
            className="flex-1 sm:flex-none px-6 py-2.5 rounded-xl bg-[#163A2B] hover:bg-[#112D21] text-white text-xs font-bold shadow-xs cursor-pointer transition-all flex items-center justify-center gap-2"
          >
            <span>{isLastSection ? 'Finalizar y ver Diagnóstico' : 'Siguiente sección'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Modal de consentimiento si no se ha aceptado K01 */}
      <ConsentModal
        isOpen={showConsentModal}
        onAccept={handleConsentAccept}
        onCancel={() => {
          if (onClose) onClose();
          else navigate('/inicio');
        }}
      />
    </div>
  );
};

import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Zap,
  Check,
  ArrowLeft,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
} from 'lucide-react';
import Swal from 'sweetalert2';
import questionnaireSchema from '../schema/questionnaire.v1.json';
import { QuestionnaireSchema, Question } from '../schema/types';
import { useDraftResponse } from '../hooks/useDraftResponse';
import { QuestionField } from './QuestionField';
import { ActivityMatrix } from './ActivityMatrix';
import { ConsentModal } from './ConsentModal';
import { isQuestionVisible } from '../schema/visibility';

interface QuestionnaireWizardProps {
  onClose?: () => void;
}

/* ─────────────────────────────────────────────────────
 *  Helpers para validación cross-section
 * ───────────────────────────────────────────────────── */

/** Verifica si una pregunta individual tiene respuesta válida */
function isAnswered(q: Question, answers: Record<string, any>): boolean {
  const val = answers[q.id];
  if (val === undefined || val === null || val === '') return false;
  if (Array.isArray(val) && val.length === 0) return false;
  return true;
}

/** Retorna los IDs de preguntas requeridas sin responder en una sección */
function getMissingSectionQuestions(
  questions: Question[],
  sectionId: string,
  answers: Record<string, any>,
  tierMode: 'core' | 'all'
): Question[] {
  return questions.filter(
    (q) =>
      q.section === sectionId &&
      q.required &&
      isQuestionVisible(q, answers, tierMode) &&
      !isAnswered(q, answers)
  );
}

/** Valida TODAS las secciones y retorna un mapa {sectionId: missingQuestions[]} */
function validateAllSections(
  schema: QuestionnaireSchema,
  answers: Record<string, any>,
  tierMode: 'core' | 'all'
): Map<string, Question[]> {
  const errors = new Map<string, Question[]>();
  for (const sec of schema.sections) {
    const missing = getMissingSectionQuestions(schema.questions, sec.id, answers, tierMode);
    if (missing.length > 0) {
      errors.set(sec.id, missing);
    }
  }
  return errors;
}

/* ─────────────────────────────────────────────────────
 *  Componente principal
 * ───────────────────────────────────────────────────── */

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
  /** Secciones con errores de validación global (al intentar finalizar) */
  const [sectionsWithErrors, setSectionsWithErrors] = useState<Set<string>>(new Set());

  const sections = schema.sections;
  const currentSection = sections[draft.currentSectionIndex] || sections[0];

  /* ── Refs para scroll horizontal del stepper ── */
  const stepperContainerRef = useRef<HTMLDivElement>(null);
  const sectionButtonRefs = useRef<Map<number, HTMLButtonElement>>(new Map());
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  /** Actualiza indicadores de scroll disponible */
  const updateScrollIndicators = useCallback(() => {
    const container = stepperContainerRef.current;
    if (!container) return;
    setCanScrollLeft(container.scrollLeft > 4);
    setCanScrollRight(container.scrollLeft + container.clientWidth < container.scrollWidth - 4);
  }, []);

  /** Centra el botón activo en la barra del stepper */
  useEffect(() => {
    const btn = sectionButtonRefs.current.get(draft.currentSectionIndex);
    if (btn && stepperContainerRef.current) {
      btn.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'center',
      });
    }
    // Pequeño delay para que el DOM termine su layout
    const timer = setTimeout(updateScrollIndicators, 120);
    return () => clearTimeout(timer);
  }, [draft.currentSectionIndex, updateScrollIndicators]);

  /** Listener de scroll en el stepper para flechas */
  useEffect(() => {
    const container = stepperContainerRef.current;
    if (!container) return;
    container.addEventListener('scroll', updateScrollIndicators, { passive: true });
    // Check inicial
    updateScrollIndicators();
    return () => container.removeEventListener('scroll', updateScrollIndicators);
  }, [updateScrollIndicators]);

  const scrollStepperBy = (direction: 'left' | 'right') => {
    const container = stepperContainerRef.current;
    if (!container) return;
    const amount = container.clientWidth * 0.6;
    container.scrollBy({
      left: direction === 'left' ? -amount : amount,
      behavior: 'smooth',
    });
  };

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
    const answered = allVisible.filter((q) => isAnswered(q, draft.answers));
    const percentage = allVisible.length > 0 ? Math.round((answered.length / allVisible.length) * 100) : 0;
    return {
      total: allVisible.length,
      answered: answered.length,
      percentage,
    };
  }, [schema.questions, draft.answers, draft.tierMode]);

  /** Validar sección actual y avanzar */
  const handleNextSection = async () => {
    // Validar preguntas requeridas de la sección actual
    const errors: Record<string, string> = {};
    for (const q of currentSectionQuestions) {
      if (q.required && !isAnswered(q, draft.answers)) {
        errors[q.id] = 'Por favor responde esta pregunta antes de continuar.';
      }
    }

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      window.scrollTo({ top: 100, behavior: 'smooth' });
      return;
    }

    setValidationErrors({});
    // Limpiar error de esta sección si lo tenía
    setSectionsWithErrors((prev) => {
      const next = new Set(prev);
      next.delete(currentSection.id);
      return next;
    });

    if (draft.currentSectionIndex < sections.length - 1) {
      setCurrentSectionIndex(draft.currentSectionIndex + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      // ── Último paso: validar TODAS las secciones antes de completar ──
      const globalErrors = validateAllSections(schema, draft.answers, draft.tierMode);

      if (globalErrors.size > 0) {
        // Marcar secciones con errores
        setSectionsWithErrors(new Set(globalErrors.keys()));

        // Construir lista descriptiva para SweetAlert
        const sectionNames = Array.from(globalErrors.entries()).map(([secId, missing]) => {
          const sec = sections.find((s) => s.id === secId);
          return `<li><strong>${sec?.id}. ${sec?.title ?? secId}</strong>: ${missing.length} pregunta(s) pendiente(s)</li>`;
        });

        await Swal.fire({
          icon: 'warning',
          title: 'Hay secciones incompletas',
          html: `
            <p style="margin-bottom:12px;font-size:13px;color:#666">
              Para generar tu diagnóstico necesitamos que completes las preguntas obligatorias en las siguientes secciones:
            </p>
            <ul style="text-align:left;font-size:13px;line-height:1.7;list-style:disc;padding-left:20px">
              ${sectionNames.join('')}
            </ul>
          `,
          confirmButtonText: 'Ir a completar',
          confirmButtonColor: '#163A2B',
          customClass: { popup: 'rounded-2xl' },
        });

        // Navegar a la primera sección con errores
        const firstErrorIdx = sections.findIndex((s) => globalErrors.has(s.id));
        if (firstErrorIdx >= 0) {
          setCurrentSectionIndex(firstErrorIdx);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
        return;
      }

      // Todo validado – confirmar antes de finalizar
      const result = await Swal.fire({
        icon: 'question',
        title: '¿Finalizar el diagnóstico?',
        text: 'Una vez completo, podrás ver tu análisis de madurez digital y recomendaciones. Siempre puedes volver a editar las respuestas después.',
        showCancelButton: true,
        confirmButtonText: 'Finalizar y ver resultados',
        cancelButtonText: 'Seguir editando',
        confirmButtonColor: '#163A2B',
        cancelButtonColor: '#666',
        customClass: { popup: 'rounded-2xl' },
      });

      if (result.isConfirmed) {
        setSectionsWithErrors(new Set());
        await completeDiagnostic();
        navigate('/estadisticas');
      }
    }
  };

  /** Navegar a sección anterior */
  const handlePrevSection = () => {
    if (draft.currentSectionIndex > 0) {
      setValidationErrors({});
      setCurrentSectionIndex(draft.currentSectionIndex - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  /** Saltar directamente a una sección (validando que aceptó consentimiento) */
  const handleJumpToSection = (idx: number) => {
    if (draft.answers['K01'] || sections[idx].id === 'K') {
      setValidationErrors({});
      setCurrentSectionIndex(idx);
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

  /** Calcular cuántas preguntas requeridas visibles están respondidas en una sección */
  const getSectionCompletionStatus = useCallback(
    (sectionId: string): 'empty' | 'partial' | 'complete' => {
      const required = schema.questions.filter(
        (q) => q.section === sectionId && q.required && isQuestionVisible(q, draft.answers, draft.tierMode)
      );
      if (required.length === 0) return 'complete';
      const answeredCount = required.filter((q) => isAnswered(q, draft.answers)).length;
      if (answeredCount === 0) return 'empty';
      if (answeredCount === required.length) return 'complete';
      return 'partial';
    },
    [schema.questions, draft.answers, draft.tierMode]
  );

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

      {/* ── Stepper de Secciones (scrollable con flechas) ── */}
      <div className="bg-[#F8FAF9] border-b border-[#E0E0E0] relative">
        {/* Flecha izquierda */}
        {canScrollLeft && (
          <button
            type="button"
            onClick={() => scrollStepperBy('left')}
            className="absolute left-0 top-0 bottom-0 z-10 w-8 flex items-center justify-center bg-gradient-to-r from-[#F8FAF9] via-[#F8FAF9] to-transparent cursor-pointer border-none"
            aria-label="Desplazar secciones a la izquierda"
          >
            <ChevronLeft className="w-4 h-4 text-[#666]" />
          </button>
        )}

        {/* Contenedor scrollable */}
        <div
          ref={stepperContainerRef}
          className="px-4 py-3 flex gap-2 overflow-x-auto"
          style={{
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
            WebkitOverflowScrolling: 'touch',
            paddingLeft: canScrollLeft ? '2rem' : undefined,
            paddingRight: canScrollRight ? '2rem' : undefined,
          }}
        >
          <style>{`[data-stepper-scroll]::-webkit-scrollbar { display: none; }`}</style>
          {sections.map((sec, idx) => {
            const isActive = idx === draft.currentSectionIndex;
            const completion = getSectionCompletionStatus(sec.id);
            const hasError = sectionsWithErrors.has(sec.id);

            return (
              <button
                key={sec.id}
                type="button"
                ref={(el) => {
                  if (el) sectionButtonRefs.current.set(idx, el);
                  else sectionButtonRefs.current.delete(idx);
                }}
                onClick={() => handleJumpToSection(idx)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold shrink-0 transition-all cursor-pointer flex items-center gap-1.5 border whitespace-nowrap ${
                  isActive
                    ? 'bg-[#163A2B] text-white border-[#163A2B]'
                    : hasError
                    ? 'bg-red-50 text-red-700 border-red-300'
                    : completion === 'complete'
                    ? 'bg-[#E8F5EE] text-[#163A2B] border-[#86CEAB]/60'
                    : completion === 'partial'
                    ? 'bg-amber-50 text-amber-800 border-amber-300'
                    : 'bg-white text-[#666] border-[#E0E0E0]'
                }`}
              >
                <span>{sec.id}.</span>
                <span>{sec.title}</span>
                {hasError && !isActive && (
                  <AlertTriangle className="w-3 h-3 text-red-500" />
                )}
                {!hasError && completion === 'complete' && !isActive && (
                  <Check className="w-3 h-3 text-[#163A2B]" />
                )}
              </button>
            );
          })}
        </div>

        {/* Flecha derecha */}
        {canScrollRight && (
          <button
            type="button"
            onClick={() => scrollStepperBy('right')}
            className="absolute right-0 top-0 bottom-0 z-10 w-8 flex items-center justify-center bg-gradient-to-l from-[#F8FAF9] via-[#F8FAF9] to-transparent cursor-pointer border-none"
            aria-label="Desplazar secciones a la derecha"
          >
            <ChevronRight className="w-4 h-4 text-[#666]" />
          </button>
        )}
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

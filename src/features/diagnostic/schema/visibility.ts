import { Question, Answers } from './types';

/**
 * Determina si una pregunta debe mostrarse según el modo de tier y condiciones showIf
 */
export function isQuestionVisible(
  question: Question,
  answers: Answers,
  tierMode: 'core' | 'all'
): boolean {
  // 1. Filtrar por Tier (si estamos en modo core, omitir preguntas extended)
  if (tierMode === 'core' && question.tier === 'extended') {
    return false;
  }

  // 2. Evaluar condiciones showIf
  if (question.showIf) {
    const parentAnswer = answers[question.showIf.id];
    if (parentAnswer === undefined || parentAnswer === null) {
      return false;
    }

    if (Array.isArray(parentAnswer)) {
      const hasIntersection = parentAnswer.some((val) =>
        question.showIf!.in.includes(String(val))
      );
      if (!hasIntersection) return false;
    } else {
      if (!question.showIf.in.includes(String(parentAnswer))) {
        return false;
      }
    }
  }

  return true;
}

import { DiagnosticScores } from '@/features/diagnostic/schema/types';
import questionnaireSchema from '@/features/diagnostic/schema/questionnaire.v1.json';
import { computeScores } from './computeScores';

export interface StatsProvider {
  getBusinessStats(): DiagnosticScores | null;
}

export const LocalStatsProvider: StatsProvider = {
  getBusinessStats(): DiagnosticScores | null {
    try {
      const savedScores = localStorage.getItem('hera_latest_diagnostic_scores');
      if (savedScores) {
        return JSON.parse(savedScores);
      }

      // Si hay borrador guardado en localStorage, calcular puntajes en caliente
      const savedDraft = localStorage.getItem(`hera_diagnostic_draft_${questionnaireSchema.version}`);
      if (savedDraft) {
        const parsedDraft = JSON.parse(savedDraft);
        if (parsedDraft.answers && Object.keys(parsedDraft.answers).length > 2) {
          const calculated = computeScores(parsedDraft.answers, questionnaireSchema as any);
          return calculated;
        }
      }
    } catch (e) {
      console.warn('Error reading stats from storage', e);
    }
    return null;
  },
};

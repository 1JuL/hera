import { DiagnosticScores } from '@/features/diagnostic/schema/types';
import questionnaireSchema from '@/features/diagnostic/schema/questionnaire.v1.json';
import { computeScores } from './computeScores';

export interface BenchmarkData {
  sector: string;
  municipio: string;
  sampleSize: number;
  averageOverallIndex: number;
  topArea: string;
  weakestArea: string;
  digitalPaymentsAdoption: number;
}

export interface StatsProvider {
  getBusinessStats(): DiagnosticScores | null;
  getBenchmark(sector?: string, municipio?: string): BenchmarkData | null;
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

  getBenchmark(sector = 'Comercio al detal', municipio = 'Chía'): BenchmarkData | null {
    // Datos agregados del estudio de referencia Sabana Centro (simulado representativo para >= 10 negocios)
    return {
      sector,
      municipio,
      sampleSize: 42,
      averageOverallIndex: 38,
      topArea: 'Atención al Cliente (WhatsApp)',
      weakestArea: 'Contabilidad y Finanzas',
      digitalPaymentsAdoption: 64,
    };
  },
};

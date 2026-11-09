import type { QuestionnaireSchema, Question } from '@/features/diagnostic/schema/types';

// Small and predictable schema, so test results are easy to calculate by hand
export const miniSchema: QuestionnaireSchema = {
  version: 'test-1',
  title: 'Test',
  description: 'Small schema for unit tests',
  sections: [],
  questions: [
    // Two activities for the Sales area
    { id: 'E-VEN-01', section: 'E', area: 'VEN', tier: 'core', type: 'single', label: 'Registrar ventas' },
    { id: 'E-VEN-02', section: 'E', area: 'VEN', tier: 'core', type: 'single', label: 'Cotizar' },
    // Importance question of the Sales area (it must NOT count as an activity)
    { id: 'E-VEN-IMP', section: 'E', area: 'VEN', tier: 'core', type: 'scale', label: 'Importancia ventas' },
    // Two activities for the Finance area
    { id: 'E-FIN-01', section: 'E', area: 'FIN', tier: 'core', type: 'single', label: 'Facturar' },
    { id: 'E-FIN-02', section: 'E', area: 'FIN', tier: 'core', type: 'single', label: 'Llevar contabilidad' },
    { id: 'E-FIN-IMP', section: 'E', area: 'FIN', tier: 'core', type: 'scale', label: 'Importancia finanzas' },
  ] as Question[],
};

// Helper to build a question quickly in the tests
export function makeQuestion(overrides: Partial<Question>): Question {
  return {
    id: 'Q1',
    section: 'A',
    tier: 'core',
    type: 'text',
    label: 'Pregunta de prueba',
    ...overrides,
  } as Question;
}

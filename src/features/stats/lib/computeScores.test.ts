import { describe, it, expect } from 'vitest';
import { computeScores } from './computeScores';
import { miniSchema } from '@/test/fixtures';
import realSchema from '@/features/diagnostic/schema/questionnaire.v1.json';
import type { QuestionnaireSchema } from '@/features/diagnostic/schema/types';

describe('computeScores - madurez por área', () => {
  it('calcula la madurez como promedio de estados dividido entre 3', () => {
    // Sales area: states 0 and 3 -> (0 + 3) / (2 * 3) = 50%
    const result = computeScores(
      { 'E-VEN-01': '0', 'E-VEN-02': '3', 'E-VEN-IMP': 5 },
      miniSchema
    );
    expect(result.areas.VEN.maturityScore).toBe(50);
  });

  it('da 100% cuando todas las actividades están en estado 3', () => {
    const result = computeScores({ 'E-VEN-01': '3', 'E-VEN-02': '3' }, miniSchema);
    expect(result.areas.VEN.maturityScore).toBe(100);
  });

  it('da 0% cuando el área no tiene respuestas', () => {
    const result = computeScores({}, miniSchema);
    expect(result.areas.VEN.maturityScore).toBe(0);
  });

  it('no cuenta la pregunta de importancia (-IMP) como actividad', () => {
    const result = computeScores({ 'E-VEN-01': '1' }, miniSchema);
    // The schema has 2 activities for VEN and 1 importance question
    expect(result.areas.VEN.activitiesCount).toBe(2);
  });

  it('separa actividades manuales (0 o 1) de digitales (2 o 3)', () => {
    const result = computeScores(
      { 'E-VEN-01': '0', 'E-VEN-02': '2', 'E-FIN-01': '1', 'E-FIN-02': '3' },
      miniSchema
    );
    expect(result.areas.VEN.manualCount).toBe(1);
    expect(result.areas.VEN.digitalCount).toBe(1);
    expect(result.areas.FIN.manualCount).toBe(1);
    expect(result.areas.FIN.digitalCount).toBe(1);
  });

  it('ignora estados fuera del rango 0 a 3', () => {
    const result = computeScores({ 'E-VEN-01': '7', 'E-VEN-02': '-1' }, miniSchema);
    expect(result.areas.VEN.maturityScore).toBe(0);
    expect(result.areas.VEN.manualCount + result.areas.VEN.digitalCount).toBe(0);
  });

  it('ignora respuestas que no son números', () => {
    const result = computeScores({ 'E-VEN-01': 'abc' }, miniSchema);
    expect(result.areas.VEN.maturityScore).toBe(0);
  });
});

describe('computeScores - importancia', () => {
  it('usa 3 como importancia por defecto si no hay respuesta', () => {
    const result = computeScores({}, miniSchema);
    expect(result.areas.VEN.importance).toBe(3);
  });

  it.each([0, 6, 99, 'abc'])('usa 3 si la importancia es inválida (%s)', (bad) => {
    const result = computeScores({ 'E-VEN-IMP': bad as never }, miniSchema);
    expect(result.areas.VEN.importance).toBe(3);
  });

  it('respeta una importancia válida entre 1 y 5', () => {
    const result = computeScores({ 'E-VEN-IMP': 4 }, miniSchema);
    expect(result.areas.VEN.importance).toBe(4);
  });
});

describe('computeScores - brechas prioritarias', () => {
  it('marca brecha prioritaria solo si importancia >= 4 y estado <= 1', () => {
    const result = computeScores(
      { 'E-VEN-IMP': 4, 'E-VEN-01': '0', 'E-VEN-02': '3' },
      miniSchema
    );
    expect(result.priorityGaps).toHaveLength(1);
    expect(result.priorityGaps[0].activityId).toBe('E-VEN-01');
    expect(result.priorityGaps[0].currentStateLabel).toBe('No se realiza');
  });

  it('no crea brechas prioritarias si la importancia es 3', () => {
    const result = computeScores({ 'E-VEN-IMP': 3, 'E-VEN-01': '0' }, miniSchema);
    expect(result.priorityGaps).toHaveLength(0);
    // But the gap still appears in the area detail
    expect(result.areas.VEN.gaps).toHaveLength(1);
  });

  it('ordena por importancia descendente y luego por estado ascendente', () => {
    const result = computeScores(
      {
        'E-VEN-IMP': 4,
        'E-VEN-01': '1',
        'E-FIN-IMP': 5,
        'E-FIN-01': '1',
        'E-FIN-02': '0',
      },
      miniSchema
    );
    const order = result.priorityGaps.map((g) => g.activityId);
    // FIN (importance 5) first, and inside it state 0 before state 1
    expect(order).toEqual(['E-FIN-02', 'E-FIN-01', 'E-VEN-01']);
  });
});

describe('computeScores - índice general', () => {
  it('pondera la madurez de cada área por su importancia (cálculo a mano)', () => {
    // VEN: maturity 50, importance 5 -> 250
    // FIN: maturity 100, importance 1 -> 100
    // The 5 areas without questions: maturity 0, importance 3 each -> 0 points, 15 weight
    // Index = (250 + 100) / (5 + 1 + 15) = 350 / 21 = 16.67 -> 17
    const result = computeScores(
      {
        'E-VEN-01': '0', 'E-VEN-02': '3', 'E-VEN-IMP': 5,
        'E-FIN-01': '3', 'E-FIN-02': '3', 'E-FIN-IMP': 1,
      },
      miniSchema
    );
    expect(result.overallIndex).toBe(17);
  });

  it('devuelve 0 cuando no hay ninguna respuesta', () => {
    expect(computeScores({}, miniSchema).overallIndex).toBe(0);
  });

  it('mantiene el índice entre 0 y 100 con el cuestionario real', () => {
    // Fill every activity with the best state to get the upper limit
    const answers: Record<string, string> = {};
    for (const q of realSchema.questions) {
      if (q.section === 'E' && !q.id.endsWith('-IMP')) answers[q.id] = '3';
    }
    const result = computeScores(answers, realSchema as unknown as QuestionnaireSchema);
    expect(result.overallIndex).toBe(100);
  });
});

describe('computeScores - pagos, canales y herramientas', () => {
  it('calcula la proporción de pagos digitales', () => {
    const result = computeScores({ B07: ['efectivo', 'transferencia', 'nequi_daviplata', 'fiado'] }, miniSchema);
    expect(result.paymentAdoption.digitalMethods).toEqual(['transferencia', 'nequi_daviplata']);
    expect(result.paymentAdoption.traditionalMethods).toEqual(['efectivo', 'fiado']);
    expect(result.paymentAdoption.digitalRatio).toBe(0.5);
  });

  it('devuelve proporción 0 sin métodos de pago (sin dividir entre cero)', () => {
    const result = computeScores({}, miniSchema);
    expect(result.paymentAdoption.digitalRatio).toBe(0);
  });

  it('marca el canal principal de venta', () => {
    const result = computeScores({ B05: ['whatsapp', 'local_fisico'], B06: 'whatsapp' }, miniSchema);
    expect(result.salesChannels).toEqual([
      { channel: 'whatsapp', isMain: true },
      { channel: 'local_fisico', isMain: false },
    ]);
  });

  it('quita "ninguna" de la lista de herramientas en uso', () => {
    const result = computeScores({ F01: ['ninguna', 'canva'] }, miniSchema);
    expect(result.toolsInUse).toEqual(['canva']);
  });
});

describe('computeScores - orden financiero', () => {
  it('da 100 con las mejores respuestas financieras', () => {
    const result = computeScores(
      { B09: 'app_software', C01: 'si_con_registro', C05: 'costo_mas_margen', C07: 'si' },
      miniSchema
    );
    expect(result.financialDiscipline.score).toBe(100);
    expect(result.financialDiscipline.registersSales).toBe(true);
    expect(result.financialDiscipline.knowsCosts).toBe(true);
    expect(result.financialDiscipline.structuredPricing).toBe(true);
    expect(result.financialDiscipline.separatesPersonalFinances).toBe(true);
  });

  it('promedia solo los factores respondidos (cálculo a mano)', () => {
    // B09 cuaderno = 40 and C01 aproximadamente = 50 -> (40 + 50) / 2 = 45
    const result = computeScores({ B09: 'cuaderno', C01: 'aproximadamente' }, miniSchema);
    expect(result.financialDiscipline.score).toBe(45);
  });

  it('cuenta una respuesta negativa como factor con 0 puntos', () => {
    // B09 app_software = 100 and C07 no = 0 -> 50
    const result = computeScores({ B09: 'app_software', C07: 'no' }, miniSchema);
    expect(result.financialDiscipline.score).toBe(50);
  });
});

describe('computeScores - preparación tecnológica', () => {
  it('usa valores por defecto si faltan respuestas', () => {
    const result = computeScores({}, miniSchema);
    expect(result.techReadiness).toEqual({
      devices: [],
      internetType: 'No especificado',
      techComfortLevel: 3,
      monthlyBudgetCop: 'cero',
    });
  });
});

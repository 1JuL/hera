import {
  Answers,
  AreaId,
  DiagnosticScores,
  QuestionnaireSchema,
} from '@/features/diagnostic/schema/types';

const AREA_NAMES: Record<AreaId, string> = {
  VEN: 'Ventas y Comercial',
  MKT: 'Marketing y Comunicación',
  FIN: 'Contabilidad y Finanzas',
  RRH: 'Gestión de Personal (RRHH)',
  OPE: 'Operaciones e Inventario',
  CLI: 'Servicio al Cliente',
  ADM: 'Administración y Seguridad',
  LOG: 'Logística y Despachos',
  TEC: 'Tecnología e Infraestructura',
};

const STATE_LABELS: Record<number, string> = {
  0: 'No se realiza',
  1: 'Manual (papel o memoria)',
  2: 'Herramienta básica (Excel / chat)',
  3: 'Especializada (software)',
};

export function computeScores(
  answers: Answers,
  schema: QuestionnaireSchema
): DiagnosticScores {
  const areaIds: AreaId[] = ['VEN', 'MKT', 'FIN', 'RRH', 'OPE', 'CLI', 'ADM', 'LOG', 'TEC'];

  const areaScoresResult: DiagnosticScores['areas'] = {} as any;
  const priorityGaps: DiagnosticScores['priorityGaps'] = [];

  let totalWeightedMaturity = 0;
  let totalWeights = 0;

  for (const areaId of areaIds) {
    const areaQuestions = schema.questions.filter(
      (q) => q.section === 'E' && q.area === areaId && !q.id.endsWith('-IMP')
    );
    const impQuestionId = `E-${areaId}-IMP`;
    const importanceRaw = Number(answers[impQuestionId]);
    const importance = !isNaN(importanceRaw) && importanceRaw >= 1 && importanceRaw <= 5 ? importanceRaw : 3;

    let sumStates = 0;
    let answeredCount = 0;
    let manualCount = 0;
    let digitalCount = 0;
    const gaps: { id: string; name: string; state: number }[] = [];

    for (const q of areaQuestions) {
      const ansVal = answers[q.id];
      if (ansVal !== undefined && ansVal !== null && ansVal !== '') {
        const stateNum = Number(ansVal);
        if (!isNaN(stateNum) && stateNum >= 0 && stateNum <= 3) {
          sumStates += stateNum;
          answeredCount++;

          if (stateNum <= 1) {
            manualCount++;
            gaps.push({ id: q.id, name: q.label, state: stateNum });

            // Si el área tiene importancia alta (>= 4), clasifica como brecha prioritaria
            if (importance >= 4) {
              priorityGaps.push({
                areaId,
                activityId: q.id,
                activityName: q.label,
                currentState: stateNum,
                importance,
                currentStateLabel: STATE_LABELS[stateNum] || 'Manual / No sistematizado',
              });
            }
          } else {
            digitalCount++;
          }
        }
      }
    }

    // Madurez del área: promedio de estados (0 a 3) dividido entre 3 * 100
    const maturityScore =
      answeredCount > 0
        ? Math.round((sumStates / (answeredCount * 3)) * 100)
        : 0;

    totalWeightedMaturity += maturityScore * importance;
    totalWeights += importance;

    areaScoresResult[areaId] = {
      areaId,
      name: AREA_NAMES[areaId],
      maturityScore,
      importance,
      activitiesCount: areaQuestions.length,
      manualCount,
      digitalCount,
      gaps,
    };
  }

  // Ordenar brechas prioritarias por importancia descendente y estado ascendente
  priorityGaps.sort((a, b) => b.importance - a.importance || a.currentState - b.currentState);

  const overallIndex =
    totalWeights > 0 ? Math.round(totalWeightedMaturity / totalWeights) : 0;

  // Canales de venta
  const rawChannels = (answers['B05'] as string[]) || [];
  const mainChannel = (answers['B06'] as string) || '';
  const salesChannels = rawChannels.map((ch) => ({
    channel: ch,
    isMain: ch === mainChannel,
  }));

  // Adopción de pagos digitales
  const rawPayments = (answers['B07'] as string[]) || [];
  const digitalSet = new Set(['transferencia', 'nequi_daviplata', 'datafono', 'link_pago', 'pasarela_web']);
  const digitalMethods = rawPayments.filter((p) => digitalSet.has(p));
  const traditionalMethods = rawPayments.filter((p) => !digitalSet.has(p));
  const totalPayments = rawPayments.length;
  const digitalRatio = totalPayments > 0 ? digitalMethods.length / totalPayments : 0;

  // Orden financiero
  let finDisciplineSum = 0;
  let finFactorsCount = 0;

  const b09 = answers['B09'];
  const registersSales = b09 === 'excel_sheets' || b09 === 'app_software';
  if (b09) {
    finFactorsCount++;
    if (b09 === 'app_software') finDisciplineSum += 100;
    else if (b09 === 'excel_sheets') finDisciplineSum += 75;
    else if (b09 === 'cuaderno') finDisciplineSum += 40;
    else if (b09 === 'de_memoria') finDisciplineSum += 15;
  }

  const c01 = answers['C01'];
  const knowsCosts = c01 === 'si_con_registro';
  if (c01) {
    finFactorsCount++;
    if (c01 === 'si_con_registro') finDisciplineSum += 100;
    else if (c01 === 'aproximadamente') finDisciplineSum += 50;
  }

  const c05 = answers['C05'];
  const structuredPricing = c05 === 'costo_mas_margen';
  if (c05) {
    finFactorsCount++;
    if (c05 === 'costo_mas_margen') finDisciplineSum += 100;
    else if (c05 === 'lo_que_cliente_paga') finDisciplineSum += 40;
    else if (c05 === 'copia_competencia') finDisciplineSum += 30;
  }

  const c07 = answers['C07'];
  const separatesPersonalFinances = c07 === 'si';
  if (c07) {
    finFactorsCount++;
    if (c07 === 'si') finDisciplineSum += 100;
    else if (c07 === 'parcialmente') finDisciplineSum += 40;
  }

  const financialDisciplineScore =
    finFactorsCount > 0 ? Math.round(finDisciplineSum / finFactorsCount) : 0;

  // Herramientas en uso
  const toolsInUse = ((answers['F01'] as string[]) || []).filter((t) => t !== 'ninguna');

  // Preparación tecnológica
  const devices = (answers['G02'] as string[]) || [];
  const internetType = (answers['G01'] as string) || 'No especificado';
  const techComfortLevel = Number(answers['G03']) || 3;
  const monthlyBudgetCop = (answers['H05'] as string) || 'cero';

  return {
    overallIndex,
    areas: areaScoresResult,
    priorityGaps,
    salesChannels,
    paymentAdoption: {
      digitalMethods,
      traditionalMethods,
      digitalRatio,
    },
    financialDiscipline: {
      score: financialDisciplineScore,
      registersSales,
      knowsCosts,
      structuredPricing,
      separatesPersonalFinances,
    },
    toolsInUse,
    techReadiness: {
      devices,
      internetType,
      techComfortLevel,
      monthlyBudgetCop,
    },
  };
}

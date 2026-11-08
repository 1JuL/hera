import { Answers, Question, QuestionnaireSchema } from '../../schema/types';

export interface ImportErrorItem {
  row: number;
  id: string;
  label: string;
  value: any;
  reason: string;
}

export interface ImportValidationReport {
  success: boolean;
  version: string;
  totalQuestions: number;
  answeredCount: number;
  emptyCount: number;
  invalidCount: number;
  errors: ImportErrorItem[];
  parsedAnswers: Answers;
}

/**
 * Genera y descarga un archivo JSON con las respuestas para auditoría
 */
export function downloadJsonAudit(answers: Answers, schema: QuestionnaireSchema) {
  const auditData = {
    version: schema.version,
    exported_at: new Date().toISOString(),
    answers,
  };
  const blob = new Blob([JSON.stringify(auditData, null, 2)], {
    type: 'application/json',
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `cuestionario-senzaccento-respuestas-${schema.version}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

/**
 * Genera la plantilla o respuestas en formato CSV / Excel compatible
 * con hoja de Cuestionario, Instrucciones y metadatos
 */
export async function downloadExcelTemplateOrAnswers(
  schema: QuestionnaireSchema,
  existingAnswers?: Answers
) {
  const isAnswers = Boolean(existingAnswers && Object.keys(existingAnswers).length > 0);
  const fileName = isAnswers
    ? `cuestionario-senzaccento-respuestas-${schema.version}.csv`
    : `plantilla-cuestionario-senzaccento-${schema.version}.csv`;

  // Construcción en formato CSV estructurado con codificación UTF-8 BOM
  const headers = ['ID', 'Sección', 'Tier', 'Tipo', 'Pregunta', 'Respuesta', 'Opciones / Ayuda'];
  const rows: string[][] = [headers];

  for (const q of schema.questions) {
    let answerText = '';
    if (existingAnswers && existingAnswers[q.id] !== undefined && existingAnswers[q.id] !== null) {
      const val = existingAnswers[q.id];
      if (Array.isArray(val)) {
        answerText = val.join(', ');
      } else {
        answerText = String(val);
      }
    }

    const optionsText = q.options
      ? q.options.map((o) => `${o.value}: ${o.label}`).join(' | ')
      : q.help || '';

    rows.push([
      q.id,
      q.section,
      q.tier,
      q.type,
      `"${q.label.replace(/"/g, '""')}"`,
      `"${answerText.replace(/"/g, '""')}"`,
      `"${optionsText.replace(/"/g, '""')}"`,
    ]);
  }

  // Fila de metadatos al final
  rows.push([]);
  rows.push(['_meta', 'version', schema.version, 'exported_at', new Date().toISOString()]);

  const csvContent = '\uFEFF' + rows.map((r) => r.join(';')).join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  a.click();
  URL.revokeObjectURL(url);
}

/**
 * Parsea un archivo importado (.csv o .json o .xlsx)
 */
export async function parseImportFile(
  file: File,
  schema: QuestionnaireSchema
): Promise<ImportValidationReport> {
  const fileExt = file.name.split('.').pop()?.toLowerCase();

  if (fileExt === 'json') {
    return parseJsonImport(await file.text(), schema);
  }

  // Si es CSV o archivo delimitado
  const textContent = await file.text();
  return parseCsvImport(textContent, schema);
}

function parseJsonImport(jsonText: string, schema: QuestionnaireSchema): ImportValidationReport {
  const errors: ImportErrorItem[] = [];
  const parsedAnswers: Answers = {};

  try {
    const data = JSON.parse(jsonText);
    const incomingVersion = data.version || data.questionnaire_version || '1.0.0';
    const rawAnswers = data.answers || data;

    let answeredCount = 0;
    let emptyCount = 0;
    let invalidCount = 0;

    for (const q of schema.questions) {
      const rawVal = rawAnswers[q.id];
      if (rawVal === undefined || rawVal === null || rawVal === '') {
        emptyCount++;
        continue;
      }

      // Validar tipo y opciones
      const validation = validateQuestionValue(q, rawVal);
      if (validation.valid) {
        parsedAnswers[q.id] = validation.normalizedValue;
        answeredCount++;
      } else {
        invalidCount++;
        errors.push({
          row: 0,
          id: q.id,
          label: q.label,
          value: rawVal,
          reason: validation.reason,
        });
      }
    }

    return {
      success: errors.length === 0,
      version: incomingVersion,
      totalQuestions: schema.questions.length,
      answeredCount,
      emptyCount,
      invalidCount,
      errors,
      parsedAnswers,
    };
  } catch (err: any) {
    return {
      success: false,
      version: 'desconocida',
      totalQuestions: schema.questions.length,
      answeredCount: 0,
      emptyCount: schema.questions.length,
      invalidCount: 1,
      errors: [
        {
          row: 0,
          id: 'FILE',
          label: 'Estructura JSON',
          value: null,
          reason: 'El archivo JSON no tiene un formato válido.',
        },
      ],
      parsedAnswers: {},
    };
  }
}

function parseCsvImport(csvText: string, schema: QuestionnaireSchema): ImportValidationReport {
  const errors: ImportErrorItem[] = [];
  const parsedAnswers: Answers = {};

  const lines = csvText.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  let detectedVersion = schema.version;

  const questionsById = new Map(schema.questions.map((q) => [q.id, q]));
  const incomingMap = new Map<string, { value: string; row: number }>();

  let rowIndex = 0;
  for (const line of lines) {
    rowIndex++;
    // Separar por ; o ,
    const delimiter = line.includes(';') ? ';' : ',';
    const columns = parseCsvLine(line, delimiter);

    if (columns.length < 2) continue;

    const firstCol = columns[0].trim();
    if (firstCol === '_meta') {
      if (columns[2]) detectedVersion = columns[2].trim();
      continue;
    }

    if (firstCol === 'ID' || firstCol.toLowerCase() === 'id') {
      continue;
    }

    // Si es un ID de pregunta válido
    if (questionsById.has(firstCol)) {
      // La columna de respuesta suele ser la 5 (índice 5)
      const answerVal = columns[5] !== undefined ? columns[5].trim() : (columns[1] || '').trim();
      incomingMap.set(firstCol, { value: answerVal, row: rowIndex });
    }
  }

  let answeredCount = 0;
  let emptyCount = 0;
  let invalidCount = 0;

  for (const q of schema.questions) {
    const item = incomingMap.get(q.id);
    if (!item || item.value === '') {
      emptyCount++;
      continue;
    }

    const validation = validateQuestionValue(q, item.value);
    if (validation.valid) {
      parsedAnswers[q.id] = validation.normalizedValue;
      answeredCount++;
    } else {
      invalidCount++;
      errors.push({
        row: item.row,
        id: q.id,
        label: q.label,
        value: item.value,
        reason: validation.reason,
      });
    }
  }

  return {
    success: errors.length === 0,
    version: detectedVersion,
    totalQuestions: schema.questions.length,
    answeredCount,
    emptyCount,
    invalidCount,
    errors,
    parsedAnswers,
  };
}

function validateQuestionValue(
  q: Question,
  rawVal: any
): { valid: boolean; normalizedValue?: any; reason: string } {
  if (rawVal === undefined || rawVal === null || rawVal === '') {
    return { valid: false, reason: 'Valor vacío' };
  }

  if (q.type === 'boolean') {
    const str = String(rawVal).toLowerCase().trim();
    if (str === 'true' || str === 'sí' || str === 'si' || str === '1') {
      return { valid: true, normalizedValue: true, reason: '' };
    }
    if (str === 'false' || str === 'no' || str === '0') {
      return { valid: true, normalizedValue: false, reason: '' };
    }
    return { valid: false, reason: 'Debe ser Sí o No (Verdadero o Falso)' };
  }

  if (q.type === 'scale') {
    const num = Number(rawVal);
    if (!isNaN(num) && num >= 1 && num <= 5) {
      return { valid: true, normalizedValue: num, reason: '' };
    }
    return { valid: false, reason: 'Debe ser un número en la escala del 1 al 5' };
  }

  if (q.type === 'single' || q.type === 'range') {
    const str = String(rawVal).trim();
    if (!q.options || q.options.length === 0) {
      return { valid: true, normalizedValue: str, reason: '' };
    }
    // Buscar coincidencia por value o por label
    const match = q.options.find(
      (opt) =>
        opt.value.toLowerCase() === str.toLowerCase() ||
        opt.label.toLowerCase() === str.toLowerCase() ||
        str.toLowerCase().startsWith(opt.value.toLowerCase() + ':')
    );
    if (match) {
      return { valid: true, normalizedValue: match.value, reason: '' };
    }
    return {
      valid: false,
      reason: `"${str}" no es una opción válida para esta pregunta.`,
    };
  }

  if (q.type === 'multi') {
    let items: string[] = [];
    if (Array.isArray(rawVal)) {
      items = rawVal.map(String);
    } else {
      items = String(rawVal)
        .split(/[,|]/)
        .map((s) => s.trim())
        .filter(Boolean);
    }

    if (!q.options) {
      return { valid: true, normalizedValue: items, reason: '' };
    }

    const matchedValues: string[] = [];
    for (const item of items) {
      const match = q.options.find(
        (opt) =>
          opt.value.toLowerCase() === item.toLowerCase() ||
          opt.label.toLowerCase() === item.toLowerCase()
      );
      if (match) {
        matchedValues.push(match.value);
      }
    }

    if (matchedValues.length > 0) {
      return { valid: true, normalizedValue: matchedValues, reason: '' };
    }
    return {
      valid: false,
      reason: 'Ninguna de las opciones ingresadas coincide con las opciones permitidas.',
    };
  }

  return { valid: true, normalizedValue: String(rawVal), reason: '' };
}

function parseCsvLine(line: string, delimiter: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === delimiter && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current);
  return result;
}

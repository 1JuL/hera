// @vitest-environment node
import { describe, it, expect } from 'vitest';
import { parseImportFile } from './excelService';
import { makeQuestion } from '@/test/fixtures';
import type { QuestionnaireSchema } from '@/features/diagnostic/schema/types';

// Small schema with one question of each important type
const schema: QuestionnaireSchema = {
  version: '1.0.0',
  title: 'Test',
  description: '',
  sections: [],
  questions: [
    makeQuestion({
      id: 'A05',
      type: 'single',
      label: 'Formalidad',
      options: [
        { value: 'rut', label: 'Tiene RUT' },
        { value: 'sin_registro', label: 'Sin registro' },
      ],
    }),
    makeQuestion({
      id: 'B07',
      type: 'multi',
      label: 'Pagos',
      options: [
        { value: 'efectivo', label: 'Efectivo' },
        { value: 'transferencia', label: 'Transferencia' },
      ],
    }),
    makeQuestion({ id: 'G03', type: 'scale', label: 'Comodidad' }),
    makeQuestion({ id: 'K01', type: 'boolean', label: 'Acepto' }),
  ],
};

// Helper to create a File like the browser would give us
const makeFile = (name: string, content: string) => new File([content], name);

describe('parseImportFile - JSON', () => {
  it('importa respuestas válidas desde un objeto con "answers"', async () => {
    const file = makeFile(
      'respuestas.json',
      JSON.stringify({ version: '1.0.0', answers: { A05: 'rut', B07: ['efectivo'], G03: 4, K01: true } })
    );
    const report = await parseImportFile(file, schema);
    expect(report.success).toBe(true);
    expect(report.answeredCount).toBe(4);
    expect(report.parsedAnswers).toEqual({ A05: 'rut', B07: ['efectivo'], G03: 4, K01: true });
  });

  it('reporta error claro cuando el JSON está dañado', async () => {
    const report = await parseImportFile(makeFile('malo.json', '{ esto no es json'), schema);
    expect(report.success).toBe(false);
    expect(report.errors[0].reason).toBe('El archivo JSON no tiene un formato válido.');
  });

  it('rechaza una opción que no existe en la pregunta', async () => {
    const report = await parseImportFile(makeFile('r.json', JSON.stringify({ A05: 'inventada' })), schema);
    expect(report.success).toBe(false);
    expect(report.invalidCount).toBe(1);
    expect(report.errors[0].id).toBe('A05');
  });

  it('rechaza una escala fuera del rango 1 a 5', async () => {
    const report = await parseImportFile(makeFile('r.json', JSON.stringify({ G03: 9 })), schema);
    expect(report.errors[0].reason).toBe('Debe ser un número en la escala del 1 al 5');
  });

  it('cuenta las preguntas vacías', async () => {
    const report = await parseImportFile(makeFile('r.json', JSON.stringify({ A05: 'rut' })), schema);
    expect(report.answeredCount).toBe(1);
    expect(report.emptyCount).toBe(3);
  });

  it('acepta "sí" y "no" como valores booleanos', async () => {
    const yes = await parseImportFile(makeFile('r.json', JSON.stringify({ K01: 'sí' })), schema);
    const no = await parseImportFile(makeFile('r.json', JSON.stringify({ K01: 'no' })), schema);
    expect(yes.parsedAnswers.K01).toBe(true);
    expect(no.parsedAnswers.K01).toBe(false);
  });
});

describe('parseImportFile - CSV', () => {
  it('importa filas separadas por coma usando la segunda columna', async () => {
    const csv = 'ID,Respuesta\nA05,rut\nG03,5';
    const report = await parseImportFile(makeFile('r.csv', csv), schema);
    expect(report.parsedAnswers).toEqual({ A05: 'rut', G03: 5 });
  });

  it('acepta punto y coma como separador', async () => {
    const report = await parseImportFile(makeFile('r.csv', 'A05;sin_registro'), schema);
    expect(report.parsedAnswers.A05).toBe('sin_registro');
  });

  it('separa opciones múltiples con coma dentro de comillas', async () => {
    const report = await parseImportFile(makeFile('r.csv', 'B07,"efectivo, transferencia"'), schema);
    expect(report.parsedAnswers.B07).toEqual(['efectivo', 'transferencia']);
  });

  it('lee la versión desde la fila _meta', async () => {
    const report = await parseImportFile(makeFile('r.csv', '_meta,version,9.9.9\nA05,rut'), schema);
    expect(report.version).toBe('9.9.9');
  });

  it('acepta la etiqueta de la opción además del valor', async () => {
    const report = await parseImportFile(makeFile('r.csv', 'A05,Tiene RUT'), schema);
    expect(report.parsedAnswers.A05).toBe('rut');
  });

  it('ignora ids que no existen en el cuestionario', async () => {
    const report = await parseImportFile(makeFile('r.csv', 'ZZZ,hola'), schema);
    expect(report.answeredCount).toBe(0);
  });

  it('reporta la fila del error cuando un valor es inválido', async () => {
    const report = await parseImportFile(makeFile('r.csv', 'ID,Respuesta\nA05,inventada'), schema);
    expect(report.errors[0].row).toBe(2);
  });

  it('maneja un archivo vacío sin lanzar error', async () => {
    const report = await parseImportFile(makeFile('vacio.csv', ''), schema);
    expect(report.answeredCount).toBe(0);
    expect(report.emptyCount).toBe(schema.questions.length);
  });
});

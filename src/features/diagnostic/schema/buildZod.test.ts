import { describe, it, expect } from 'vitest';
import { buildZodSchemaForQuestions } from './buildZod';
import { makeQuestion } from '@/test/fixtures';

// Small helper: returns the first error message or null if data is valid
function firstError(schema: ReturnType<typeof buildZodSchemaForQuestions>, data: unknown) {
  const result = schema.safeParse(data);
  return result.success ? null : result.error.issues[0].message;
}

describe('buildZodSchemaForQuestions - campos obligatorios', () => {
  it('rechaza un texto obligatorio vacío con mensaje en español', () => {
    const q = makeQuestion({ id: 'T1', type: 'text', required: true });
    const schema = buildZodSchemaForQuestions([q], {}, 'all');
    expect(firstError(schema, { T1: '' })).toBe('Por favor ingrese una respuesta');
  });

  it('acepta un texto obligatorio con contenido', () => {
    const q = makeQuestion({ id: 'T1', type: 'text', required: true });
    const schema = buildZodSchemaForQuestions([q], {}, 'all');
    expect(schema.safeParse({ T1: 'Mi negocio' }).success).toBe(true);
  });

  it('exige aceptar los términos (boolean obligatorio debe ser true)', () => {
    const q = makeQuestion({ id: 'K01', type: 'boolean', required: true });
    const schema = buildZodSchemaForQuestions([q], {}, 'all');
    expect(firstError(schema, { K01: false })).toBe('Debe aceptar los términos para continuar');
    expect(schema.safeParse({ K01: true }).success).toBe(true);
  });

  it('rechaza una selección única vacía si es obligatoria', () => {
    const q = makeQuestion({ id: 'S1', type: 'single', required: true });
    const schema = buildZodSchemaForQuestions([q], {}, 'all');
    expect(firstError(schema, { S1: '' })).toBe('Por favor seleccione una opción');
  });

  it('rechaza una lista múltiple vacía si es obligatoria', () => {
    const q = makeQuestion({ id: 'M1', type: 'multi', required: true });
    const schema = buildZodSchemaForQuestions([q], {}, 'all');
    expect(firstError(schema, { M1: [] })).toBe('Seleccione al menos una opción');
  });

  it('limita la escala entre 1 y 5', () => {
    const q = makeQuestion({ id: 'E1', type: 'scale', required: true });
    const schema = buildZodSchemaForQuestions([q], {}, 'all');
    expect(firstError(schema, { E1: 0 })).toBe('Calificación mínima es 1');
    expect(firstError(schema, { E1: 6 })).toBe('Calificación máxima es 5');
    expect(schema.safeParse({ E1: 3 }).success).toBe(true);
  });

  it('rechaza un número obligatorio que llega como texto', () => {
    const q = makeQuestion({ id: 'N1', type: 'number', required: true });
    const schema = buildZodSchemaForQuestions([q], {}, 'all');
    expect(firstError(schema, { N1: 'abc' })).toBe('Por favor ingrese un número válido');
  });
});

describe('buildZodSchemaForQuestions - campos opcionales y ocultos', () => {
  it('acepta que falte un campo opcional', () => {
    const q = makeQuestion({ id: 'T1', type: 'text', required: false });
    const schema = buildZodSchemaForQuestions([q], {}, 'all');
    expect(schema.safeParse({}).success).toBe(true);
  });

  it('no valida una pregunta extended cuando el modo es core', () => {
    const q = makeQuestion({ id: 'T1', type: 'text', required: true, tier: 'extended' });
    const schema = buildZodSchemaForQuestions([q], {}, 'core');
    // The question is hidden, so the empty answer is fine
    expect(schema.safeParse({}).success).toBe(true);
  });

  it('no valida una pregunta oculta por showIf', () => {
    const q = makeQuestion({ id: 'T2', type: 'text', required: true, showIf: { id: 'T1', in: ['si'] } });
    const schema = buildZodSchemaForQuestions([q], { T1: 'no' }, 'all');
    expect(schema.safeParse({}).success).toBe(true);
  });
});

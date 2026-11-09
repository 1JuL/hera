import { describe, it, expect } from 'vitest';
import { isQuestionVisible, getVisibleQuestionsForSection } from './visibility';
import { makeQuestion } from '@/test/fixtures';

describe('isQuestionVisible - nivel (tier)', () => {
  it('muestra preguntas core en modo core', () => {
    expect(isQuestionVisible(makeQuestion({ tier: 'core' }), {}, 'core')).toBe(true);
  });

  it('oculta preguntas extended en modo core', () => {
    expect(isQuestionVisible(makeQuestion({ tier: 'extended' }), {}, 'core')).toBe(false);
  });

  it('muestra preguntas extended en modo all', () => {
    expect(isQuestionVisible(makeQuestion({ tier: 'extended' }), {}, 'all')).toBe(true);
  });
});

describe('isQuestionVisible - condición showIf', () => {
  const child = makeQuestion({ id: 'Q2', showIf: { id: 'Q1', in: ['si'] } });

  it('oculta la pregunta si la respuesta padre no existe', () => {
    expect(isQuestionVisible(child, {}, 'all')).toBe(false);
  });

  it('oculta la pregunta si la respuesta padre es null', () => {
    expect(isQuestionVisible(child, { Q1: null }, 'all')).toBe(false);
  });

  it('muestra la pregunta si la respuesta padre coincide', () => {
    expect(isQuestionVisible(child, { Q1: 'si' }, 'all')).toBe(true);
  });

  it('oculta la pregunta si la respuesta padre no coincide', () => {
    expect(isQuestionVisible(child, { Q1: 'no' }, 'all')).toBe(false);
  });

  it('funciona cuando la respuesta padre es una lista (multi)', () => {
    expect(isQuestionVisible(child, { Q1: ['no', 'si'] }, 'all')).toBe(true);
    expect(isQuestionVisible(child, { Q1: ['no'] }, 'all')).toBe(false);
  });

  it('funciona cuando la respuesta padre es un número', () => {
    const numberChild = makeQuestion({ id: 'Q3', showIf: { id: 'Q1', in: ['1'] } });
    expect(isQuestionVisible(numberChild, { Q1: 1 }, 'all')).toBe(true);
  });
});

describe('getVisibleQuestionsForSection', () => {
  it('devuelve solo las preguntas visibles de la sección pedida', () => {
    const questions = [
      makeQuestion({ id: 'A01', section: 'A' }),
      makeQuestion({ id: 'A02', section: 'A', tier: 'extended' }),
      makeQuestion({ id: 'B01', section: 'B' }),
    ];
    const ids = getVisibleQuestionsForSection(questions, 'A', {}, 'core').map((q) => q.id);
    expect(ids).toEqual(['A01']);
  });
});

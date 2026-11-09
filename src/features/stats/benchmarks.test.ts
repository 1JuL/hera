import { describe, it, expect } from 'vitest';
import { BENCHMARKS, USER_FLAGS } from './benchmarks';
import realSchema from '@/features/diagnostic/schema/questionnaire.v1.json';

describe('USER_FLAGS - respuestas vacías', () => {
  it('devuelve null en todos los indicadores cuando no hay respuestas', () => {
    for (const [id, flag] of Object.entries(USER_FLAGS)) {
      expect(flag({}), `indicador ${id}`).toBeNull();
    }
  });
});

describe('USER_FLAGS - casos concretos', () => {
  it('uso_internet es true con datos móviles o fibra, false con ninguno', () => {
    expect(USER_FLAGS.uso_internet({ G01: 'datos_moviles' })).toBe(true);
    expect(USER_FLAGS.uso_internet({ G01: 'fijo_fibra' })).toBe(true);
    expect(USER_FLAGS.uso_internet({ G01: 'ninguno' })).toBe(false);
  });

  it('uso_celular depende de que exista smartphone en G02', () => {
    expect(USER_FLAGS.uso_celular({ G02: ['smartphone', 'tablet'] })).toBe(true);
    expect(USER_FLAGS.uso_celular({ G02: ['computador'] })).toBe(false);
  });

  it('uso_computador acepta computador o tablet', () => {
    expect(USER_FLAGS.uso_computador({ G02: ['tablet'] })).toBe(true);
    expect(USER_FLAGS.uso_computador({ G02: ['smartphone'] })).toBe(false);
  });

  it('registro_contable distingue registro de no registro', () => {
    expect(USER_FLAGS.registro_contable({ B09: 'cuaderno' })).toBe(true);
    expect(USER_FLAGS.registro_contable({ B09: 'de_memoria' })).toBe(false);
    expect(USER_FLAGS.registro_contable({ B09: 'no_registra' })).toBe(false);
  });

  it('formalidad_rut y camara_comercio usan la misma pregunta A05', () => {
    expect(USER_FLAGS.formalidad_rut({ A05: 'rut' })).toBe(true);
    expect(USER_FLAGS.camara_comercio({ A05: 'rut' })).toBe(false);
    expect(USER_FLAGS.camara_comercio({ A05: 'rut_camara' })).toBe(true);
    expect(USER_FLAGS.formalidad_rut({ A05: 'sin_registro' })).toBe(false);
  });

  it('mas_de_una_persona es false solo cuando A06 es "1"', () => {
    expect(USER_FLAGS.mas_de_una_persona({ A06: '1' })).toBe(false);
    expect(USER_FLAGS.mas_de_una_persona({ A06: '2_3' })).toBe(true);
  });

  it('facturacion_electronica es true con Siigo o Alegra', () => {
    expect(USER_FLAGS.facturacion_electronica({ F01: ['siigo'] })).toBe(true);
    expect(USER_FLAGS.facturacion_electronica({ F01: ['canva'], 'E-FIN-01': '1' })).toBe(false);
  });

  it('madurez_digital_avanzada es true con IA frecuente o 4 herramientas o más', () => {
    expect(USER_FLAGS.madurez_digital_avanzada({ G04: 'frecuente' })).toBe(true);
    expect(USER_FLAGS.madurez_digital_avanzada({ F01: ['a', 'b', 'c', 'd'] })).toBe(true);
    expect(USER_FLAGS.madurez_digital_avanzada({ G04: 'no_conoce', F01: ['a'] })).toBe(false);
  });
});

describe('USER_FLAGS - presupuesto_tic', () => {
  it('es false cuando ambos presupuestos son "cero"', () => {
    expect(USER_FLAGS.presupuesto_tic({ F02: 'cero', H05: 'cero' })).toBe(false);
  });

  it('es true cuando H05 tiene presupuesto', () => {
    expect(USER_FLAGS.presupuesto_tic({ H05: '50k_150k' })).toBe(true);
  });

  // KNOWN DEFECT: an empty F02 is treated as "has budget" even if H05 says "cero".
  // Remove "it.fails" when the bug is fixed in benchmarks.ts.
  it.fails('es false cuando F02 está vacío y H05 es "cero"', () => {
    expect(USER_FLAGS.presupuesto_tic({ F02: '', H05: 'cero' })).toBe(false);
  });
});

describe('Consistencia entre BENCHMARKS, USER_FLAGS y el cuestionario', () => {
  it('cada indicador de BENCHMARKS tiene una función en USER_FLAGS', () => {
    // Indicators without a flag could not be compared with the user data
    const missing = BENCHMARKS.map((b) => b.id).filter((id) => !(id in USER_FLAGS));
    expect(missing).toEqual([]);
  });

  it('los ids de BENCHMARKS son únicos', () => {
    const ids = BENCHMARKS.map((b) => b.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('todos los valores de referencia están entre 0 y 100', () => {
    for (const b of BENCHMARKS) {
      for (const [segment, value] of Object.entries(b.values)) {
        expect(value, `${b.id}/${segment}`).toBeGreaterThanOrEqual(0);
        expect(value, `${b.id}/${segment}`).toBeLessThanOrEqual(100);
      }
    }
  });

  it('cada indicador declara fuente y año', () => {
    for (const b of BENCHMARKS) {
      expect(b.source, b.id).toBeTruthy();
      expect(b.year, b.id).toBeGreaterThan(2000);
    }
  });

  it('el cuestionario no tiene ids de pregunta repetidos', () => {
    const ids = realSchema.questions.map((q) => q.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('toda pregunta single, multi o range tiene opciones', () => {
    const withoutOptions = realSchema.questions
      .filter((q) => ['single', 'multi', 'range'].includes(q.type))
      .filter((q) => !('options' in q) || (q as { options: unknown[] }).options.length === 0)
      .map((q) => q.id);
    expect(withoutOptions).toEqual([]);
  });
});

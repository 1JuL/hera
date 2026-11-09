import { describe, it, expect, beforeEach, vi } from 'vitest';
import { LocalStatsProvider } from './StatsProvider';
import questionnaireSchema from '@/features/diagnostic/schema/questionnaire.v1.json';

const DRAFT_KEY = `hera_diagnostic_draft_${questionnaireSchema.version}`;

describe('LocalStatsProvider.getBusinessStats', () => {
  beforeEach(() => {
    // Start every test with empty storage
    localStorage.clear();
  });

  it('devuelve null si no hay nada guardado', () => {
    expect(LocalStatsProvider.getBusinessStats()).toBeNull();
  });

  it('devuelve los puntajes guardados si existen', () => {
    localStorage.setItem('hera_latest_diagnostic_scores', JSON.stringify({ overallIndex: 42 }));
    expect(LocalStatsProvider.getBusinessStats()?.overallIndex).toBe(42);
  });

  it('calcula los puntajes desde un borrador con suficientes respuestas', () => {
    const answers = { A01: 'x', A02: 'y', A03: 'z', 'E-VEN-01': '3' };
    localStorage.setItem(DRAFT_KEY, JSON.stringify({ answers }));
    const stats = LocalStatsProvider.getBusinessStats();
    expect(stats).not.toBeNull();
    expect(stats?.areas.VEN.maturityScore).toBeGreaterThan(0);
  });

  it('ignora un borrador con 2 respuestas o menos', () => {
    localStorage.setItem(DRAFT_KEY, JSON.stringify({ answers: { A01: 'x', A02: 'y' } }));
    expect(LocalStatsProvider.getBusinessStats()).toBeNull();
  });

  it('no se rompe si el JSON guardado está dañado', () => {
    // Silence the expected warning so the test output stays clean
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    localStorage.setItem('hera_latest_diagnostic_scores', '{dañado');
    expect(LocalStatsProvider.getBusinessStats()).toBeNull();
    expect(warn).toHaveBeenCalled();
    warn.mockRestore();
  });
});

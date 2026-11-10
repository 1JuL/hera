import { useState, useEffect, useCallback, useRef } from 'react';
import { Answers, DiagnosticDraft } from '../schema/types';
import questionnaireSchema from '../schema/questionnaire.v1.json';
import { supabase } from '@/lib/supabase';
import { computeScores } from '@/features/stats/lib/computeScores';

const STORAGE_KEY = `hera_diagnostic_draft_${questionnaireSchema.version}`;

const INITIAL_DRAFT: DiagnosticDraft = {
  version_id: questionnaireSchema.version,
  answers: {
    K01: false, // Consentimiento no marcado por defecto
  },
  tierMode: 'core',
  currentSectionIndex: 0,
  status: 'draft',
  updated_at: new Date().toISOString(),
};

export function useDraftResponse() {
  const [draft, setDraft] = useState<DiagnosticDraft>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.version_id === questionnaireSchema.version) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Error reading diagnostic draft from localStorage', e);
    }
    return INITIAL_DRAFT;
  });

  const debounceTimerRef = useRef<number | null>(null);

  // Sincronizar borrador desde Supabase al iniciar sesión si existe
  useEffect(() => {
    async function fetchRemoteDraft() {
      try {
        const { data: sessionData } = await supabase.auth.getSession();
        if (sessionData?.session?.user) {
          const { data, error } = await supabase
            .from('questionnaire_responses')
            .select('*')
            .eq('owner_id', sessionData.session.user.id)
            .eq('version_id', questionnaireSchema.version)
            .maybeSingle();

          if (!error && data && data.answers && Object.keys(data.answers).length > 1) {
            setDraft((prev) => {
              const remoteDate = new Date(data.updated_at).getTime();
              const localDate = new Date(prev.updated_at).getTime();
              if (remoteDate > localDate || Object.keys(prev.answers).length <= 1) {
                return {
                  version_id: data.version_id,
                  answers: data.answers,
                  tierMode: prev.tierMode,
                  currentSectionIndex: prev.currentSectionIndex,
                  status: data.status,
                  updated_at: data.updated_at,
                  completed_at: data.completed_at,
                };
              }
              return prev;
            });
          }
        }
      } catch (err) {
        // En modo local continuar sin interrupciones
      }
    }

    fetchRemoteDraft();
  }, []);

  // Guardar en localStorage inmediatamente
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
    } catch (e) {
      console.warn('Error writing diagnostic draft to localStorage', e);
    }

    // Debounce de 1 segundo para sincronizar con Supabase si hay sesión
    if (debounceTimerRef.current) {
      window.clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = window.setTimeout(async () => {
      try {
        const { data: sessionData } = await supabase.auth.getSession();
        if (sessionData?.session?.user) {
          // Si hay usuario logueado en Supabase, guardar/actualizar borrador en la nube
          await supabase.from('questionnaire_responses').upsert(
            {
              owner_id: sessionData.session.user.id,
              version_id: draft.version_id,
              answers: draft.answers,
              status: draft.status,
              updated_at: draft.updated_at,
            },
            { onConflict: 'owner_id,version_id' }
          );
        }
      } catch (err) {
        // En modo local/offline no bloquear al usuario
      }
    }, 1000);

    return () => {
      if (debounceTimerRef.current) {
        window.clearTimeout(debounceTimerRef.current);
      }
    };
  }, [draft]);

  const setAnswer = useCallback((questionId: string, value: any) => {
    setDraft((prev) => ({
      ...prev,
      answers: {
        ...prev.answers,
        [questionId]: value,
      },
      updated_at: new Date().toISOString(),
    }));
  }, []);

  const setAnswers = useCallback((newAnswers: Answers) => {
    setDraft((prev) => ({
      ...prev,
      answers: {
        ...prev.answers,
        ...newAnswers,
      },
      updated_at: new Date().toISOString(),
    }));
  }, []);

  const setTierMode = useCallback((tierMode: 'core' | 'all') => {
    setDraft((prev) => ({
      ...prev,
      tierMode,
      updated_at: new Date().toISOString(),
    }));
  }, []);

  const setCurrentSectionIndex = useCallback((currentSectionIndex: number) => {
    setDraft((prev) => ({
      ...prev,
      currentSectionIndex,
      updated_at: new Date().toISOString(),
    }));
  }, []);

  const completeDiagnostic = useCallback(async () => {
    const scores = computeScores(draft.answers, questionnaireSchema as any);
    const completedAt = new Date().toISOString();

    const completedDraft: DiagnosticDraft = {
      ...draft,
      status: 'completed',
      completed_at: completedAt,
      updated_at: completedAt,
    };

    setDraft(completedDraft);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(completedDraft));
    localStorage.setItem('hera_latest_diagnostic_scores', JSON.stringify(scores));

    // Si Supabase está disponible, persistir en diagnostics
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      if (sessionData?.session?.user) {
        await supabase.from('diagnostics').insert({
          owner_id: sessionData.session.user.id,
          scores,
          engine_version: questionnaireSchema.version,
          created_at: completedAt,
        });
      }
    } catch (e) {
      // Sigue adelante en modo cliente
    }

    return scores;
  }, [draft]);

  const resetDiagnostic = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem('hera_latest_diagnostic_scores');
    setDraft(INITIAL_DRAFT);
  }, []);

  // Cargar respuestas de demostración realistas para pruebas
  const loadSampleData = useCallback(() => {
    const sampleAnswers: Answers = {
      K01: true,
      A01: 'Café & Panadería La Casona',
      A02: 'alimentos_bebidas',
      A03: 'chia',
      A04: '3_5',
      A05: 'rut_camara',
      A06: '4_6',
      A07: ['local_fisico', 'solo_linea'],
      A08: 'propietario',
      B01: '10m_20m',
      B02: 'moderada',
      B03: '20k_50k',
      B04: '300_1000',
      B05: ['local_fisico', 'whatsapp', 'redes_sociales'],
      B06: 'local_fisico',
      B07: ['efectivo', 'nequi_daviplata', 'datafono', 'transferencia'],
      B08: 'menos_20',
      B09: 'cuaderno',
      B10: '50_80',
      C01: 'aproximadamente',
      C02: '25_40',
      C03: '3m_8m',
      C04: '2m_6m',
      C05: 'costo_mas_margen',
      C06: '1m_3m',
      C07: 'parcialmente',
      C08: 'inventario',
      D01: 'propietario',
      D02: 'propietario',
      D03: 'externo',
      D04: 'propietario',
      D05: 'empleado_dedicado',
      D06: 'propietario',
      D07: 'empleado_dedicado',
      D08: 'propietario',
      D09: 'propietario',
      D10: 'no_existe',
      // Actividades E
      'E-VEN-01': '1', // manual
      'E-VEN-02': '1',
      'E-VEN-03': '1',
      'E-VEN-04': '2', // whatsapp básico
      'E-VEN-05': '1',
      'E-VEN-IMP': 5,
      'E-MKT-01': '2',
      'E-MKT-02': '1',
      'E-MKT-03': '2',
      'E-MKT-04': '2',
      'E-MKT-05': '1',
      'E-MKT-06': '2',
      'E-MKT-07': '1',
      'E-MKT-IMP': 4,
      'E-FIN-01': '2', // facturación básica
      'E-FIN-02': '1',
      'E-FIN-03': '1',
      'E-FIN-04': '1',
      'E-FIN-05': '1',
      'E-FIN-06': '1',
      'E-FIN-07': '1',
      'E-FIN-IMP': 5,
      'E-RRH-01': '1',
      'E-RRH-02': '1',
      'E-RRH-03': '2',
      'E-RRH-04': '1',
      'E-RRH-IMP': 3,
      'E-OPE-01': '1', // inventario en cuaderno
      'E-OPE-02': '2',
      'E-OPE-03': '2',
      'E-OPE-04': '1',
      'E-OPE-IMP': 4,
      'E-CLI-01': '2',
      'E-CLI-02': '1',
      'E-CLI-03': '1',
      'E-CLI-04': '1',
      'E-CLI-IMP': 4,
      'E-ADM-01': '1',
      'E-ADM-02': '1',
      'E-ADM-03': '1',
      'E-ADM-IMP': 4,
      'E-LOG-01': '1',
      'E-LOG-02': '2',
      'E-LOG-03': '1',
      'E-LOG-IMP': 4,
      'E-TEC-01': '2',
      'E-TEC-02': '1',
      'E-TEC-03': '1',
      'E-TEC-IMP': 5,
      F01: ['excel_sheets', 'whatsapp_business', 'instagram', 'facebook', 'canva', 'bold', 'nequi_daviplata_negocios'],
      F02: 'cero',
      F03: 'WhatsApp Business y Nequi porque son rápidos y no me cobran mensualidad fija.',
      F05: 'propietario',
      G01: 'fijo_fibra',
      G02: ['smartphone', 'computador', 'datafono'],
      G03: 3,
      G04: 'conoce_no_usa',
      G05: 'si_basica',
      H01: 'si',
      H02: ['no_se_empezar', 'costo', 'falta_tiempo'],
      H03: 'desorden_administrativo',
      H04: ['vender_mas', 'organizar_finanzas', 'automatizar'],
      H05: '50k_150k',
      H06: 4,
      H07: 'Aprender qué herramientas sencillas me ayudan a no perder el control del dinero y las ventas.',
    };

    const completedDraft: DiagnosticDraft = {
      version_id: questionnaireSchema.version,
      answers: sampleAnswers,
      tierMode: 'core',
      currentSectionIndex: questionnaireSchema.sections.length - 1,
      status: 'completed',
      updated_at: new Date().toISOString(),
      completed_at: new Date().toISOString(),
    };

    setDraft(completedDraft);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(completedDraft));
    const scores = computeScores(sampleAnswers, questionnaireSchema as any);
    localStorage.setItem('hera_latest_diagnostic_scores', JSON.stringify(scores));
    return completedDraft;
  }, []);

  return {
    draft,
    setAnswer,
    setAnswers,
    setTierMode,
    setCurrentSectionIndex,
    completeDiagnostic,
    resetDiagnostic,
    loadSampleData,
  };
}

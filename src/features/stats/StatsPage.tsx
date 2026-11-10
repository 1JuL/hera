import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ClipboardList,
  Sparkles,
  BarChart3,
  Info,
  ArrowRight,
} from 'lucide-react';
import { StatsSidebar } from './components/Sidebar';
import { KpiCard } from './components/KpiCard';
import { LocalStatsProvider } from './lib/StatsProvider';
import { DiagnosticScores } from '@/features/diagnostic/schema/types';
import { MaturityRadarChart } from './components/MaturityRadarChart';
import { PriorityGapsChart } from './components/PriorityGapsChart';
import { ChannelsPaymentChart } from './components/ChannelsPaymentChart';
import { FinancialDisciplineCard } from './components/FinancialDisciplineCard';
import { NationalBenchmarkCard } from './components/NationalBenchmarkCard';
import { useDraftResponse } from '@/features/diagnostic/hooks/useDraftResponse';

export const StatsPage: React.FC = () => {
  const [stats, setStats] = useState<DiagnosticScores | null>(null);
  const { draft, loadSampleData } = useDraftResponse();

  const loadData = () => {
    const currentStats = LocalStatsProvider.getBusinessStats();
    setStats(currentStats);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleLoadDemo = () => {
    loadSampleData();
    loadData();
  };

  const getMaturityLevel = (score: number) => {
    if (score < 25) return { label: 'Inicial / Analógico', color: 'text-amber-700 bg-amber-50' };
    if (score < 50) return { label: 'Básico en Desarrollo', color: 'text-blue-700 bg-blue-50' };
    if (score < 75) return { label: 'Intermedio Digital', color: 'text-emerald-700 bg-emerald-50' };
    return { label: 'Avanzado / Optimizado', color: 'text-purple-700 bg-purple-50' };
  };

  return (
    <div className="flex flex-col md:flex-row flex-1 min-h-[calc(100vh-65px)]">
      {/* Sidebar Lateral del Espacio de Trabajo */}
      <StatsSidebar />

      {/* Contenido Principal de Estadísticas */}
      <main className="flex-1 p-5 md:p-8 overflow-y-auto bg-[#F4F6F4]">
        {/* Banner de bienvenida y control */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-bold text-[#1E1E1E] font-brand">
              Buenos días, María
            </h2>
            <p className="text-xs sm:text-sm text-[#666666]">
              {stats
                ? 'Panel de diagnóstico, madurez digital y oportunidades TIC de tu negocio.'
                : 'Aún no se ha completado el autodiagnóstico de tu negocio.'}
            </p>
          </div>

          <div className="flex gap-2.5">
            <Link
              to="/carga-datos"
              className="px-3.5 py-2 rounded-xl bg-[#163A2B] hover:bg-[#112D21] text-white text-xs font-bold transition-all shadow-xs no-underline flex items-center gap-2"
            >
              <ClipboardList className="w-3.5 h-3.5" />
              <span>{stats ? 'Actualizar Diagnóstico' : 'Completar Cuestionario'}</span>
            </Link>
            {!stats && (
              <button
                type="button"
                onClick={handleLoadDemo}
                className="px-3.5 py-2 rounded-xl bg-[#E8F5EE] hover:bg-[#D0E6DC] text-[#163A2B] text-xs font-bold transition-all border border-[#86CEAB]/60 cursor-pointer flex items-center gap-2"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Ver con Datos Demo</span>
              </button>
            )}
          </div>
        </div>

        {/* Si no hay datos, mostrar aviso guiado */}
        {!stats ? (
          <div className="bg-white rounded-2xl p-8 border border-[#E0E0E0] text-center max-w-xl mx-auto my-12 shadow-xs">
            <div className="w-16 h-16 rounded-2xl bg-[#E8F5EE] text-[#163A2B] flex items-center justify-center mx-auto mb-4">
              <BarChart3 className="w-8 h-8 text-[#163A2B]" />
            </div>
            <h3 className="text-lg font-bold text-[#1E1E1E] mb-2 font-brand">
              Diagnóstico no completado todavía
            </h3>
            <p className="text-xs sm:text-sm text-[#666666] leading-relaxed mb-6">
              Para visualizar las métricas reales de madurez por área, brechas prioritarias y mezcla de canales de tu negocio, completa el cuestionario rápido en el módulo de Carga de Datos.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                to="/carga-datos"
                className="px-5 py-2.5 rounded-xl bg-[#163A2B] text-white text-xs font-bold no-underline shadow-xs hover:bg-[#112D21]"
              >
                Ir a Carga de Datos y Diagnóstico
              </Link>
              <button
                type="button"
                onClick={handleLoadDemo}
                className="px-5 py-2.5 rounded-xl bg-[#E8F5EE] text-[#163A2B] text-xs font-bold border border-[#86CEAB] cursor-pointer hover:bg-[#D0E6DC]"
              >
                Cargar negocio de ejemplo (Sabana Centro)
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Tarjetas KPI Reales del Diagnóstico */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 rounded-[10px] shadow-xs border bg-[#163A2B] text-white border-transparent">
                <span className="text-xs opacity-90 block">Índice Global de Madurez</span>
                <div className="text-[26px] font-bold my-1 font-brand">
                  {stats.overallIndex}%
                </div>
                <div className="text-[11px] text-[#A3C2B5] flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#86CEAB]"></span>
                  Nivel: {getMaturityLevel(stats.overallIndex).label}
                </div>
              </div>

              <KpiCard
                label="Brechas Prioritarias"
                value={`${stats.priorityGaps.length} procesos`}
                desc="En áreas de alta importancia para el dueño"
              />

              <KpiCard
                label="Adopción de Pagos Digitales"
                value={`${Math.round(stats.paymentAdoption.digitalRatio * 100)}%`}
                desc={`${stats.paymentAdoption.digitalMethods.length} medios electrónicos activos`}
              />

              <KpiCard
                label="Disciplina y Control Financiero"
                value={`${stats.financialDiscipline.score}%`}
                desc="Registro de ventas, costeo y precios"
              />
            </div>

            {/* Fila 1: Radar de Madurez + Brechas Prioritarias */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Radar de Madurez Digital (2 cols) */}
              <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-xs border border-[#E0E0E0]">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-4">
                  <div>
                    <h3 className="text-base font-bold text-[#1E1E1E] font-brand">
                      Madurez Digital por Área de Negocio
                    </h3>
                    <p className="text-xs text-[#666666]">
                      Evaluación de 0 a 100% calculada sobre las actividades operativas del diagnóstico
                    </p>
                  </div>
                  <span className="text-xs font-bold text-[#163A2B] bg-[#E8F5EE] px-2.5 py-1 rounded-md">
                    {Object.keys(stats.areas).length} Áreas Evaluadas
                  </span>
                </div>

                <MaturityRadarChart areas={stats.areas} />

                {/* Resumen en pastillas por área */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-4 border-t border-[#E0E0E0]">
                  {Object.values(stats.areas).map((a) => (
                    <div key={a.areaId} className="p-2 rounded-lg bg-[#F8FAF9] border border-[#E0E0E0]">
                      <span className="text-[11px] text-[#666666] block truncate">{a.name}</span>
                      <span className="text-sm font-bold text-[#163A2B]">{a.maturityScore}%</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Brechas Críticas (1 col) */}
              <div className="bg-white p-6 rounded-2xl shadow-xs border border-[#E0E0E0] flex flex-col justify-between">
                <div>
                  <h3 className="text-base font-bold text-[#1E1E1E] font-brand mb-1">
                    Brechas Prioritarias Detectadas
                  </h3>
                  <p className="text-xs text-[#666666] mb-4">
                    Procesos manuales o no realizados en áreas que consideras de máxima prioridad
                  </p>
                  <PriorityGapsChart gaps={stats.priorityGaps} />
                </div>

                <div className="mt-4 pt-3 border-t border-[#E0E0E0] text-center">
                  <Link
                    to="/mapa"
                    className="text-xs text-[#163A2B] font-bold hover:underline flex items-center justify-center gap-1.5"
                  >
                    <span>Ver soluciones en el Mapa de Oportunidades</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>

            {/* Fila 2: Mezcla de Canales y Disciplina Financiera */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-2xl shadow-xs border border-[#E0E0E0]">
                <h3 className="text-base font-bold text-[#1E1E1E] font-brand mb-1">
                  Canales de Venta y Medios de Pago
                </h3>
                <p className="text-xs text-[#666666] mb-4">
                  Distribución comercial y porcentaje de cobros electrónicos en tu operación
                </p>
                <ChannelsPaymentChart
                  channels={stats.salesChannels}
                  paymentAdoption={stats.paymentAdoption}
                />
              </div>

              <FinancialDisciplineCard financial={stats.financialDiscipline} />
            </div>

            {/* Fila 3: Punto de referencia (Nacional) */}
            <NationalBenchmarkCard answers={draft.answers || {}} />

            {/* Aviso sobre cifras ilustrativas */}
            <div className="bg-[#FFFDF7] p-4 rounded-xl border border-[#F3E8C9] text-xs text-[#8A4810] flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Info className="w-4 h-4 shrink-0 text-[#8A4810]" />
                <span>
                  <strong>Nota metodológica:</strong> Las métricas presentadas corresponden a los índices diagnósticos y brechas declaradas en el Cuestionario Senzaccento. No representan garantías de ingresos económicos futuros.
                </span>
              </div>
              <button
                type="button"
                onClick={handleLoadDemo}
                className="shrink-0 text-xs text-[#163A2B] font-bold underline bg-transparent border-none cursor-pointer"
              >
                Recargar demo
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

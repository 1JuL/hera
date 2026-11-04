import React from 'react';
import { StatsSidebar } from './components/Sidebar';
import { KpiCard } from './components/KpiCard';
import { GainChart } from './components/GainChart';
import { ImpactChart } from './components/ImpactChart';

export const StatsPage: React.FC = () => {
  return (
    <div className="flex flex-col md:flex-row flex-1 min-h-[calc(100vh-65px)]">
      {/* Sidebar Lateral */}
      <StatsSidebar />

      {/* Contenido Principal de Estadísticas */}
      <main className="flex-1 p-6 md:p-8 overflow-y-auto">
        <h2 className="text-2xl font-bold text-[#1E1E1E] mb-1">
          Buenos días, María
        </h2>
        <p className="text-sm text-[#666666] mb-6">
          Así se está desempeñando tu negocio este mes.
        </p>

        {/* Tarjetas KPI Superiores */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <KpiCard
            label="Ganancia neta"
            value="$28.450.000"
            desc="+12,4% vs. mes anterior"
            isMain
          />
          <KpiCard
            label="Ganancia por tecnología"
            value="$8.620.000"
            desc="+18,7% (30% de la ganancia total)"
          />
          <KpiCard
            label="Ingresos totales"
            value="$54.320.000"
            desc="+6,2% vs. mes anterior"
          />
          <KpiCard
            label="Margen operativo"
            value="24,8%"
            desc="+2,1% vs. mes anterior"
          />
        </div>

        {/* Gráficos de Rendimiento e Impacto */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Gráfico 1: Rendimiento de Ganancias (2 columnas) */}
          <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-xs border border-[#E0E0E0]/60">
            <h3 className="text-base font-bold text-[#1E1E1E] mb-1">
              Rendimiento de ganancias
            </h3>
            <p className="text-[11px] text-[#666666] mb-4">
              Composición vertical de la ganancia total (Aporte no tecnológico + Aporte tecnológico)
            </p>
            <GainChart />
          </div>

          {/* Gráfico 2: Impacto Tecnológico (1 columna) */}
          <div className="bg-white p-6 rounded-xl shadow-xs border border-[#E0E0E0]/60 flex flex-col justify-between">
            <div>
              <h3 className="text-base font-bold text-[#1E1E1E] mb-1">
                Impacto tecnológico
              </h3>
              <p className="text-[11px] text-[#666666] mb-4">
                Retorno de las inversiones digitales
              </p>
            </div>
            <ImpactChart />
          </div>
        </div>
      </main>
    </div>
  );
};


import React from 'react';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import { AreaScore } from '@/features/diagnostic/schema/types';

interface MaturityRadarChartProps {
  areas: Record<string, AreaScore>;
}

export const MaturityRadarChart: React.FC<MaturityRadarChartProps> = ({ areas }) => {
  const chartData = [
    { area: 'Ventas', score: areas.VEN?.maturityScore || 0, fullMark: 100 },
    { area: 'Marketing', score: areas.MKT?.maturityScore || 0, fullMark: 100 },
    { area: 'Finanzas', score: areas.FIN?.maturityScore || 0, fullMark: 100 },
    { area: 'RRHH', score: areas.RRH?.maturityScore || 0, fullMark: 100 },
    { area: 'Operaciones', score: areas.OPE?.maturityScore || 0, fullMark: 100 },
    { area: 'Clientes', score: areas.CLI?.maturityScore || 0, fullMark: 100 },
    { area: 'Administración', score: areas.ADM?.maturityScore || 0, fullMark: 100 },
  ];

  return (
    <div className="w-full h-[280px]">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="75%" data={chartData}>
          <PolarGrid stroke="#E0E0E0" />
          <PolarAngleAxis
            dataKey="area"
            tick={{ fill: '#1E1E1E', fontSize: 11, fontWeight: 600 }}
          />
          <PolarRadiusAxis
            angle={30}
            domain={[0, 100]}
            tick={{ fill: '#888', fontSize: 9 }}
          />
          <Tooltip
            formatter={(value: any) => [`${value}% de madurez`, 'Nivel']}
            contentStyle={{
              backgroundColor: '#163A2B',
              borderRadius: '8px',
              color: '#FFFFFF',
              fontSize: '12px',
              border: 'none',
            }}
            itemStyle={{ color: '#86CEAB' }}
          />
          <Radar
            name="Madurez del Negocio"
            dataKey="score"
            stroke="#163A2B"
            fill="#86CEAB"
            fillOpacity={0.45}
            strokeWidth={2}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
};

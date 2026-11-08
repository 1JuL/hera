import React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import { Star } from 'lucide-react';
import { DiagnosticScores } from '@/features/diagnostic/schema/types';

interface ChannelsPaymentChartProps {
  channels: DiagnosticScores['salesChannels'];
  paymentAdoption: DiagnosticScores['paymentAdoption'];
}

const CHANNEL_LABELS: Record<string, string> = {
  local_fisico: 'Punto Físico',
  whatsapp: 'WhatsApp',
  redes_sociales: 'Redes Sociales',
  marketplace: 'Marketplace',
  web_propia: 'Página Web',
  domicilios_apps: 'Apps Domicilio',
  venta_directa_ferias: 'Ferias / Directa',
};

const PAYMENT_COLORS = ['#163A2B', '#86CEAB', '#CCCCCC'];

export const ChannelsPaymentChart: React.FC<ChannelsPaymentChartProps> = ({
  channels,
  paymentAdoption,
}) => {
  const paymentData = [
    {
      name: 'Medios Digitales (Nequi, Datáfono, etc.)',
      value: paymentAdoption.digitalMethods.length || 0,
    },
    {
      name: 'Medios Tradicionales (Efectivo, Fiado)',
      value: paymentAdoption.traditionalMethods.length || 0,
    },
  ];

  const digitalPercent = Math.round(paymentAdoption.digitalRatio * 100);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {/* Mezcla de Canales */}
      <div className="p-4 bg-[#F8FAF9] rounded-xl border border-[#E0E0E0]">
        <h4 className="text-xs font-bold text-[#1E1E1E] uppercase tracking-wider mb-2">
          Canales de Venta Activos
        </h4>
        {channels.length === 0 ? (
          <p className="text-xs text-[#888] italic">Sin canales registrados</p>
        ) : (
          <div className="space-y-1.5 mt-2">
            {channels.map((ch) => (
              <div
                key={ch.channel}
                className={`p-2 rounded-lg text-xs flex items-center justify-between border ${
                  ch.isMain
                    ? 'bg-[#E8F5EE] border-[#86CEAB] text-[#163A2B] font-bold'
                    : 'bg-white border-[#E0E0E0] text-[#4A5568]'
                }`}
              >
                <span>{CHANNEL_LABELS[ch.channel] || ch.channel}</span>
                {ch.isMain && (
                  <span className="text-[10px] bg-[#163A2B] text-white px-2 py-0.5 rounded-full font-semibold flex items-center gap-1">
                    <span>Principal</span>
                    <Star className="w-3 h-3 fill-current" />
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Adopción de Pagos Digitales */}
      <div className="p-4 bg-[#F8FAF9] rounded-xl border border-[#E0E0E0] flex flex-col justify-between">
        <div>
          <h4 className="text-xs font-bold text-[#1E1E1E] uppercase tracking-wider mb-1">
            Adopción de Pagos Digitales
          </h4>
          <p className="text-[11px] text-[#666666]">
            Proporción de medios electrónicos sobre el total aceptado
          </p>
        </div>

        <div className="flex items-center justify-center my-2 h-[120px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={paymentData}
                cx="50%"
                cy="50%"
                innerRadius={36}
                outerRadius={52}
                paddingAngle={4}
                dataKey="value"
              >
                {paymentData.map((_, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={PAYMENT_COLORS[index % PAYMENT_COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: '#163A2B',
                  borderRadius: '6px',
                  color: '#FFF',
                  fontSize: '11px',
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="text-center pt-1 border-t border-[#E0E0E0]">
          <span className="text-2xl font-bold text-[#163A2B]">
            {digitalPercent}%
          </span>
          <span className="text-[11px] text-[#666666] block">
            {paymentAdoption.digitalMethods.length} canales digitales de {paymentAdoption.digitalMethods.length + paymentAdoption.traditionalMethods.length} activos
          </span>
        </div>
      </div>
    </div>
  );
};

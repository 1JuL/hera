import React from 'react';

export const ImpactChart: React.FC = () => {
  // Semi-dona / semicírculo (180 grados)
  // Valor 3.4 sobre un total de 5.0 (3.4 retornada + 1.6 pendiente) => 68%
  const radius = 65;
  const strokeWidth = 24;
  const circumference = Math.PI * radius; // Longitud del semicírculo
  const ratio = 3.4 / 5.0; // 0.68
  const strokeDashoffset = circumference * (1 - ratio);

  return (
    <div className="flex flex-col items-center justify-between h-[270px]">
      <div className="relative w-full flex items-center justify-center pt-4">
        <svg width="190" height="110" viewBox="0 0 190 110">
          {/* Fondo del semicírculo: Optimización Pendiente */}
          <path
            d="M 15 100 A 65 65 0 0 1 175 100"
            fill="none"
            stroke="#E8F5EE"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />
          {/* Arco activo: Inversión Retornada */}
          <path
            d="M 15 100 A 65 65 0 0 1 175 100"
            fill="none"
            stroke="#163A2B"
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-700 ease-out"
          />
        </svg>
      </div>

      <div className="text-center mt-2 pb-4">
        <div className="text-3xl font-extrabold text-[#163A2B]">
          3,4x
        </div>
        <p className="text-xs text-[#666666] font-medium mt-1">
          ROI tecnológico
        </p>
      </div>
    </div>
  );
};


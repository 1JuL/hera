import React from 'react';

interface KpiCardProps {
  label: string;
  value: string;
  desc: string;
  isMain?: boolean;
}

export const KpiCard: React.FC<KpiCardProps> = ({ label, value, desc, isMain }) => {
  return (
    <div
      className={`p-4 rounded-[10px] shadow-xs border transition-shadow ${
        isMain
          ? 'bg-[#163A2B] text-white border-transparent'
          : 'bg-white text-[#1E1E1E] border-[#E0E0E0]/60'
      }`}
    >
      <span className="text-xs opacity-90 block">
        {label}
      </span>
      <div className="text-[22px] font-bold my-2">
        {value}
      </div>
      <div
        className={`text-[11px] ${
          isMain ? 'text-[#A3C2B5]' : 'text-[#666666]'
        }`}
      >
        {desc}
      </div>
    </div>
  );
};


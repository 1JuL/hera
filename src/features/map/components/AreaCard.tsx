import React from 'react';
import { Area } from '../types';

interface AreaCardProps {
  area: Area;
  onSelect: (area: Area) => void;
}

export const AreaCard: React.FC<AreaCardProps> = ({ area, onSelect }) => {
  return (
    <div
      onClick={() => onSelect(area)}
      style={{ backgroundColor: area.bgCard }}
      className="rounded-[14px] p-6 cursor-pointer hover:-translate-y-1 hover:shadow-md transition-all duration-200 flex flex-col justify-between min-h-[190px] border border-black/5"
    >
      <div>
        <div className="flex items-center gap-3 mb-2.5">
          <div
            style={{ backgroundColor: area.bgIcon, color: area.colorIcon }}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-medium"
          >
            {area.icon}
          </div>
          <h3 className="text-[17px] font-bold text-[#1E1E1E]">
            {area.title}
          </h3>
        </div>
        <p className="text-[11px] text-[#4A5568] leading-[1.45] mb-4">
          {area.desc}
        </p>
      </div>

      <span
        style={{ backgroundColor: area.badgeBg, color: area.badgeColor }}
        className="inline-block px-3 py-1 rounded-xl text-[10px] font-bold w-fit shadow-2xs"
      >
        +3 Soluciones
      </span>
    </div>
  );
};


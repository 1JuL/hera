import React, { useState } from 'react';

export const StatsSidebar: React.FC = () => {
  const [activeItem, setActiveItem] = useState('menu');

  const menuItems = [
    { id: 'menu', label: '📊 Menú' },
    { id: 'finanzas', label: '💰 Finanzas' },
    { id: 'tecnologia', label: '💻 Tecnología' },
    { id: 'inventario', label: '📦 Inventario' },
    { id: 'equipo', label: '👥 Equipo' },
    { id: 'configuracion', label: '⚙️ Configuración' },
    { id: 'ayuda', label: '❓ Centro de ayuda' },
  ];

  return (
    <aside className="w-full md:w-[240px] bg-[#0E261C] text-[#A3C2B5] p-5 flex flex-col justify-between shrink-0 select-none">
      <div>
        <div className="text-[11px] uppercase font-bold text-[#5C8374] tracking-wider mb-4">
          Espacio de trabajo
        </div>
        <ul className="list-none space-y-1">
          {menuItems.map((item) => (
            <li key={item.id}>
              <button
                type="button"
                onClick={() => setActiveItem(item.id)}
                className={`w-full text-left flex items-center gap-2.5 px-3 py-2.5 text-[13px] rounded-md transition-colors cursor-pointer border-none ${
                  activeItem === item.id
                    ? 'bg-[#163A2B] text-white font-semibold'
                    : 'text-[#A3C2B5] hover:bg-[#163A2B]/60 hover:text-white bg-transparent'
                }`}
              >
                {item.label}
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div className="flex items-center gap-3 pt-4 border-t border-white/10 mt-6">
        <div className="w-8 h-8 rounded-full bg-[#86CEAB] text-[#0E261C] flex items-center justify-center font-bold text-xs shrink-0">
          MG
        </div>
        <div className="text-xs text-white leading-tight">
          <strong>María García</strong>
          <span className="block opacity-70 text-[11px]">Senzaccento</span>
        </div>
      </div>
    </aside>
  );
};


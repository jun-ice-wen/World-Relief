import React from 'react';
import { Award, BookOpen, Map as MapIcon } from 'lucide-react';
import type { MobileTab } from '../types';

interface BottomNavProps {
  activeTab: MobileTab;
  onChangeTab: (tab: MobileTab) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, onChangeTab }) => {
  const items: Array<{ id: MobileTab; label: string; icon: React.ReactNode }> = [
    { id: 'map', label: 'Map', icon: <MapIcon className="w-5 h-5" /> },
    { id: 'journal', label: 'Journal', icon: <BookOpen className="w-5 h-5" /> },
    { id: 'stats', label: 'Passport', icon: <Award className="w-5 h-5" /> },
  ];

  return (
    <nav
      className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-[#FFFDF9]/95 backdrop-blur-md border-t border-[#E2D9C8] pb-safe"
      aria-label="Primary navigation"
    >
      <div className="grid grid-cols-3 h-14">
        {items.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onChangeTab(item.id)}
              className={`flex flex-col items-center justify-center gap-0.5 min-h-[44px] transition-colors ${
                isActive ? 'text-[#2B6E4F] font-semibold' : 'text-[#5C665E] hover:text-[#1E2420]'
              }`}
            >
              {item.icon}
              <span className="text-[11px] leading-none tracking-tight">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

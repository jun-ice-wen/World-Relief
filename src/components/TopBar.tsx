import React from 'react';
import { Plus } from 'lucide-react';
import { PROFILES } from '../constants/profiles';
import type { ProfileId } from '../types';
import { ProfileMascot } from './Mascots';
import { PWAInstallButton } from './PWAInstallModal';

interface TopBarProps {
  activeLogger: ProfileId;
  onToggleLogger: () => void;
  onOpenNewLog: () => void;
  desktopPanel: 'journal' | 'stats';
  onChangeDesktopPanel: (panel: 'journal' | 'stats') => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  activeLogger,
  onToggleLogger,
  onOpenNewLog,
  desktopPanel,
  onChangeDesktopPanel,
}) => {
  const loggerMeta = PROFILES[activeLogger];

  return (
    <header className="sticky top-0 z-30 h-13 px-3 sm:px-6 bg-[#FFFDF9]/95 backdrop-blur-md border-b border-[#E2D9C8] flex items-center justify-between gap-4 sm:gap-8">
      {/* Zone 1: Single-line Brand Wordmark */}
      <span className="font-display text-lg sm:text-xl font-bold tracking-tight text-[#1E2420] whitespace-nowrap shrink-0">
        Field Atlas
      </span>

      {/* Zone 2: Desktop Panel Links (hidden on mobile) */}
      <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-[#5C665E]">
        <button
          type="button"
          onClick={() => onChangeDesktopPanel('journal')}
          className={`py-1 transition-colors whitespace-nowrap shrink-0 border-b-2 ${
            desktopPanel === 'journal'
              ? 'text-[#1E2420] border-[#1E2420] font-semibold'
              : 'border-transparent hover:text-[#1E2420]'
          }`}
        >
          Field Journal
        </button>
        <button
          type="button"
          onClick={() => onChangeDesktopPanel('stats')}
          className={`py-1 transition-colors whitespace-nowrap shrink-0 border-b-2 ${
            desktopPanel === 'stats'
              ? 'text-[#1E2420] border-[#1E2420] font-semibold'
              : 'border-transparent hover:text-[#1E2420]'
          }`}
        >
          Relief Passport
        </button>
      </nav>

      {/* Zone 3: Quick Two-Tap Logger Switcher + Desktop Primary CTA */}
      <div className="flex items-center gap-2 shrink-0">
        <PWAInstallButton />

        <button
          type="button"
          onClick={onToggleLogger}
          className="min-h-[40px] px-2.5 sm:px-3 py-1.5 rounded-xl border transition-all active:scale-[0.97] flex items-center gap-2 whitespace-nowrap shrink-0"
          style={{
            backgroundColor: loggerMeta.tintBg,
            borderColor: loggerMeta.borderHex,
          }}
          title="Tap to switch who is logging"
          aria-label={`Currently logging as ${loggerMeta.name}. Tap to switch.`}
        >
          <ProfileMascot userId={activeLogger} size={22} />
          <span className="text-xs font-semibold text-[#1E2420]">
            <span className="text-[#5C665E] font-normal mr-1 hidden xs:inline">Log as:</span>
            {loggerMeta.shortName}
          </span>
        </button>

        <button
          type="button"
          onClick={onOpenNewLog}
          className="hidden lg:inline-flex items-center gap-1.5 h-10 px-4 rounded-xl bg-[#1E2420] text-[#FFFDF9] text-xs font-semibold hover:bg-[#2E3631] active:scale-[0.98] transition-all whitespace-nowrap shrink-0"
        >
          <Plus className="w-4 h-4" />
          Log City
        </button>
      </div>
    </header>
  );
};

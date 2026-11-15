import React, { useState } from 'react';
import { Calendar, X } from 'lucide-react';
import type { DateFilterState, ViewMode } from '../types';
import { CrocodileEmblem, HamsterEmblem } from './Mascots';

interface FilterStripProps {
  viewMode: ViewMode;
  onChangeViewMode: (mode: ViewMode) => void;
  dateFilter: DateFilterState;
  onChangeDateFilter: (next: DateFilterState) => void;
  availableYears: number[];
  resultCount: number;
}

export const FilterStrip: React.FC<FilterStripProps> = ({
  viewMode,
  onChangeViewMode,
  dateFilter,
  onChangeDateFilter,
  availableYears,
  resultCount,
}) => {
  const [showCustomRange, setShowCustomRange] = useState(dateFilter.mode === 'range');

  const handleSelectAll = () => {
    setShowCustomRange(false);
    onChangeDateFilter({ mode: 'all' });
  };

  const handleSelectYear = (year: number) => {
    setShowCustomRange(false);
    onChangeDateFilter({ mode: 'year', year });
  };

  const handleToggleRange = () => {
    if (showCustomRange) {
      setShowCustomRange(false);
      onChangeDateFilter({ mode: 'all' });
    } else {
      setShowCustomRange(true);
      onChangeDateFilter({
        mode: 'range',
        startDate: dateFilter.startDate || '',
        endDate: dateFilter.endDate || '',
      });
    }
  };

  return (
    <div className="space-y-2">
      {/* Segmented 3-Way View Toggle */}
      <div
        className="grid grid-cols-3 gap-1 p-1 rounded-2xl bg-[#EFE8D8]/95 backdrop-blur-md border border-[#E2D9C8] shadow-sm"
        role="tablist"
        aria-label="Filter map by traveler"
      >
        <button
          type="button"
          role="tab"
          aria-selected={viewMode === 'crocodile'}
          onClick={() => onChangeViewMode('crocodile')}
          className={`min-h-[40px] px-2 py-1.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all whitespace-nowrap ${
            viewMode === 'crocodile'
              ? 'bg-[#FFFDF9] text-[#2B6E4F] shadow-sm border border-[#B6D3C3]'
              : 'text-[#5C665E] hover:text-[#1E2420]'
          }`}
        >
          <CrocodileEmblem size={18} />
          <span className="truncate">Mr Croc</span>
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={viewMode === 'hamster'}
          onClick={() => onChangeViewMode('hamster')}
          className={`min-h-[40px] px-2 py-1.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all whitespace-nowrap ${
            viewMode === 'hamster'
              ? 'bg-[#FFFDF9] text-[#D4652A] shadow-sm border border-[#EFC9B3]'
              : 'text-[#5C665E] hover:text-[#1E2420]'
          }`}
        >
          <HamsterEmblem size={18} />
          <span className="truncate">Ms Hamster</span>
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={viewMode === 'both'}
          onClick={() => onChangeViewMode('both')}
          className={`min-h-[40px] px-2 py-1.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all whitespace-nowrap ${
            viewMode === 'both'
              ? 'bg-[#FFFDF9] text-[#44549E] shadow-sm border border-[#C6CCE8]'
              : 'text-[#5C665E] hover:text-[#1E2420]'
          }`}
        >
          <span className="flex items-center -space-x-1.5 shrink-0">
            <CrocodileEmblem size={16} />
            <HamsterEmblem size={16} />
          </span>
          <span>Both</span>
        </button>
      </div>

      {/* Year & Date Range Filter Strip */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-0.5">
        <button
          type="button"
          onClick={handleSelectAll}
          className={`min-h-[34px] px-3 py-1 rounded-lg text-xs font-medium border transition-colors whitespace-nowrap shrink-0 ${
            dateFilter.mode === 'all'
              ? 'bg-[#1E2420] text-[#FFFDF9] border-[#1E2420]'
              : 'bg-[#FFFDF9]/90 text-[#5C665E] border-[#E2D9C8] hover:text-[#1E2420]'
          }`}
        >
          All Dates
        </button>

        {availableYears.map((yr) => (
          <button
            key={yr}
            type="button"
            onClick={() => handleSelectYear(yr)}
            className={`min-h-[34px] px-3 py-1 rounded-lg font-mono-tabular text-xs font-medium border transition-colors whitespace-nowrap shrink-0 ${
              dateFilter.mode === 'year' && dateFilter.year === yr
                ? 'bg-[#1E2420] text-[#FFFDF9] border-[#1E2420]'
                : 'bg-[#FFFDF9]/90 text-[#5C665E] border-[#E2D9C8] hover:text-[#1E2420]'
            }`}
          >
            {yr}
          </button>
        ))}

        <button
          type="button"
          onClick={handleToggleRange}
          className={`min-h-[34px] px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors flex items-center gap-1 whitespace-nowrap shrink-0 ${
            showCustomRange || dateFilter.mode === 'range'
              ? 'bg-[#44549E] text-[#FFFDF9] border-[#44549E]'
              : 'bg-[#FFFDF9]/90 text-[#5C665E] border-[#E2D9C8] hover:text-[#1E2420]'
          }`}
        >
          <Calendar className="w-3.5 h-3.5" />
          <span>Range</span>
        </button>

        <span className="ml-auto pl-2 font-mono-tabular text-[11px] text-[#5C665E] whitespace-nowrap shrink-0">
          {resultCount} {resultCount === 1 ? 'log' : 'logs'}
        </span>
      </div>

      {/* Expandable Custom Date Range Inputs */}
      {showCustomRange && (
        <div className="p-2.5 rounded-2xl bg-[#FFFDF9]/95 backdrop-blur-md border border-[#E2D9C8] shadow-sm flex flex-wrap items-center gap-2">
          <div className="flex-1 min-w-[125px]">
            <label className="block text-[10px] font-medium text-[#5C665E] mb-0.5">From</label>
            <input
              type="date"
              value={dateFilter.startDate || ''}
              onChange={(e) =>
                onChangeDateFilter({
                  mode: 'range',
                  startDate: e.target.value,
                  endDate: dateFilter.endDate || '',
                })
              }
              className="w-full h-9 px-2 rounded-lg border border-[#E2D9C8] bg-[#F7F3EA] font-mono-tabular text-xs text-[#1E2420]"
            />
          </div>
          <div className="flex-1 min-w-[125px]">
            <label className="block text-[10px] font-medium text-[#5C665E] mb-0.5">To</label>
            <input
              type="date"
              value={dateFilter.endDate || ''}
              onChange={(e) =>
                onChangeDateFilter({
                  mode: 'range',
                  startDate: dateFilter.startDate || '',
                  endDate: e.target.value,
                })
              }
              className="w-full h-9 px-2 rounded-lg border border-[#E2D9C8] bg-[#F7F3EA] font-mono-tabular text-xs text-[#1E2420]"
            />
          </div>
          <button
            type="button"
            onClick={handleSelectAll}
            className="min-h-[36px] min-w-[36px] mt-3.5 flex items-center justify-center rounded-lg text-[#5C665E] hover:bg-[#EFE8D8]"
            aria-label="Clear date range"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};

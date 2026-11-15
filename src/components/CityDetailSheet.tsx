import React, { useState } from 'react';
import { Pencil, Plus, Trash2, X } from 'lucide-react';
import { PROFILES, VENUE_LABELS } from '../constants/profiles';
import type { CityCluster, CityLog, CitySuggestion } from '../types';
import { formatReadableDate } from '../utils/date';
import { ProfileMascot } from './Mascots';

interface CityDetailSheetProps {
  cluster: CityCluster | null;
  onClose: () => void;
  onEditLog: (log: CityLog) => void;
  onDeleteLog: (id: string) => Promise<void>;
  onAddVisitHere: (city: CitySuggestion) => void;
}

export const CityDetailSheet: React.FC<CityDetailSheetProps> = ({
  cluster,
  onClose,
  onEditLog,
  onDeleteLog,
  onAddVisitHere,
}) => {
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  if (!cluster) return null;

  const crocCount = cluster.logs.filter((l) => l.userId === 'crocodile').length;
  const hamsterCount = cluster.logs.filter((l) => l.userId === 'hamster').length;

  const handleConfirmDelete = async (id: string) => {
    setDeletingId(id);
    try {
      await onDeleteLog(id);
      setConfirmDeleteId(null);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[1050] flex items-end sm:items-center justify-center bg-[#1E2420]/45 backdrop-blur-xs sm:p-4"
      onClick={onClose}
    >
      <div
        className="w-full sm:max-w-lg max-h-[86dvh] flex flex-col rounded-t-3xl sm:rounded-3xl bg-[#FFFDF9] border border-[#E2D9C8] shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 pt-3 pb-3.5 border-b border-[#E2D9C8] shrink-0">
          <div className="w-10 h-1.5 rounded-full bg-[#E2D9C8] mx-auto mb-2.5 sm:hidden" />
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="font-display text-xl font-bold text-[#1E2420] leading-tight">
                {cluster.city}, {cluster.country}
              </h2>
              <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-[#5C665E]">
                <span className="font-mono-tabular">
                  {cluster.logs.length} {cluster.logs.length === 1 ? 'visit' : 'visits'}
                </span>
                <span aria-hidden="true">·</span>
                <span className="font-mono-tabular">{crocCount} Croc</span>
                <span aria-hidden="true">·</span>
                <span className="font-mono-tabular">{hamsterCount} Hamster</span>
                <span aria-hidden="true">·</span>
                <span className="font-mono-tabular">
                  {cluster.latitude.toFixed(2)}°, {cluster.longitude.toFixed(2)}°
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="min-h-[44px] min-w-[44px] -mr-2 -mt-1 flex items-center justify-center rounded-full text-[#5C665E] hover:bg-[#F7F3EA]"
              aria-label="Close city details"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Chronological Entries */}
        <div className="flex-1 overflow-y-auto divide-y divide-[#EFE8D8] px-5">
          {cluster.logs.map((log) => {
            const profile = PROFILES[log.userId];
            const isConfirming = confirmDeleteId === log.id;

            return (
              <div key={log.id} className="py-4 space-y-2">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <ProfileMascot userId={log.userId} size={30} className="shrink-0" />
                    <div className="min-w-0">
                      <div className="text-sm font-semibold text-[#1E2420]">
                        {profile.name}
                      </div>
                      <div className="flex flex-wrap items-center gap-x-1.5 text-xs text-[#5C665E]">
                        <span className="font-mono-tabular">{formatReadableDate(log.visitedAt)}</span>
                        {log.venueType && (
                          <>
                            <span aria-hidden="true">·</span>
                            <span>{VENUE_LABELS[log.venueType]}</span>
                          </>
                        )}
                        {log.rating && (
                          <>
                            <span aria-hidden="true">·</span>
                            <span className="font-mono-tabular text-[#D4652A] font-medium">
                              {log.rating}/5 ★
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Edit / Delete Actions */}
                  {!isConfirming ? (
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => onEditLog(log)}
                        className="min-h-[40px] min-w-[40px] flex items-center justify-center rounded-xl text-[#5C665E] hover:bg-[#F7F3EA] hover:text-[#1E2420] transition-colors"
                        title="Edit visit"
                        aria-label="Edit visit"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmDeleteId(log.id)}
                        className="min-h-[40px] min-w-[40px] flex items-center justify-center rounded-xl text-[#5C665E] hover:bg-[#FDECEC] hover:text-[#B83B2A] transition-colors"
                        title="Delete visit"
                        aria-label="Delete visit"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        disabled={deletingId === log.id}
                        onClick={() => void handleConfirmDelete(log.id)}
                        className="min-h-[36px] px-2.5 rounded-lg bg-[#B83B2A] text-white text-xs font-semibold hover:bg-[#9E3122] disabled:opacity-60"
                      >
                        Delete
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmDeleteId(null)}
                        className="min-h-[36px] px-2.5 rounded-lg border border-[#E2D9C8] text-xs font-medium text-[#5C665E] hover:text-[#1E2420]"
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                </div>

                {log.notes && (
                  <p className="pl-[40px] text-sm text-[#1E2420]/90 leading-relaxed">
                    {log.notes}
                  </p>
                )}
              </div>
            );
          })}
        </div>

        {/* Sticky Bottom Quick-Add Here CTA */}
        <div className="p-4 border-t border-[#E2D9C8] bg-[#FFFDF9] pb-safe shrink-0">
          <button
            type="button"
            onClick={() =>
              onAddVisitHere({
                city: cluster.city,
                country: cluster.country,
                countryCode: cluster.countryCode,
                latitude: cluster.latitude,
                longitude: cluster.longitude,
                label: `${cluster.city}, ${cluster.country}`,
              })
            }
            className="w-full h-11 rounded-2xl border border-[#1E2420] bg-[#F7F3EA] text-[#1E2420] text-sm font-semibold hover:bg-[#EFE8D8] active:scale-[0.99] transition-all flex items-center justify-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Add Another Visit to {cluster.city}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

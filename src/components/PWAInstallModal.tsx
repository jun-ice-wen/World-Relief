import React, { useState } from 'react';
import { Download, Share, X } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  if (isInstalled) return null;

  if (!isInstallable && !isIOS) return null;

  return (
    <>
      <button
        type="button"
        onClick={() => {
          if (isInstallable) {
            void install();
          } else {
            setShowIOSGuide(true);
          }
        }}
        className="min-h-[40px] px-3 py-1.5 rounded-xl border border-[#E2D9C8] bg-[#FFFDF9] text-xs font-semibold text-[#1E2420] hover:bg-[#EFE8D8] active:scale-[0.98] transition-all flex items-center gap-1.5 whitespace-nowrap shrink-0"
        title="Install on your home screen"
      >
        <Download className="w-3.5 h-3.5 text-[#2B6E4F]" />
        <span className="hidden sm:inline">Install App</span>
        <span className="sm:hidden">Install</span>
      </button>

      {showIOSGuide && (
        <div
          className="fixed inset-0 z-[1200] flex items-end sm:items-center justify-center bg-[#1E2420]/50 backdrop-blur-xs p-4"
          onClick={() => setShowIOSGuide(false)}
        >
          <div
            className="w-full max-w-sm rounded-3xl bg-[#FFFDF9] border border-[#E2D9C8] p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="font-display text-lg font-semibold text-[#1E2420]">
                  Add to iPhone Home Screen
                </h3>
                <p className="mt-1 text-xs text-[#5C665E]">
                  Run Field Atlas full-screen like a native mobile app.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowIOSGuide(false)}
                className="min-h-[44px] min-w-[44px] -mr-2 -mt-2 flex items-center justify-center rounded-full text-[#5C665E] hover:bg-[#F7F3EA]"
                aria-label="Close install instructions"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <ol className="mt-4 space-y-3 text-sm text-[#1E2420]">
              <li className="flex items-start gap-3">
                <span className="font-mono-tabular text-xs font-semibold w-6 h-6 rounded-full bg-[#E9F2EC] text-[#2B6E4F] flex items-center justify-center shrink-0">
                  1
                </span>
                <span>
                  Tap the <Share className="inline w-4 h-4 mx-0.5 text-[#2B6E4F]" />{' '}
                  <strong>Share</strong> button in Safari&apos;s bottom toolbar.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="font-mono-tabular text-xs font-semibold w-6 h-6 rounded-full bg-[#FBEDE4] text-[#D4652A] flex items-center justify-center shrink-0">
                  2
                </span>
                <span>
                  Scroll down and tap <strong>Add to Home Screen</strong>.
                </span>
              </li>
            </ol>

            <button
              type="button"
              onClick={() => setShowIOSGuide(false)}
              className="mt-6 w-full h-11 rounded-xl bg-[#1E2420] text-[#FFFDF9] text-sm font-semibold hover:bg-[#2F3732] transition-colors"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </>
  );
};

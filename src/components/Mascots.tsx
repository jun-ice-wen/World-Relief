import React from 'react';
import type { ProfileId } from '../types';

interface MascotProps {
  className?: string;
  size?: number;
}

export const CrocodileEmblem: React.FC<MascotProps> = ({ className = '', size = 28 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 40 40"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    aria-hidden="true"
  >
    <circle cx="20" cy="20" r="19" fill="#E9F2EC" stroke="#2B6E4F" strokeWidth="2" />
    {/* Explorer pith cap */}
    <path d="M11 13.5C11 9.8 14.8 7.5 20 7.5C25.2 7.5 29 9.8 29 13.5H11Z" fill="#C7A972" stroke="#1E2420" strokeWidth="1.5" />
    <path d="M9 13.5H31" stroke="#1E2420" strokeWidth="1.6" strokeLinecap="round" />
    {/* Crocodile face & broad snout */}
    <path
      d="M11 18.5C11 15.2 14.5 13.5 20 13.5C25.5 13.5 29 15.2 29 18.5V22.5C29 27.2 25.4 30.5 20 30.5C14.6 30.5 11 27.2 11 22.5V18.5Z"
      fill="#3F8D66"
      stroke="#1E2420"
      strokeWidth="1.6"
    />
    {/* Eye ridges */}
    <circle cx="15.5" cy="17.5" r="2.6" fill="#FFFDF9" stroke="#1E2420" strokeWidth="1.4" />
    <circle cx="24.5" cy="17.5" r="2.6" fill="#FFFDF9" stroke="#1E2420" strokeWidth="1.4" />
    <circle cx="15.7" cy="17.5" r="1.1" fill="#1E2420" />
    <circle cx="24.3" cy="17.5" r="1.1" fill="#1E2420" />
    {/* Snout nostrils & friendly smile */}
    <circle cx="17.5" cy="22.8" r="0.9" fill="#1E2420" />
    <circle cx="22.5" cy="22.8" r="0.9" fill="#1E2420" />
    <path d="M14.5 25.8C16.5 27.4 23.5 27.4 25.5 25.8" stroke="#1E2420" strokeWidth="1.5" strokeLinecap="round" />
    {/* Little tooth notch */}
    <path d="M16.5 26.5L17.3 28L18.1 26.7" fill="#FFFDF9" stroke="#1E2420" strokeWidth="1.1" strokeLinejoin="round" />
  </svg>
);

export const HamsterEmblem: React.FC<MascotProps> = ({ className = '', size = 28 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 40 40"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    aria-hidden="true"
  >
    <circle cx="20" cy="20" r="19" fill="#FBEDE4" stroke="#D4652A" strokeWidth="2" />
    {/* Round ears */}
    <circle cx="12" cy="13" r="4" fill="#E99660" stroke="#1E2420" strokeWidth="1.5" />
    <circle cx="28" cy="13" r="4" fill="#E99660" stroke="#1E2420" strokeWidth="1.5" />
    <circle cx="12" cy="13" r="1.8" fill="#F4C2A6" />
    <circle cx="28" cy="13" r="1.8" fill="#F4C2A6" />
    {/* Chubby hamster head */}
    <ellipse cx="20" cy="22" rx="10.5" ry="9" fill="#EE9E66" stroke="#1E2420" strokeWidth="1.6" />
    {/* Cream belly/muzzle patch */}
    <ellipse cx="20" cy="25" rx="7" ry="5" fill="#FFF7EE" />
    {/* Rosy cheeks */}
    <circle cx="13.2" cy="23.5" r="2.1" fill="#E77B58" opacity="0.55" />
    <circle cx="26.8" cy="23.5" r="2.1" fill="#E77B58" opacity="0.55" />
    {/* Eyes */}
    <circle cx="15.8" cy="19.6" r="1.6" fill="#1E2420" />
    <circle cx="24.2" cy="19.6" r="1.6" fill="#1E2420" />
    <circle cx="16.2" cy="19.1" r="0.55" fill="#FFFDF9" />
    <circle cx="24.6" cy="19.1" r="0.55" fill="#FFFDF9" />
    {/* Cute pink nose & whiskers */}
    <ellipse cx="20" cy="22.3" rx="1.4" ry="1" fill="#D4652A" />
    <path d="M18 24.4C18.8 25.3 20 25.1 20 24.2C20 25.1 21.2 25.3 22 24.4" stroke="#1E2420" strokeWidth="1.3" strokeLinecap="round" />
  </svg>
);

export const ProfileMascot: React.FC<{ userId: ProfileId; size?: number; className?: string }> = ({
  userId,
  size = 28,
  className = '',
}) =>
  userId === 'crocodile' ? (
    <CrocodileEmblem size={size} className={className} />
  ) : (
    <HamsterEmblem size={size} className={className} />
  );

/**
 * Self-contained HTML/SVG marker string for Leaflet divIcon pins.
 */
export function buildMapPinHtml(options: {
  hasCrocodile: boolean;
  hasHamster: boolean;
  count: number;
  city: string;
  isSelected?: boolean;
}): string {
  const { hasCrocodile, hasHamster, count, isSelected } = options;
  const isBoth = hasCrocodile && hasHamster;
  const ringColor = isBoth ? '#44549E' : hasCrocodile ? '#2B6E4F' : '#D4652A';
  const fillBg = isBoth ? '#EEF0FA' : hasCrocodile ? '#E9F2EC' : '#FBEDE4';

  const emblemSvg = isBoth
    ? `<svg width="26" height="26" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M18 3C9.7 3 3 9.7 3 18C3 26.3 9.7 33 18 33V3Z" fill="#2B6E4F"/>
        <path d="M18 3C26.3 3 33 9.7 33 18C33 26.3 26.3 33 18 33V3Z" fill="#D4652A"/>
        <circle cx="12.5" cy="18" r="3.4" fill="#FFFDF9"/>
        <circle cx="23.5" cy="18" r="3.4" fill="#FFFDF9"/>
        <circle cx="12.5" cy="18" r="1.4" fill="#1E2420"/>
        <circle cx="23.5" cy="18" r="1.4" fill="#1E2420"/>
       </svg>`
    : hasCrocodile
    ? `<svg width="26" height="26" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="20" cy="20" r="17" fill="#3F8D66"/>
        <circle cx="15" cy="17" r="3" fill="#FFFDF9"/>
        <circle cx="25" cy="17" r="3" fill="#FFFDF9"/>
        <circle cx="15.2" cy="17" r="1.3" fill="#1E2420"/>
        <circle cx="24.8" cy="17" r="1.3" fill="#1E2420"/>
        <path d="M13 24.5C16 27 24 27 27 24.5" stroke="#1E2420" stroke-width="2" stroke-linecap="round"/>
       </svg>`
    : `<svg width="26" height="26" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="11.5" cy="12" r="4.5" fill="#E99660"/>
        <circle cx="28.5" cy="12" r="4.5" fill="#E99660"/>
        <circle cx="20" cy="21" r="13" fill="#EE9E66"/>
        <ellipse cx="20" cy="24.5" rx="8" ry="5.5" fill="#FFF7EE"/>
        <circle cx="15" cy="19" r="1.8" fill="#1E2420"/>
        <circle cx="25" cy="19" r="1.8" fill="#1E2420"/>
        <ellipse cx="20" cy="22.3" rx="1.6" ry="1.1" fill="#D4652A"/>
       </svg>`;

  const countBadge =
    count > 1
      ? `<span style="position:absolute;top:-5px;right:-6px;min-width:18px;height:18px;padding:0 4px;border-radius:9999px;background:#1E2420;color:#FFFDF9;font-family:'JetBrains Mono',monospace;font-size:10px;font-weight:600;display:flex;align-items:center;justify-content:center;border:1.5px solid #FFFDF9;">${count}</span>`
      : '';

  const scale = isSelected ? 'transform:scale(1.16);' : '';

  return `
    <div style="position:relative;width:36px;height:44px;display:flex;flex-direction:column;align-items:center;transition:transform 150ms cubic-bezier(0.16,1,0.3,1);${scale}">
      <div style="position:relative;width:34px;height:34px;border-radius:9999px;background:${fillBg};border:2.5px solid ${ringColor};box-shadow:0 3px 10px rgba(30,36,32,0.24);display:flex;align-items:center;justify-content:center;">
        ${emblemSvg}
        ${countBadge}
      </div>
      <div style="width:0;height:0;border-left:6px solid transparent;border-right:6px solid transparent;border-top:9px solid ${ringColor};margin-top:-1px;"></div>
    </div>
  `;
}

import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { Compass, LocateFixed, Maximize2, Plus, Sparkles } from 'lucide-react';
import type { CityCluster } from '../types';
import { buildMapPinHtml } from './Mascots';

interface WorldMapProps {
  clusters: CityCluster[];
  selectedClusterKey: string | null;
  focusCoords: { lat: number; lng: number; zoom?: number } | null;
  totalLogsCount: number;
  isLoading: boolean;
  onSelectCluster: (cluster: CityCluster) => void;
  onOpenNewLog: () => void;
  onQuickGpsLog: () => void;
  onLoadSamples: () => Promise<void>;
}

export const WorldMap: React.FC<WorldMapProps> = ({
  clusters,
  selectedClusterKey,
  focusCoords,
  totalLogsCount,
  isLoading,
  onSelectCluster,
  onOpenNewLog,
  onQuickGpsLog,
  onLoadSamples,
}) => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const hasFittedInitialBounds = useRef(false);

  // Initialize Leaflet map once
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [22, 12],
      zoom: 2,
      minZoom: 2,
      maxZoom: 18,
      zoomControl: false,
      worldCopyJump: true,
    });

    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; OpenStreetMap &copy; CARTO',
      subdomains: 'abcd',
      maxZoom: 19,
    }).addTo(map);

    L.control.zoom({ position: 'bottomleft' }).addTo(map);

    const markersLayer = L.layerGroup().addTo(map);
    mapRef.current = map;
    markersLayerRef.current = markersLayer;

    const resizeObserver = new ResizeObserver(() => {
      map.invalidateSize();
    });
    resizeObserver.observe(mapContainerRef.current);

    return () => {
      resizeObserver.disconnect();
      map.remove();
      mapRef.current = null;
      markersLayerRef.current = null;
    };
  }, []);

  // Sync markers whenever clusters or selection change
  useEffect(() => {
    const map = mapRef.current;
    const layer = markersLayerRef.current;
    if (!map || !layer) return;

    layer.clearLayers();

    for (const cluster of clusters) {
      const icon = L.divIcon({
        className: 'custom-atlas-marker',
        html: buildMapPinHtml({
          hasCrocodile: cluster.hasCrocodile,
          hasHamster: cluster.hasHamster,
          count: cluster.logs.length,
          city: cluster.city,
          isSelected: cluster.key === selectedClusterKey,
        }),
        iconSize: [36, 44],
        iconAnchor: [18, 44],
      });

      const marker = L.marker([cluster.latitude, cluster.longitude], { icon });
      marker.bindTooltip(`${cluster.city}, ${cluster.country}`, {
        direction: 'top',
        offset: [0, -40],
        opacity: 0.94,
      });
      marker.on('click', () => {
        onSelectCluster(cluster);
      });
      marker.addTo(layer);
    }

    if (clusters.length > 0 && !hasFittedInitialBounds.current) {
      hasFittedInitialBounds.current = true;
      if (clusters.length === 1) {
        map.setView([clusters[0].latitude, clusters[0].longitude], 6, { animate: true });
      } else {
        const bounds = L.latLngBounds(clusters.map((c) => [c.latitude, c.longitude]));
        map.fitBounds(bounds, { padding: [56, 56], maxZoom: 6 });
      }
    }
  }, [clusters, selectedClusterKey, onSelectCluster]);

  // Pan/zoom when external view focuses a city
  useEffect(() => {
    if (!focusCoords || !mapRef.current) return;
    mapRef.current.flyTo([focusCoords.lat, focusCoords.lng], focusCoords.zoom ?? 7, {
      duration: 0.7,
    });
  }, [focusCoords]);

  const handleFitAll = () => {
    const map = mapRef.current;
    if (!map || clusters.length === 0) return;
    if (clusters.length === 1) {
      map.flyTo([clusters[0].latitude, clusters[0].longitude], 6, { duration: 0.6 });
    } else {
      const bounds = L.latLngBounds(clusters.map((c) => [c.latitude, c.longitude]));
      map.flyToBounds(bounds, { padding: [56, 56], maxZoom: 7, duration: 0.6 });
    }
  };

  return (
    <div className="relative w-full h-full field-journal-tiles">
      <div ref={mapContainerRef} className="w-full h-full z-0" />

      {/* Empty state welcoming card when no entries exist */}
      {!isLoading && totalLogsCount === 0 && (
        <div className="absolute bottom-20 lg:bottom-8 left-4 right-4 sm:right-auto sm:max-w-xs z-[400] rounded-2xl bg-[#FFFDF9]/95 backdrop-blur-md border border-[#E2D9C8] p-4 shadow-md">
          <div className="flex items-center gap-2 text-[#2B6E4F] font-semibold text-sm">
            <Compass className="w-4 h-4 shrink-0" />
            <span>Your Atlas is Blank</span>
          </div>
          <p className="mt-1 text-xs text-[#5C665E] leading-relaxed">
            Tap <strong>+ Log City</strong> to drop your first pin, or preview the map with 6 sample travel stops.
          </p>
          <div className="mt-3 flex items-center gap-2">
            <button
              type="button"
              onClick={onOpenNewLog}
              className="flex-1 min-h-[40px] px-3 rounded-xl bg-[#1E2420] text-[#FFFDF9] text-xs font-semibold hover:bg-[#2F3732] transition-colors"
            >
              + Log First City
            </button>
            <button
              type="button"
              onClick={() => void onLoadSamples()}
              className="min-h-[40px] px-3 rounded-xl border border-[#E2D9C8] bg-[#F7F3EA] text-xs font-medium text-[#1E2420] hover:bg-[#EFE8D8] transition-colors flex items-center gap-1 whitespace-nowrap"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#D4652A]" />
              Sample Stops
            </button>
          </div>
        </div>
      )}

      {/* Thumb-Zone Map Controls (Bottom Right) */}
      <div className="absolute bottom-4 lg:bottom-6 right-3 sm:right-5 z-[400] flex flex-col items-end gap-2.5">
        {clusters.length > 0 && (
          <button
            type="button"
            onClick={handleFitAll}
            className="w-11 h-11 rounded-2xl bg-[#FFFDF9]/95 backdrop-blur-md border border-[#E2D9C8] shadow-md flex items-center justify-center text-[#1E2420] hover:bg-[#F7F3EA] active:scale-[0.96] transition-all"
            title="Fit all plotted cities"
            aria-label="Fit all plotted cities"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        )}

        <button
          type="button"
          onClick={onQuickGpsLog}
          className="w-11 h-11 rounded-2xl bg-[#FFFDF9]/95 backdrop-blur-md border border-[#E2D9C8] shadow-md flex items-center justify-center text-[#2B6E4F] hover:bg-[#E9F2EC] active:scale-[0.96] transition-all"
          title="Pin current GPS location"
          aria-label="Pin current GPS location"
        >
          <LocateFixed className="w-5 h-5" />
        </button>

        <button
          type="button"
          onClick={onOpenNewLog}
          className="h-12 px-4 rounded-2xl bg-[#1E2420] text-[#FFFDF9] shadow-lg shadow-[#1E2420]/20 hover:bg-[#2F3732] active:scale-[0.97] transition-all flex items-center gap-2 text-sm font-semibold whitespace-nowrap"
        >
          <Plus className="w-4 h-4" />
          <span>Log City</span>
        </button>
      </div>
    </div>
  );
};

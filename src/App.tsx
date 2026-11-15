import { useCallback, useMemo, useState } from 'react';
import { WifiOff } from 'lucide-react';
import { BottomNav } from './components/BottomNav';
import { CityDetailSheet } from './components/CityDetailSheet';
import { FilterStrip } from './components/FilterStrip';
import { JournalView } from './components/JournalView';
import { LogSheet } from './components/LogSheet';
import { StatsView } from './components/StatsView';
import { TopBar } from './components/TopBar';
import { WorldMap } from './components/WorldMap';
import { useCityLogs } from './hooks/useCityLogs';
import { useOnlineStatus } from './hooks/useOnlineStatus';
import type { CityCluster, CityLog, CitySuggestion, MobileTab, NewCityLogInput } from './types';

export default function App() {
  const {
    logs,
    filteredLogs,
    clusters,
    availableYears,
    stats,
    isLoading,
    error,
    isCloudSync,
    viewMode,
    setViewMode,
    activeLogger,
    setActiveLogger,
    dateFilter,
    setDateFilter,
    addLog,
    editLog,
    deleteLog,
    seedSampleStops,
    importLogs,
  } = useCityLogs();

  const isOnline = useOnlineStatus();

  const [mobileTab, setMobileTab] = useState<MobileTab>('map');
  const [desktopPanel, setDesktopPanel] = useState<'journal' | 'stats'>('journal');

  const [selectedClusterKey, setSelectedClusterKey] = useState<string | null>(null);
  const [focusCoords, setFocusCoords] = useState<{ lat: number; lng: number; zoom?: number } | null>(
    null
  );

  // LogSheet state
  const [isLogSheetOpen, setIsLogSheetOpen] = useState(false);
  const [editingLog, setEditingLog] = useState<CityLog | null>(null);
  const [prefillCity, setPrefillCity] = useState<CitySuggestion | null>(null);
  const [triggerGpsOnOpen, setTriggerGpsOnOpen] = useState(false);

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    window.setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 2600);
  }, []);

  const selectedCluster = useMemo(
    () => clusters.find((c) => c.key === selectedClusterKey) ?? null,
    [clusters, selectedClusterKey]
  );

  const handleToggleLogger = () => {
    setActiveLogger((prev) => (prev === 'crocodile' ? 'hamster' : 'crocodile'));
  };

  const handleOpenNewLog = () => {
    setEditingLog(null);
    setPrefillCity(null);
    setTriggerGpsOnOpen(false);
    setIsLogSheetOpen(true);
  };

  const handleQuickGpsLog = () => {
    setEditingLog(null);
    setPrefillCity(null);
    setTriggerGpsOnOpen(true);
    setIsLogSheetOpen(true);
  };

  const handleSelectCluster = useCallback((cluster: CityCluster) => {
    setSelectedClusterKey(cluster.key);
  }, []);

  const handleSubmitLog = async (input: NewCityLogInput, editId?: string) => {
    if (editId) {
      await editLog(editId, input);
      showToast(`Updated ${input.city}`);
    } else {
      await addLog(input);
      setFocusCoords({ lat: input.latitude, lng: input.longitude, zoom: 7 });
      showToast(`Pinned ${input.city}`);
    }
  };

  const handleEditFromDetail = (log: CityLog) => {
    setSelectedClusterKey(null);
    setEditingLog(log);
    setPrefillCity(null);
    setTriggerGpsOnOpen(false);
    setIsLogSheetOpen(true);
  };

  const handleAddVisitHere = (city: CitySuggestion) => {
    setSelectedClusterKey(null);
    setEditingLog(null);
    setPrefillCity(city);
    setTriggerGpsOnOpen(false);
    setIsLogSheetOpen(true);
  };

  const handleDeleteFromDetail = async (id: string) => {
    await deleteLog(id);
    showToast('Stamp deleted');
  };

  const handleSelectLogCity = (log: CityLog) => {
    const key = `${log.city.trim().toLowerCase()}|${log.country.trim().toLowerCase()}`;
    setFocusCoords({ lat: log.latitude, lng: log.longitude, zoom: 8 });
    setSelectedClusterKey(key);
    setMobileTab('map');
  };

  const handleFocusCityName = (cityCountryLabel: string) => {
    const match = clusters.find(
      (c) => `${c.city}, ${c.country}`.toLowerCase() === cityCountryLabel.toLowerCase()
    );
    if (match) {
      setFocusCoords({ lat: match.latitude, lng: match.longitude, zoom: 7 });
      setSelectedClusterKey(match.key);
      setMobileTab('map');
    }
  };

  return (
    <div className="h-[100dvh] flex flex-col bg-[#F7F3EA] text-[#1E2420] overflow-hidden">
      <TopBar
        activeLogger={activeLogger}
        onToggleLogger={handleToggleLogger}
        onOpenNewLog={handleOpenNewLog}
        desktopPanel={desktopPanel}
        onChangeDesktopPanel={setDesktopPanel}
      />

      {/* Offline & Error Banners */}
      {!isOnline && (
        <div className="px-4 py-1.5 bg-[#D4652A] text-[#FFFDF9] text-xs font-medium flex items-center justify-center gap-2 shrink-0">
          <WifiOff className="w-3.5 h-3.5" />
          <span>Offline mode — showing cached field atlas data.</span>
        </div>
      )}

      {error && (
        <div className="px-4 py-2 bg-[#FDECEC] border-b border-[#F5C6C1] text-xs font-medium text-[#B83B2A] text-center shrink-0">
          {error}
        </div>
      )}

      {/* Main Responsive Workspace */}
      <main className="flex-1 min-h-0 flex flex-col lg:grid lg:grid-cols-[1fr_410px] overflow-hidden">
        {/* Map Column (Always visible on desktop; visible when mobileTab === 'map' on mobile) */}
        <section
          className={`relative flex-1 min-h-0 flex flex-col ${
            mobileTab === 'map' ? 'flex' : 'hidden lg:flex'
          } pb-14 lg:pb-0`}
        >
          {/* Floating Filter Ribbon inside Map Canvas */}
          <div className="absolute top-3 left-3 right-3 sm:left-4 sm:right-auto sm:w-[400px] z-[400] pointer-events-auto">
            <FilterStrip
              viewMode={viewMode}
              onChangeViewMode={setViewMode}
              dateFilter={dateFilter}
              onChangeDateFilter={setDateFilter}
              availableYears={availableYears}
              resultCount={filteredLogs.length}
            />
          </div>

          <WorldMap
            clusters={clusters}
            selectedClusterKey={selectedClusterKey}
            focusCoords={focusCoords}
            totalLogsCount={logs.length}
            isLoading={isLoading}
            onSelectCluster={handleSelectCluster}
            onOpenNewLog={handleOpenNewLog}
            onQuickGpsLog={handleQuickGpsLog}
            onLoadSamples={seedSampleStops}
          />
        </section>

        {/* Side / Secondary Tab Column: Journal & Passport Stats */}
        <aside
          className={`flex-1 min-h-0 lg:border-l lg:border-[#E2D9C8] flex flex-col ${
            mobileTab === 'map' ? 'hidden lg:flex' : 'flex'
          }`}
        >
          {/* Mobile Filter Strip inside Journal/Stats tabs so switching views works everywhere */}
          <div className="lg:hidden px-4 pt-3 pb-2 bg-[#FFFDF9]/80 border-b border-[#E2D9C8] shrink-0">
            <FilterStrip
              viewMode={viewMode}
              onChangeViewMode={setViewMode}
              dateFilter={dateFilter}
              onChangeDateFilter={setDateFilter}
              availableYears={availableYears}
              resultCount={filteredLogs.length}
            />
          </div>

          {/* Mobile Journal / Stats Content */}
          <div className="flex-1 min-h-0 lg:hidden">
            {mobileTab === 'journal' ? (
              <JournalView
                logs={filteredLogs}
                onSelectLogCity={handleSelectLogCity}
                onOpenNewLog={handleOpenNewLog}
              />
            ) : (
              <StatsView
                stats={stats}
                allLogs={logs}
                isCloudSync={isCloudSync}
                onFocusCityName={handleFocusCityName}
                onImportLogs={importLogs}
              />
            )}
          </div>

          {/* Desktop Side Panel Content */}
          <div className="hidden lg:flex lg:flex-col flex-1 min-h-0">
            {desktopPanel === 'journal' ? (
              <JournalView
                logs={filteredLogs}
                onSelectLogCity={handleSelectLogCity}
                onOpenNewLog={handleOpenNewLog}
              />
            ) : (
              <StatsView
                stats={stats}
                allLogs={logs}
                isCloudSync={isCloudSync}
                onFocusCityName={handleFocusCityName}
                onImportLogs={importLogs}
              />
            )}
          </div>
        </aside>
      </main>

      <BottomNav activeTab={mobileTab} onChangeTab={setMobileTab} />

      {/* Drawers & Modals */}
      <CityDetailSheet
        cluster={selectedCluster}
        onClose={() => setSelectedClusterKey(null)}
        onEditLog={handleEditFromDetail}
        onDeleteLog={handleDeleteFromDetail}
        onAddVisitHere={handleAddVisitHere}
      />

      <LogSheet
        isOpen={isLogSheetOpen}
        defaultLogger={activeLogger}
        initialLog={editingLog}
        prefillCity={prefillCity}
        triggerGpsOnOpen={triggerGpsOnOpen}
        onClose={() => setIsLogSheetOpen(false)}
        onSubmit={handleSubmitLog}
      />

      {/* Lightweight Toast */}
      {toastMessage && (
        <div
          role="status"
          className="fixed bottom-20 lg:bottom-6 left-1/2 -translate-x-1/2 z-[1300] px-4 py-2 rounded-xl bg-[#1E2420] text-[#FFFDF9] text-xs font-semibold shadow-lg pointer-events-none"
        >
          {toastMessage}
        </div>
      )}
    </div>
  );
}

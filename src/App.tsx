import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { CoverFlowCarousel } from './components/CoverFlowCarousel';
import { OverviewList } from './components/OverviewList';

import photo01 from '../Sources/Photo 01.jpeg';
import photo02 from '../Sources/Photo 02.jpeg';
import photo03 from '../Sources/Photo 03.jpeg';
import photo04 from '../Sources/Photo 04.jpeg';
import photo05 from '../Sources/Photo 05.jpeg';
import photo06 from '../Sources/Photo 06.jpeg';
import photo07 from '../Sources/Photo 07.jpeg';
import photo08 from '../Sources/Photo 08.jpeg';
import photo09 from '../Sources/Photo 09.jpeg';

const basePhotos = [
  { url: photo01, fileName: 'Photo 01.jpeg', orientation: 'portrait' as const },
  { url: photo02, fileName: 'Photo 02.jpeg', orientation: 'portrait' as const },
  { url: photo03, fileName: 'Photo 03.jpeg', orientation: 'portrait' as const },
  { url: photo04, fileName: 'Photo 04.jpeg', orientation: 'portrait' as const },
  { url: photo05, fileName: 'Photo 05.jpeg', orientation: 'portrait' as const },
  { url: photo06, fileName: 'Photo 06.jpeg', orientation: 'portrait' as const },
  { url: photo07, fileName: 'Photo 07.jpeg', orientation: 'portrait' as const },
  { url: photo08, fileName: 'Photo 08.jpeg', orientation: 'portrait' as const },
  { url: photo09, fileName: 'Photo 09.jpeg', orientation: 'portrait' as const },
];

function IconSingleUser(props: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={props.className} fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M20 21v-1a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v1" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

function IconTwoUsers(props: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={props.className} fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M17 21v-1a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v1" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-1a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

function IconThreeUsers(props: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={props.className} fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M16 21v-1a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v1" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-1a4 4 0 0 0-3-3.87" />
      <path d="M15 3.13a4 4 0 0 1 0 7.75" />
      <path d="M19 8a3 3 0 1 0 0-6" />
    </svg>
  );
}

function IconReset(props: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={props.className} fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3 12a9 9 0 1 0 3-6.7" />
      <path d="M3 4v6h6" />
    </svg>
  );
}

/** Manual mode: classic mouse pointer */
function IconCursorManual(props: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={props.className}
    >
      <path d="M3 3l7.07 16.97 2.51-7.39 7.39-2.51L3 3z" />
      <path d="M13 13l6 6" />
    </svg>
  );
}

/** Auto / camera mode: watching */
function IconEyeAuto(props: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={props.className}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function App() {
  const photos = useMemo(
    () =>
      basePhotos.map((photo, index) => ({
        id: `img-${index}`,
        url: photo.url,
        fileName: photo.fileName,
        orientation: photo.orientation,
      })),
    [],
  );

  const [currentIndex, setCurrentIndex] = useState(0);
  const [decayLevels, setDecayLevels] = useState<Record<string, 0 | 1 | 2 | 3>>({});
  const [manualMode, setManualMode] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'overview' | 'detail'>('overview');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isExploding, setIsExploding] = useState(false);
  const [detailEntryNonce, setDetailEntryNonce] = useState(0);

  const [resetNonceById, setResetNonceById] = useState<Record<string, number>>({});

  const activePhotoId = photos[currentIndex]?.id;
  const currentDecayLevel = activePhotoId ? (decayLevels[activePhotoId] ?? 0) : 0;
  const canManual = manualMode;
  const selectedPhotoName = selectedId ? photos.find((photo) => photo.id === selectedId)?.fileName ?? null : null;

  const pollTimerRef = useRef<number | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const explodeTimerRef = useRef<number | null>(null);

  const mapFaceCountToDecayLevel = (count: number): 0 | 1 | 2 | 3 => {
    if (!Number.isFinite(count) || count <= 0) return 0;
    if (count <= 3) return 1;
    return 2;
  };

  useEffect(() => {
    if (!manualMode) {
      const tick = async () => {
        try {
          abortRef.current?.abort();
          const controller = new AbortController();
          abortRef.current = controller;

          const res = await fetch('http://127.0.0.1:5000/api/face-count', {
            method: 'GET',
            signal: controller.signal,
            headers: { Accept: 'application/json' },
            cache: 'no-store',
          });
          if (!res.ok) return;

          const data = (await res.json()) as unknown;
          const faceCount =
            typeof data === 'number'
              ? data
              : typeof data === 'object' && data !== null && 'count' in data
                ? Number((data as { count?: unknown }).count)
                : NaN;

          const proposed = mapFaceCountToDecayLevel(faceCount);
          if (!activePhotoId) return;
          setDecayLevels((prev) => {
            const existing = prev[activePhotoId] ?? 0;
            const next = Math.max(existing, proposed) as 0 | 1 | 2 | 3;
            if (next === existing) return prev;
            return { ...prev, [activePhotoId]: next };
          });
        } catch (err) {
          if (err instanceof DOMException && err.name === 'AbortError') return;
        }
      };

      void tick();
      pollTimerRef.current = window.setInterval(() => void tick(), 1000);

      return () => {
        if (pollTimerRef.current !== null) {
          window.clearInterval(pollTimerRef.current);
          pollTimerRef.current = null;
        }
        abortRef.current?.abort();
        abortRef.current = null;
      };
    }

    if (pollTimerRef.current !== null) {
      window.clearInterval(pollTimerRef.current);
      pollTimerRef.current = null;
    }
    abortRef.current?.abort();
    abortRef.current = null;
  }, [manualMode, activePhotoId]);

  const setLevel = (level: 0 | 1 | 2 | 3) => {
    if (!canManual) return;
    if (viewMode === 'overview') {
      setDecayLevels((prev) => {
        const next = { ...prev };
        photos.forEach((photo) => {
          next[photo.id] = level;
        });
        return next;
      });
      return;
    }
    if (!activePhotoId) return;
    setDecayLevels((prev) => ({ ...prev, [activePhotoId]: level }));
  };

  const resetActive = () => {
    if (viewMode === 'overview') {
      setDecayLevels((prev) => {
        const next = { ...prev };
        photos.forEach((photo) => {
          next[photo.id] = 0;
        });
        return next;
      });
      setResetNonceById((prev) => {
        const next = { ...prev };
        photos.forEach((photo) => {
          next[photo.id] = (prev[photo.id] ?? 0) + 1;
        });
        return next;
      });
      return;
    }
    if (!activePhotoId) return;
    setDecayLevels((prev) => ({ ...prev, [activePhotoId]: 0 }));
    setResetNonceById((prev) => ({ ...prev, [activePhotoId]: (prev[activePhotoId] ?? 0) + 1 }));
  };

  const handleSelectOverviewItem = (id: string) => {
    const nextIndex = photos.findIndex((photo) => photo.id === id);
    if (nextIndex < 0) return;
    setSelectedId(id);
    setCurrentIndex(nextIndex);
    setIsExploding(true);
    if (explodeTimerRef.current !== null) {
      window.clearTimeout(explodeTimerRef.current);
    }
    explodeTimerRef.current = window.setTimeout(() => {
      setViewMode('detail');
      setDetailEntryNonce((prev) => prev + 1);
      setIsExploding(false);
      explodeTimerRef.current = null;
    }, 400);
  };

  useEffect(() => {
    return () => {
      if (explodeTimerRef.current !== null) {
        window.clearTimeout(explodeTimerRef.current);
      }
    };
  }, []);

  const navItems = ['Gallery (Homepage)', 'Concept / Narrative', 'Art & Production', 'Technical Development', 'About'];

  return (
    <div className="min-h-screen bg-white text-black overflow-x-hidden">
      <div className="relative min-h-screen">
        
        {/* 1. Fixed Sidebar (Pure inline styles to guarantee width/position) */}
        <aside style={{
          position: 'fixed',
          top: 0,
          bottom: 0,
          left: 0,
          width: '60px',
          zIndex: 40,
          backgroundColor: 'rgba(255,255,255,0.95)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <button
            type="button"
            onClick={() => setIsMenuOpen((v) => !v)}
            aria-label="Toggle index menu"
            className="w-10 rounded-sm text-neutral-900 transition-all duration-500 hover:bg-neutral-100"
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <span
              className="text-[0.75rem] tracking-[0.35em] uppercase font-semibold"
              style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)', display: 'inline-block' }}
            >
              Index
            </span>
          </button>
        </aside>

        {/* 2. Slide-out Menu (No borders, seamless) */}
        <nav
          style={{
            position: 'fixed',
            top: 0,
            bottom: 0,
            left: '60px',
            width: '320px',
            zIndex: 30,
            backgroundColor: 'rgba(255,255,255,0.95)',
            backdropFilter: 'blur(24px)',
            padding: '3.5rem 2.5rem',
            transition: 'all 0.5s cubic-bezier(0.16,1,0.3,1)',
            transform: isMenuOpen ? 'translateX(0)' : 'translateX(-100%)',
            opacity: isMenuOpen ? 1 : 0,
            pointerEvents: isMenuOpen ? 'auto' : 'none',
          }}
          aria-hidden={!isMenuOpen}
        >
          <ul className="flex h-full flex-col justify-center gap-7">
            {navItems.map((item) => (
              <li key={item}>
                <button
                  type="button"
                  className="text-left text-2xl font-bold tracking-tight text-black/85 transition-colors duration-300 hover:text-black"
                >
                  {item}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        {/* 3. Main Content & Apple-style Blur */}
        <main
          style={{
            marginLeft: '60px',
            width: 'calc(100vw - 60px)',
            minHeight: '100vh',
            position: 'relative',
            zIndex: 10,
          }}
        >
          {/* The Blur Wrapper applies filter dynamically */}
          <div
            style={{
              minHeight: '100vh',
              transition: 'filter 0.5s cubic-bezier(0.16,1,0.3,1)',
              filter: isMenuOpen ? 'blur(12px) brightness(0.8)' : 'blur(0px) brightness(1)',
              pointerEvents: isMenuOpen ? 'none' : 'auto',
            }}
          >
            <div style={{ display: 'block', width: '100%', minHeight: '100vh', boxSizing: 'border-box' }}>
              <div style={{ display: 'block', width: '100%', boxSizing: 'border-box' }}>
                <AnimatePresence mode="wait">
                  {viewMode === 'overview' ? (
                    <motion.div
                      key="overview"
                      className="w-full"
                      initial={{ opacity: 1 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0, transition: { duration: 0.2 } }}
                    >
                      <OverviewList
                        photos={photos}
                        decayLevels={decayLevels}
                        resetNonceById={resetNonceById}
                        selectedId={selectedId}
                        isExploding={isExploding}
                        onSelect={handleSelectOverviewItem}
                      />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="detail"
                      className="w-full grid"
                      style={{
                        width: '100%',
                        minHeight: '100vh',
                        height: '100dvh',
                        placeItems: 'center',
                        alignContent: 'center',
                      }}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                    >
                      <div className="w-full max-w-7xl mx-auto px-8 flex flex-col gap-8 justify-center">
                        <div className="w-full flex justify-end">
                          <button
                            type="button"
                            onClick={() => {
                              setViewMode('overview');
                              setIsExploding(false);
                            }}
                            className="px-5 py-2 border-2 border-black bg-white text-black uppercase tracking-[0.2em] text-xs font-semibold hover:bg-black hover:text-white transition-colors"
                            aria-label={`Back to overview list${selectedPhotoName ? ` from ${selectedPhotoName}` : ''}`}
                          >
                            Back
                          </button>
                        </div>

                        <CoverFlowCarousel
                          photos={photos}
                          decayLevels={decayLevels}
                          currentIndex={currentIndex}
                          selectedLayoutId={selectedId}
                          detailEntryNonce={detailEntryNonce}
                          onChangeIndex={(nextIndex: number) => {
                            setCurrentIndex(nextIndex);
                            setSelectedId(photos[nextIndex]?.id ?? null);
                          }}
                          resetNonceById={resetNonceById}
                        />

                        <motion.div
                          key={`detail-controls-${detailEntryNonce}`}
                          className="w-full"
                          initial={{ x: -300, opacity: 0 }}
                          animate={{ x: 0, opacity: 1 }}
                          exit={{ x: -300, opacity: 0 }}
                          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                        >
                          <div className="flex items-center justify-end gap-8">
                            <button
                              type="button"
                              aria-label="Level 1"
                              onClick={() => setLevel(1)}
                              disabled={!canManual}
                              className={`w-12 h-12 shrink-0 border-2 border-black flex items-center justify-center bg-neutral-200 transition-colors disabled:text-neutral-300 ${canManual ? 'hover:bg-black hover:text-white' : ''}`}
                            >
                              <IconSingleUser className={`w-6 h-6 ${!canManual ? 'text-neutral-300 opacity-70' : ''}`} />
                            </button>

                            <button
                              type="button"
                              aria-label="Level 2"
                              onClick={() => setLevel(2)}
                              disabled={!canManual}
                              className={`w-12 h-12 shrink-0 border-2 border-black flex items-center justify-center bg-white transition-colors disabled:text-neutral-300 ${canManual ? 'hover:bg-black hover:text-white' : ''}`}
                            >
                              <IconTwoUsers className={`w-6 h-6 ${!canManual ? 'text-neutral-300 opacity-70' : ''}`} />
                            </button>

                            <button
                              type="button"
                              aria-label="Level 3"
                              onClick={() => setLevel(3)}
                              disabled={!canManual}
                              className={`w-12 h-12 shrink-0 border-2 border-black flex items-center justify-center bg-white transition-colors disabled:text-neutral-300 ${canManual ? 'hover:bg-black hover:text-white' : ''}`}
                            >
                              <IconThreeUsers className={`w-6 h-6 ${!canManual ? 'text-neutral-300 opacity-70' : ''}`} />
                            </button>

                            <button
                              type="button"
                              aria-label="Reset current image to perfect state"
                              onClick={resetActive}
                              className="w-12 h-12 shrink-0 border-2 border-black bg-white hover:bg-black hover:text-white transition-colors flex items-center justify-center"
                            >
                              <IconReset className="w-6 h-6" />
                            </button>

                            <button
                              type="button"
                              aria-label={
                                manualMode
                                  ? 'Manual mode: use level buttons (cursor)'
                                  : 'Auto camera mode: decay is irreversible (eye)'
                              }
                              onClick={() => setManualMode((v) => !v)}
                              className={`w-12 h-12 shrink-0 border-2 border-black flex items-center justify-center transition-colors hover:bg-black hover:text-white ${
                                manualMode ? 'bg-white' : 'bg-neutral-200'
                              }`}
                            >
                              {manualMode ? (
                                <IconCursorManual className="w-6 h-6" />
                              ) : (
                                <IconEyeAuto className="w-6 h-6" />
                              )}
                            </button>
                          </div>
                        </motion.div>
                      </div>
                  </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;

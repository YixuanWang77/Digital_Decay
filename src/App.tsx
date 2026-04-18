import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import landingVideo from '../Sources/Animations.mp4';

import { CoverFlowCarousel } from './components/CoverFlowCarousel';
import { OverviewList } from './components/OverviewList';

import photo01 from '../Sources/Photo 01.jpeg';
import photo02 from '../Sources/Photo 02.jpeg';
import photo03 from '../Sources/Photo 03.jpeg';
import photo04 from '../Sources/Photo 04.jpeg';
import photo05 from '../Sources/Photo 05.jpeg';
import photo06 from '../Sources/Photo 06.jpeg';
import photo07 from '../Sources/Photo 07.jpg';
import photo08 from '../Sources/Photo 08.jpeg';
import photo09 from '../Sources/Photo 09.jpeg';

gsap.registerPlugin(ScrollTrigger, useGSAP);

const basePhotos = [
  { url: photo01, fileName: 'Photo 01.jpeg', orientation: 'portrait' as const },
  { url: photo02, fileName: 'Photo 02.jpeg', orientation: 'portrait' as const },
  { url: photo03, fileName: 'Photo 03.jpeg', orientation: 'portrait' as const },
  { url: photo04, fileName: 'Photo 04.jpeg', orientation: 'portrait' as const },
  { url: photo05, fileName: 'Photo 05.jpeg', orientation: 'portrait' as const },
  { url: photo06, fileName: 'Photo 06.jpeg', orientation: 'portrait' as const },
  { url: photo07, fileName: 'Photo 07.jpg', orientation: 'portrait' as const },
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

function LandingSequence({ onComplete }: { onComplete: () => void }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoWrapperRef = useRef<HTMLDivElement>(null);
  const textContainerRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const container = containerRef.current;
      const videoWrap = videoWrapperRef.current;
      const textEl = textContainerRef.current;
      if (!container || !videoWrap || !textEl) return;

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: container,
          start: 'top top',
          end: '+=3000',
          scrub: 1,
          pin: true,
          onLeave: () => {
            window.scrollTo(0, 0);
            onComplete();
          },
        },
      });

      // 强行放大 150 倍，确保无论屏幕多大都能完全穿透
      tl.to(textEl, {
        scale: 150,
        opacity: 0,
        ease: 'power2.in',
      });

      // 背景视频淡出
      tl.to(
        videoWrap,
        {
          opacity: 0,
          duration: 0.5,
          ease: 'power1.inOut',
        },
        '-=0.2',
      );
    },
    { scope: containerRef },
  );

  return (
    <div
      ref={containerRef}
      style={{
        position: 'relative',
        zIndex: 100, // 强行突破 10 的封锁，立于最顶层
        width: '100%',
        height: '100vh',
        overflow: 'hidden',
        backgroundColor: '#ffffff',
      }}
    >
      {/* Layer 2: Video Background */}
      <div
        ref={videoWrapperRef}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          width: '100%',
          height: '100vh',
          zIndex: 10,
          backgroundColor: '#000000',
        }}
      >
        <video
          src={landingVideo}
          autoPlay
          loop
          muted
          playsInline
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            opacity: 1,
          }}
        />
      </div>

      {/* Layer 3: White Text Overlay */}
      <div
        ref={textContainerRef}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 20,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          pointerEvents: 'none',
          transformOrigin: 'center center',
        }}
      >
        <h1
          style={{
            color: '#ffffff',
            fontWeight: 900,
            display: 'flex',
            alignItems: 'center',
            gap: '6vw',
            whiteSpace: 'nowrap',
            margin: 0,
            padding: 0,
            fontSize: '9vw',
            letterSpacing: '0.02em',
          }}
        >
          <span>DIGITAL</span>
          <span>DECAY</span>
        </h1>
      </div>
    </div>
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
  const [viewMode, setViewMode] = useState<'landing' | 'overview' | 'detail'>('landing');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [detailEntryNonce, setDetailEntryNonce] = useState(0);

  const [resetNonceById, setResetNonceById] = useState<Record<string, number>>({});

  const activePhotoId = photos[currentIndex]?.id;
  const canManual = manualMode;
  const selectedPhotoName = selectedId ? photos.find((photo) => photo.id === selectedId)?.fileName ?? null : null;

  const pollTimerRef = useRef<number | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const mapFaceCountToDecayLevel = (count: number): 0 | 1 | 2 | 3 => {
    if (!Number.isFinite(count) || count <= 0) return 0;
    if (count === 1) return 1;
    if (count === 2) return 2;
    return 3; // 3 or more people trigger the maximum decay
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
    if (viewMode === 'overview' || viewMode === 'landing') {
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
    if (viewMode === 'overview' || viewMode === 'landing') {
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
    setViewMode('detail');
    setDetailEntryNonce((prev) => prev + 1);
  };

  const navItems = ['Gallery (Homepage)', 'Concept / Narrative', 'Art & Production', 'Technical Development', 'About'];

  return (
    <div className="min-h-screen bg-white text-black overflow-x-hidden">
      {viewMode === 'landing' && <LandingSequence onComplete={() => setViewMode('overview')} />}
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
            minHeight: viewMode === 'detail' ? undefined : '100vh',
            height: viewMode === 'detail' ? '100dvh' : undefined,
            maxHeight: viewMode === 'detail' ? '100dvh' : undefined,
            overflow: viewMode === 'detail' ? 'hidden' : undefined,
            position: viewMode === 'landing' ? 'fixed' : 'relative',
            top: viewMode === 'landing' ? 0 : undefined,
            zIndex: 10,
          }}
        >
          {/* The Blur Wrapper applies filter dynamically */}
          <div
            style={{
              minHeight: viewMode === 'detail' ? 0 : '100vh',
              height: viewMode === 'detail' ? '100%' : undefined,
              maxHeight: viewMode === 'detail' ? '100%' : undefined,
              overflow: viewMode === 'detail' ? 'hidden' : undefined,
              transition: 'filter 0.5s cubic-bezier(0.16,1,0.3,1)',
              filter: isMenuOpen ? 'blur(12px) brightness(0.8)' : 'blur(0px) brightness(1)',
              pointerEvents: viewMode === 'landing' || isMenuOpen ? 'none' : 'auto',
            }}
          >
            <div
              style={{
                display: 'block',
                width: '100%',
                minHeight: viewMode === 'detail' ? 0 : '100vh',
                height: viewMode === 'detail' ? '100%' : undefined,
                maxHeight: viewMode === 'detail' ? '100%' : undefined,
                overflow: viewMode === 'detail' ? 'hidden' : undefined,
                boxSizing: 'border-box',
              }}
            >
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr',
                  gridTemplateRows: '1fr',
                  width: '100%',
                  height: viewMode === 'detail' ? '100%' : undefined,
                  minHeight: viewMode === 'detail' ? 0 : undefined,
                  boxSizing: 'border-box',
                }}
              >
                <AnimatePresence>
                  {(viewMode === 'overview' || viewMode === 'landing') && (
                    <motion.div
                      key="overview"
                      className="w-full"
                      style={{ gridArea: '1 / 1 / 2 / 2' }}
                      initial={{ opacity: 1 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0, transition: { duration: 0.2 } }}
                    >
                      <OverviewList
                        photos={photos}
                        decayLevels={decayLevels}
                        resetNonceById={resetNonceById}
                        selectedId={selectedId}
                        onSelect={handleSelectOverviewItem}
                      />
                    </motion.div>
                  )}
                  {viewMode === 'detail' && (
                    <motion.div
                      key="detail"
                      className="w-full flex h-full min-h-0 flex-col items-stretch bg-white"
                      style={{
                        gridArea: '1 / 1 / 2 / 2',
                        width: '100%',
                        zIndex: 10,
                      }}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                    >
                      <div className="flex h-full min-h-0 w-full max-w-7xl flex-col gap-8 mx-auto px-8">
                        <div className="shrink-0 w-full flex justify-end">
                          <button
                            type="button"
                            onClick={() => {
                              setViewMode('overview');
                            }}
                            className="px-5 py-2 border-2 border-black bg-white text-black uppercase tracking-[0.2em] text-xs font-semibold hover:bg-black hover:text-white transition-colors"
                            aria-label={`Back to overview list${selectedPhotoName ? ` from ${selectedPhotoName}` : ''}`}
                          >
                            Back
                          </button>
                        </div>

                        <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden">
                          <div className="flex min-h-full items-center justify-center">
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
                          </div>
                        </div>

                        <motion.div
                          key={`detail-controls-${detailEntryNonce}`}
                          className="shrink-0 w-full"
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

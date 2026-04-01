import { useEffect, useMemo, useRef, useState } from 'react';
import { CoverFlowCarousel } from './components/CoverFlowCarousel';

const basePhotos = [
  {
    url: 'https://images.unsplash.com/photo-1607699265032-3eafa2806ae6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhcmNoaXRlY3R1cmUlMjBtaW5pbWFsJTIwYmxhY2slMjB3aGl0ZXxlbnwxfHx8fDE3NzA1OTkzOTV8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    fileName: 'ARCH_001.jpg',
    orientation: 'portrait' as const,
  },
  {
    url: 'https://images.unsplash.com/photo-1595411425732-e69c1abe2763?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhYnN0cmFjdCUyMGdlb21ldHJpYyUyMHBhdHRlcm58ZW58MXx8fHwxNzcwNTEwOTM5fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    fileName: 'GEOMETRIC_002.jpg',
    orientation: 'portrait' as const,
  },
  {
    url: 'https://images.unsplash.com/photo-1673460244101-f80f7d9d9d9c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtaW5pbWFsJTIwbGFuZHNjYXBlJTIwbW9ub2Nocm9tZXxlbnwxfHx8fDE3NzA1OTkzOTZ8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    fileName: 'LANDSCAPE_003.jpg',
    orientation: 'portrait' as const,
  },
  {
    url: 'https://images.unsplash.com/photo-1769283979195-d418a41ae2ec?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxicnV0YWxpc3QlMjBidWlsZGluZyUyMGNvbmNyZXRlfGVufDF8fHx8MTc3MDU5OTM5Nnww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    fileName: 'BRUTALIST_004.jpg',
    orientation: 'portrait' as const,
  },
  {
    url: 'https://images.unsplash.com/photo-1705321963943-de94bb3f0dd3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtaW5pbWFsaXN0JTIwaW50ZXJpb3IlMjBkZXNpZ258ZW58MXx8fHwxNzcwNTk4NzYxfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    fileName: 'INTERIOR_005.jpg',
    orientation: 'portrait' as const,
  },
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

/** Manual mode: classic mouse pointer (Lucide-style outline). */
function IconCursorManual(props: { className?: string }) {
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
      <path d="M4.037 4.688a.495.495 0 0 1 .651-.651l16 6.5a.5.5 0 0 1-.063.947l-6.333 2.106-6.352-6.352 2.104-6.333zm1.034 1.034l5.59 5.59 4.354-1.452L5.071 5.722z" />
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
  const [decayLevel, setDecayLevel] = useState<0 | 1 | 2 | 3>(0);
  const [manualMode, setManualMode] = useState(true);

  const [resetNonceById, setResetNonceById] = useState<Record<string, number>>({});

  const activePhotoId = photos[currentIndex]?.id;
  const canManual = manualMode;

  const pollTimerRef = useRef<number | null>(null);
  const abortRef = useRef<AbortController | null>(null);

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
          setDecayLevel((prev) => Math.max(prev, proposed) as 0 | 1 | 2 | 3);
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
  }, [manualMode]);

  const setLevel = (level: 0 | 1 | 2 | 3) => {
    if (!canManual) return;
    setDecayLevel(level);
  };

  const resetActive = () => {
    if (!activePhotoId) return;
    setDecayLevel(0);
    setResetNonceById((prev) => ({ ...prev, [activePhotoId]: (prev[activePhotoId] ?? 0) + 1 }));
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <main className="flex-1 flex items-center justify-center">
        <div className="w-full">
          <CoverFlowCarousel
            photos={photos}
            decayLevel={decayLevel}
            currentIndex={currentIndex}
            onChangeIndex={setCurrentIndex}
            resetNonceById={resetNonceById}
          />

          <div className="w-full max-w-7xl mx-auto px-8 mt-6 pb-8">
            <div className="flex items-center justify-end gap-8">
              <button
                type="button"
                aria-label="Level 1"
                onClick={() => setLevel(1)}
                disabled={!canManual}
                className={`w-12 h-12 shrink-0 border-2 border-black flex items-center justify-center bg-neutral-200 transition-colors enabled:hover:bg-black enabled:hover:text-white disabled:text-neutral-300`}
              >
                <IconSingleUser
                  className={`w-6 h-6 ${!canManual ? 'text-neutral-300 opacity-70' : ''}`}
                />
              </button>

              <button
                type="button"
                aria-label="Level 2"
                onClick={() => setLevel(2)}
                disabled={!canManual}
                className={`w-12 h-12 shrink-0 border-2 border-black flex items-center justify-center bg-white transition-colors enabled:hover:bg-black enabled:hover:text-white disabled:text-neutral-300`}
              >
                <IconTwoUsers
                  className={`w-6 h-6 ${!canManual ? 'text-neutral-300 opacity-70' : ''}`}
                />
              </button>

              <button
                type="button"
                aria-label="Level 3"
                onClick={() => setLevel(3)}
                disabled={!canManual}
                className={`w-12 h-12 shrink-0 border-2 border-black flex items-center justify-center bg-white transition-colors enabled:hover:bg-black enabled:hover:text-white disabled:text-neutral-300`}
              >
                <IconThreeUsers
                  className={`w-6 h-6 ${!canManual ? 'text-neutral-300 opacity-70' : ''}`}
                />
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
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;

import type { CSSProperties } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { DecayingImage } from './DecayingImage';

interface Photo {
  id: string;
  url: string;
  fileName: string;
  orientation: 'landscape' | 'portrait';
}

interface OverviewListProps {
  photos: Photo[];
  decayLevels: Record<string, 0 | 1 | 2 | 3>;
  resetNonceById: Record<string, number | undefined>;
  selectedId: string | null;
  onSelect: (id: string) => void;
}

const gridContainerStyle: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: '1fr 1fr 1fr',
  columnGap: '6rem',
  rowGap: '12rem',
  width: '100%',
  maxWidth: '1600px',
  margin: '0 auto',
  boxSizing: 'border-box',
};

export function OverviewList({
  photos,
  decayLevels,
  resetNonceById,
  selectedId,
  onSelect,
}: OverviewListProps) {
  const selectedIndex = selectedId ? photos.findIndex((p) => p.id === selectedId) : -1;

  return (
    <div
      style={{
        width: '100%',
        maxWidth: '100%',
        backgroundColor: '#ffffff',
        minHeight: '100vh',
        padding: '3rem 5rem',
        boxSizing: 'border-box',
      }}
    >
      <AnimatePresence>
        <motion.div
          key="naaro-grid"
          style={gridContainerStyle}
          initial={{ opacity: 1 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {photos.map((photo, index) => {
            const isSelected = selectedId === photo.id;
            const col = index % 3;
            const paddingTop = col === 0 ? '0px' : col === 1 ? '180px' : '90px';
            const frameHeightPx = photo.orientation === 'landscape' ? 320 : 500;

            return (
              <motion.div
                key={photo.id}
                style={{
                  paddingTop,
                  minWidth: 0,
                  width: '100%',
                  boxSizing: 'border-box',
                }}
                initial={{ opacity: 1, x: 0, y: 0 }}
                animate={{ opacity: 1, x: 0, y: 0 }}
                exit={
                  isSelected
                    ? { opacity: 0 }
                    : {
                        x: col === 0 ? -2000 : col === 2 ? 2000 : 0,
                        y: col === 1 ? (index < selectedIndex ? -2000 : 2000) : 0,
                        opacity: 0,
                      }
                }
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                onClick={() => onSelect(photo.id)}
                className="cursor-pointer"
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onSelect(photo.id);
                  }
                }}
                aria-label={`Open ${photo.fileName}`}
              >
                <motion.div
                  layoutId={isSelected ? `photo-${photo.id}` : undefined}
                  style={{
                    width: '100%',
                    height: frameHeightPx,
                    overflow: 'hidden',
                    boxSizing: 'border-box',
                  }}
                >
                  <DecayingImage
                    id={photo.id}
                    src={photo.url}
                    alt={photo.fileName}
                    className="w-full h-full object-cover"
                    decayLevel={decayLevels[photo.id] ?? 0}
                    resetNonce={resetNonceById[photo.id] ?? 0}
                    isActive={false}
                  />
                </motion.div>
              </motion.div>
            );
          })}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

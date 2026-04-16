import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { DecayingImage } from './DecayingImage';

interface Photo {
  id: string;
  url: string;
  fileName: string;
  orientation: 'landscape' | 'portrait';
}

interface CoverFlowCarouselProps {
  photos: Photo[];
  decayLevels: Record<string, 0 | 1 | 2 | 3>;
  currentIndex: number;
  onChangeIndex: (nextIndex: number) => void;
  resetNonceById: Record<string, number | undefined>;
  selectedLayoutId?: string | null;
  detailEntryNonce?: number;
}

/** Fixed outer dimensions so previews are not squashed when motion sets transform. */
const frameLargeSize = (landscape: boolean) =>
  landscape ? { width: 750, height: 600 } : { width: 600, height: 750 };

const frameSmallSize = (landscape: boolean) =>
  landscape ? { width: 500, height: 400 } : { width: 384, height: 576 };

export function CoverFlowCarousel({
  photos,
  decayLevels,
  currentIndex,
  onChangeIndex,
  resetNonceById,
  selectedLayoutId = null,
  detailEntryNonce = 0,
}: CoverFlowCarouselProps) {
  const totalSlides = photos.length;

  const handlePrevious = () => {
    onChangeIndex(currentIndex === 0 ? totalSlides - 1 : currentIndex - 1);
  };

  const handleNext = () => {
    onChangeIndex(currentIndex === totalSlides - 1 ? 0 : currentIndex + 1);
  };

  const getPreviousIndex = () => (currentIndex === 0 ? totalSlides - 1 : currentIndex - 1);
  const getNextIndex = () => (currentIndex === totalSlides - 1 ? 0 : currentIndex + 1);

  const renderSlide = (index: number, size: 'small' | 'large', opacity: number) => {
    const isLarge = size === 'large';
    const photo = photos[index];
    const isLandscape = photo.orientation === 'landscape';
    const frameSize = isLarge ? frameLargeSize(isLandscape) : frameSmallSize(isLandscape);
    const frameClasses = isLarge
      ? 'border-4 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]'
      : 'border-2';

    const sharedLayoutId = isLarge && selectedLayoutId === photo.id ? `photo-${photo.id}` : undefined;

    return (
      <motion.div
        layoutId={sharedLayoutId}
        className={`${frameClasses} relative shrink-0 overflow-hidden border-black box-border`}
        style={{
          opacity,
          width: `${frameSize.width}px`,
          minWidth: `${frameSize.width}px`,
          maxWidth: `${frameSize.width}px`,
          height: `${frameSize.height}px`,
          minHeight: `${frameSize.height}px`,
          maxHeight: `${frameSize.height}px`,
          flex: '0 0 auto',
        }}
      >
        <DecayingImage
          id={photo.id}
          src={photo.url}
          alt={photo.fileName}
          className="w-full h-full object-cover"
          isActive={index === currentIndex}
          decayLevel={decayLevels[photo.id] ?? 0}
          resetNonce={resetNonceById[photo.id] ?? 0}
        />
      </motion.div>
    );
  };

  if (photos.length === 0) {
    return (
      <div className="text-center">
        <p className="text-black uppercase tracking-wider">No photos in archive</p>
      </div>
    );
  }

  const previousIndex = getPreviousIndex();
  const nextIndex = getNextIndex();
  const activeIsLandscape = photos[currentIndex]?.orientation === 'landscape';
  const activeLargeSize = frameLargeSize(activeIsLandscape);

  return (
    <div className="w-full max-w-7xl mx-auto px-8">
      <div
        className="relative w-full flex items-center justify-center"
        style={{
          minHeight: `${activeLargeSize.height}px`,
          height: '75vh',
        }}
      >
        <motion.div
          key={`prev-${previousIndex}`}
          className="absolute left-0 z-[5] cursor-pointer"
          style={{ top: '50%' }}
          initial={{ opacity: 0, x: -100, y: '-50%' }}
          animate={{ opacity: 0.3, x: 0, y: '-50%' }}
          transition={{ duration: 0.5 }}
          onClick={handlePrevious}
        >
          {renderSlide(previousIndex, 'small', 0.3)}
        </motion.div>

        <AnimatePresence mode="wait">
          <motion.div
            key={`current-${currentIndex}`}
            className="z-10 shrink-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            {renderSlide(currentIndex, 'large', 1)}
          </motion.div>
        </AnimatePresence>

        <motion.div
          key={`next-${nextIndex}`}
          className="absolute right-0 z-[5] cursor-pointer"
          style={{ top: '50%' }}
          initial={{ opacity: 0, x: 100, y: '-50%' }}
          animate={{ opacity: 0.3, x: 0, y: '-50%' }}
          transition={{ duration: 0.5 }}
          onClick={handleNext}
        >
          {renderSlide(nextIndex, 'small', 0.3)}
        </motion.div>

        <motion.div
          key={`arrow-left-${detailEntryNonce}`}
          className="absolute left-8 top-1/2 -translate-y-1/2 z-20"
          initial={{ x: -150, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        >
          <button
            type="button"
            onClick={handlePrevious}
            className="w-12 h-12 bg-white border-2 border-black hover:bg-black hover:text-white transition-colors flex items-center justify-center"
            aria-label="Previous photo"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
        </motion.div>

        <motion.div
          key={`arrow-right-${detailEntryNonce}`}
          className="absolute right-8 top-1/2 -translate-y-1/2 z-20"
          initial={{ x: 150, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        >
          <button
            type="button"
            onClick={handleNext}
            className="w-12 h-12 bg-white border-2 border-black hover:bg-black hover:text-white transition-colors flex items-center justify-center"
            aria-label="Next photo"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </motion.div>
      </div>
    </div>
  );
}

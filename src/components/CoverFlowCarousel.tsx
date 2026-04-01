import React, { useState } from 'react';
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
  decayLevel: 0 | 1 | 2 | 3;
  currentIndex: number;
  onChangeIndex: (nextIndex: number) => void;
  resetNonceById: Record<string, number | undefined>;
}

export function CoverFlowCarousel({
  photos,
  decayLevel,
  currentIndex,
  onChangeIndex,
  resetNonceById,
}: CoverFlowCarouselProps) {
  const totalSlides = photos.length;

  const handlePrevious = () => {
    onChangeIndex(currentIndex === 0 ? totalSlides - 1 : currentIndex - 1);
  };

  const handleNext = () => {
    onChangeIndex(currentIndex === totalSlides - 1 ? 0 : currentIndex + 1);
  };

  const getPreviousIndex = () => {
    return currentIndex === 0 ? totalSlides - 1 : currentIndex - 1;
  };

  const getNextIndex = () => {
    return currentIndex === totalSlides - 1 ? 0 : currentIndex + 1;
  };

  const renderSlide = (index: number, size: 'small' | 'large', opacity: number) => {
    const isLarge = size === 'large';
    const photo = photos[index];
    const isLandscape = photo.orientation === 'landscape';

    let frameClasses = '';
    if (isLarge) {
      frameClasses = isLandscape
        ? 'w-[750px] h-[600px] border-4 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]'
        : 'w-[600px] h-[750px] border-4 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]';
    } else {
      frameClasses = isLandscape
        ? 'w-[500px] h-[400px] border-2'
        : 'w-96 h-[576px] border-2';
    }

    return (
      <div
        className={`${frameClasses} relative overflow-hidden border-black`}
        style={{ opacity }}
      >
        <DecayingImage
          id={photo.id}
          src={photo.url}
          alt={photo.fileName}
          className={`w-full h-full object-cover grayscale`}
          isActive={index === currentIndex}
          decayLevel={decayLevel}
          resetNonce={resetNonceById[photo.id] ?? 0}
        />
      </div>
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

  return (
    <div className="w-full max-w-7xl mx-auto px-8">
      <div className="relative h-[900px] flex items-center justify-center">
        <motion.div
          key={`prev-${previousIndex}`}
          className={`absolute left-0 cursor-pointer`}
          initial={{ opacity: 0, x: -100 }}
          animate={{ opacity: 0.3, x: 0 }}
          transition={{ duration: 0.5 }}
          onClick={handlePrevious}
        >
          {renderSlide(previousIndex, 'small', 0.3)}
        </motion.div>

        <AnimatePresence mode="wait">
          <motion.div
            key={`current-${currentIndex}`}
            className="z-10"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.5 }}
          >
            {renderSlide(currentIndex, 'large', 1)}
          </motion.div>
        </AnimatePresence>

        <motion.div
          key={`next-${nextIndex}`}
          className={`absolute right-0 cursor-pointer`}
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 0.3, x: 0 }}
          transition={{ duration: 0.5 }}
          onClick={handleNext}
        >
          {renderSlide(nextIndex, 'small', 0.3)}
        </motion.div>

        <button
          onClick={handlePrevious}
          className="absolute left-8 top-1/2 -translate-y-1/2 z-20 w-12 h-12 bg-white border-2 border-black hover:bg-black hover:text-white transition-colors flex items-center justify-center"
          aria-label="Previous photo"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>

        <button
          onClick={handleNext}
          className="absolute right-8 top-1/2 -translate-y-1/2 z-20 w-12 h-12 bg-white border-2 border-black hover:bg-black hover:text-white transition-colors flex items-center justify-center"
          aria-label="Next photo"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
}

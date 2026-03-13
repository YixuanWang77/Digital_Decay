import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { DecayingImage } from './DecayingImage';

interface Photo {
  id: number;
  url: string;
  fileName: string;
  orientation: 'landscape' | 'portrait';
  isUploaded?: boolean;
}

interface CoverFlowCarouselProps {
  photos: Photo[];
  onUpload: (file: File) => void;
}

export function CoverFlowCarousel({ photos, onUpload }: CoverFlowCarouselProps) {
  // Add upload placeholder as the last "slide"
  const totalSlides = photos.length + 1;
  const [currentIndex, setCurrentIndex] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? totalSlides - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === totalSlides - 1 ? 0 : prev + 1));
  };

  const getPreviousIndex = () => {
    return currentIndex === 0 ? totalSlides - 1 : currentIndex - 1;
  };

  const getNextIndex = () => {
    return currentIndex === totalSlides - 1 ? 0 : currentIndex + 1;
  };

  const isUploadPlaceholder = (index: number) => {
    return index === photos.length;
  };

  const renderSlide = (index: number, size: 'small' | 'large', opacity: number) => {
    const isPlaceholder = isUploadPlaceholder(index);
    const isLarge = size === 'large';

    if (isPlaceholder) {
      // Get the orientation from the last uploaded photo, default to portrait
      const lastPhotoOrientation = photos.length > 0 ? photos[photos.length - 1].orientation : 'portrait';
      const isLandscape = lastPhotoOrientation === 'landscape';
      
      let placeholderClasses = '';
      if (isLarge) {
        placeholderClasses = isLandscape
          ? 'w-[750px] h-[600px] border-4'
          : 'w-[600px] h-[750px] border-4';
      } else {
        placeholderClasses = isLandscape
          ? 'w-[500px] h-[400px] border-2'
          : 'w-96 h-[576px] border-2';
      }
      
      return (
        <div
          className={`${placeholderClasses} relative overflow-hidden border-black border-dashed bg-[#f5f5f5] flex flex-col items-center justify-center ${
            isLarge ? 'cursor-pointer hover:bg-[#eeeeee] transition-colors' : ''
          }`}
          onClick={isLarge ? () => fileInputRef.current?.click() : undefined}
          style={{ opacity }}
        >
          {/* Crosshair Icon */}
          <Plus className={`${isLarge ? 'w-16 h-16' : 'w-10 h-10'} text-black stroke-1`} strokeWidth={1} />
          {/* Monospaced Text */}
          <p className={`${isLarge ? 'text-sm mt-6' : 'text-xs mt-3'} text-black tracking-wider font-mono`}>
            INSERT_NEW_SLIDE
          </p>
        </div>
      );
    }

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
          src={photo.url}
          alt={photo.fileName}
          className={`w-full h-full object-cover ${photo.isUploaded ? '' : 'grayscale'}`}
          isActive={index === currentIndex} // <-- 加上这一行！只有正中央(当前)的图才会收到 true 信号
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
  const isCurrentPlaceholder = isUploadPlaceholder(currentIndex);

  return (
    <div className="w-full max-w-7xl mx-auto px-8">
      {/* Carousel Container */}
      <div className="relative h-[900px] flex items-center justify-center">
        {/* Previous Slide */}
        <motion.div
          key={`prev-${previousIndex}`}
          className={`absolute left-0 ${!isUploadPlaceholder(previousIndex) ? 'cursor-pointer' : ''}`}
          initial={{ opacity: 0, x: -100 }}
          animate={{ opacity: 0.3, x: 0 }}
          transition={{ duration: 0.5 }}
          onClick={!isUploadPlaceholder(previousIndex) ? handlePrevious : undefined}
        >
          {renderSlide(previousIndex, 'small', 0.3)}
        </motion.div>

        {/* Current (Center) Slide */}
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

        {/* Next Slide */}
        <motion.div
          key={`next-${nextIndex}`}
          className={`absolute right-0 ${!isUploadPlaceholder(nextIndex) ? 'cursor-pointer' : ''}`}
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 0.3, x: 0 }}
          transition={{ duration: 0.5 }}
          onClick={!isUploadPlaceholder(nextIndex) ? handleNext : undefined}
        >
          {renderSlide(nextIndex, 'small', 0.3)}
        </motion.div>

        {/* Navigation Arrows */}
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

      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept="image/*"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) {
            onUpload(file);
            // Reset the input so the same file can be uploaded again if needed
            e.target.value = '';
          }
        }}
      />
    </div>
  );
}
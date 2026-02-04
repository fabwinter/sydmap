import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface HeroSlideshowProps {
  images: string[];
  title?: string;
  subtitle?: string;
  interval?: number;
}

export function HeroSlideshow({ 
  images, 
  title = "Welcome to Sydney",
  subtitle,
  interval = 5000 
}: HeroSlideshowProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (images.length <= 1) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, interval);

    return () => clearInterval(timer);
  }, [images.length, interval]);

  return (
    <section className="relative overflow-hidden rounded-3xl bg-slate-900 text-white h-64 md:h-72 lg:h-80">
      {/* Image layer - absolute positioned to fill container */}
      <div className="absolute inset-0">
        <AnimatePresence mode="popLayout">
          <motion.img
            key={currentIndex}
            src={images[currentIndex]}
            alt="Sydney"
            className="w-full h-full object-cover"
            initial={{ opacity: 0, scale: 1 }}
            animate={{ 
              opacity: 1,
              scale: 1.1,
            }}
            exit={{ opacity: 0 }}
            transition={{
              opacity: { duration: 1, ease: "easeInOut" },
              scale: { duration: 10, ease: "easeOut" },
            }}
          />
        </AnimatePresence>
      </div>

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

      {/* Text content - centered */}
      <div className="relative z-10 flex h-full flex-col items-center justify-center px-6 text-center space-y-3">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="text-3xl md:text-4xl lg:text-5xl font-bold drop-shadow-lg"
        >
          {title}
        </motion.h1>
        {subtitle && (
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="text-base md:text-lg text-slate-100/90 drop-shadow-md"
          >
            {subtitle}
          </motion.p>
        )}
      </div>

      {/* Slide indicators */}
      {images.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 flex gap-2">
          {images.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                index === currentIndex 
                  ? "bg-white w-6" 
                  : "bg-white/50 hover:bg-white/70"
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </section>
  );
}

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
    <div className="relative h-48 md:h-64 lg:h-80 max-h-[400px] rounded-2xl overflow-hidden">
      <AnimatePresence mode="popLayout">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0 }}
          animate={{ 
            opacity: 1,
            scale: [1, 1.1],
          }}
          exit={{ opacity: 0 }}
          transition={{
            opacity: { duration: 1, ease: "easeInOut" },
            scale: { duration: 10, ease: "easeOut" },
          }}
          className="absolute inset-0"
        >
          <img
            src={images[currentIndex]}
            alt="Sydney"
            className="w-full h-full object-cover"
          />
        </motion.div>
      </AnimatePresence>

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

      {/* Text content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="text-3xl md:text-4xl lg:text-5xl font-bold text-white drop-shadow-lg"
          style={{ textShadow: "0 4px 12px rgba(0,0,0,0.5)" }}
        >
          {title}
        </motion.h1>
        {subtitle && (
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="text-white/90 text-lg md:text-xl mt-2 drop-shadow-md"
            style={{ textShadow: "0 2px 8px rgba(0,0,0,0.4)" }}
          >
            {subtitle}
          </motion.p>
        )}
      </div>

      {/* Slide indicators */}
      {images.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
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
    </div>
  );
}

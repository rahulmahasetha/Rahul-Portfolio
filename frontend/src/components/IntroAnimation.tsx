import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const phrases = [
  "Crafting Digital Experiences",
  "Building Scalable Software",
  "Engineering Intelligent Solutions",
  "Preparing Interactive Portfolio"
];

export const IntroAnimation = ({ onComplete }: { onComplete: () => void }) => {
  const [currentPhrase, setCurrentPhrase] = useState(0);
  const [showMain, setShowMain] = useState(true);

  useEffect(() => {
    if (currentPhrase < phrases.length - 1) {
      const timer = setTimeout(() => {
        setCurrentPhrase(prev => prev + 1);
      }, 1800); // Wait 1.8s per phrase
      return () => clearTimeout(timer);
    } else {
      // Last phrase
      const timer = setTimeout(() => {
        setShowMain(false);
        setTimeout(onComplete, 1000); // Wait for exit animation to complete
      }, 2200);
      return () => clearTimeout(timer);
    }
  }, [currentPhrase, onComplete]);

  return (
    <AnimatePresence>
      {showMain && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1, ease: "easeInOut" }}
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#0B0B0B] text-white overflow-hidden selection:bg-white/10"
        >
          {/* Animated gradient particles/glows in background */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <motion.div 
              animate={{ 
                scale: [1, 1.2, 1],
                opacity: [0.08, 0.15, 0.08],
              }}
              transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
              className="absolute top-[20%] left-[20%] w-[40vw] h-[40vw] bg-violet-600/20 rounded-full blur-[100px] mix-blend-screen"
            />
            <motion.div 
              animate={{ 
                scale: [1, 1.3, 1],
                opacity: [0.05, 0.12, 0.05],
              }}
              transition={{ duration: 10, repeat: Infinity, ease: "linear", delay: 2 }}
              className="absolute bottom-[20%] right-[20%] w-[50vw] h-[50vw] bg-blue-600/20 rounded-full blur-[120px] mix-blend-screen"
            />
          </div>

          <div className="relative z-10 flex flex-col items-center w-full px-6">
            {/* RM Logo Animation */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0, filter: "blur(10px)" }}
              animate={{ scale: 1, opacity: 1, filter: "blur(0px)" }}
              transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
              className="mb-10 relative flex items-center justify-center"
            >
              <div className="text-7xl md:text-8xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-b from-white to-gray-500">
                RM
              </div>
              <motion.div
                className="absolute -bottom-4 left-1/2 -translate-x-1/2 h-[1px] bg-gradient-to-r from-transparent via-white/50 to-transparent"
                initial={{ width: "0%" }}
                animate={{ width: "150%" }}
                transition={{ duration: 1.5, delay: 0.6, ease: "easeInOut" }}
              />
            </motion.div>

            {/* Name and Titles */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 1, delay: 0.4, ease: "easeOut" }}
              className="text-center mb-16"
            >
              <h1 className="text-2xl md:text-3xl font-light tracking-[0.3em] mb-4 text-gray-100">
                RAHUL MAHASETH
              </h1>
              <div className="flex flex-col md:flex-row items-center justify-center gap-2 md:gap-4 text-xs md:text-sm text-gray-400 tracking-[0.2em] uppercase font-medium">
                <span>Full Stack Engineer</span>
                <span className="hidden md:inline text-gray-700">|</span>
                <span className="md:hidden w-8 h-[1px] bg-gray-700 my-1"></span>
                <span>AI Systems Engineer</span>
              </div>
            </motion.div>

            {/* Cycling Phrases */}
            <div className="h-10 relative flex items-center justify-center overflow-hidden w-full max-w-lg">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentPhrase}
                  initial={{ y: 20, opacity: 0, filter: "blur(8px)" }}
                  animate={{ y: 0, opacity: 1, filter: "blur(0px)" }}
                  exit={{ y: -20, opacity: 0, filter: "blur(8px)" }}
                  transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                  className="absolute text-center text-sm md:text-base text-gray-300 font-light tracking-widest uppercase"
                >
                  {phrases[currentPhrase]}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

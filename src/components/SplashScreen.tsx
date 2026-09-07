import React, { useEffect } from 'react';
import { motion } from 'motion/react';
import { Logo } from './Logo';

interface SplashScreenProps {
  onFinish: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onFinish }) => {
  useEffect(() => {
    // Elegant, short splash transition timer (2.2s)
    const timer = setTimeout(() => {
      onFinish();
    }, 2200);

    return () => clearTimeout(timer);
  }, [onFinish]);

  return (
    <motion.div
      id="splash-screen"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6, ease: 'easeInOut' }}
      onClick={onFinish}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#F7F2EB] text-[#081F5C] cursor-pointer select-none px-6"
    >
      <div className="flex flex-col items-center text-center max-w-sm">
        {/* Subtle entrance animation for the official logo */}
        <motion.div
          initial={{ scale: 0.94, opacity: 0, y: 8 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          className="p-4"
        >
          <Logo size="hero" isDark={false} />
        </motion.div>

        {/* Minimal, elegant hairline accent line */}
        <motion.div
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: 48, opacity: 0.35 }}
          transition={{ delay: 0.5, duration: 0.8, ease: 'easeOut' }}
          className="h-[1px] bg-[#081F5C] mt-8 mb-4"
        />

        {/* Quiet reassurance text */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.7 }}
          transition={{ delay: 0.9, duration: 0.7 }}
          className="font-body text-xs tracking-[0.25em] uppercase text-[#081F5C]"
        >
          Premium Music Education
        </motion.p>
      </div>

      {/* Tap hint in safe area */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.4 }}
        transition={{ delay: 1.4, duration: 0.5 }}
        className="absolute bottom-8 text-[11px] tracking-wider uppercase font-medium text-[#081F5C]"
      >
        Tap anywhere to enter
      </motion.div>
    </motion.div>
  );
};

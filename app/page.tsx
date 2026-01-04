'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Navigate to desktop after a short delay
    const navigationTimer = setTimeout(() => {
      router.push('/desktop');
    }, 2500);

    return () => clearTimeout(navigationTimer);
  }, [router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white overflow-hidden relative">
      {/* Windows Logo with blinking animation */}
      <motion.div
        className="relative z-10"
        animate={{
          opacity: [1, 0.3, 1],
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      >
        {/* Windows 11 Logo - Four squares in 2x2 grid */}
        <div className="grid grid-cols-2 gap-3">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1, duration: 0.4 }}
            className="w-16 h-16 bg-[#0078D4] rounded-lg"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.4 }}
            className="w-16 h-16 bg-[#0078D4] rounded-lg"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.4 }}
            className="w-16 h-16 bg-[#0078D4] rounded-lg"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4, duration: 0.4 }}
            className="w-16 h-16 bg-[#0078D4] rounded-lg"
          />
        </div>
      </motion.div>
    </div>
  );
}

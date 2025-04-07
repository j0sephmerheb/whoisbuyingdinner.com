
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Egg, Bottle } from 'lucide-react';

interface ThrowingAnimationProps {
  attacker: 'chicken' | 'cowboy';
  show: boolean;
  onComplete: () => void;
}

const ThrowingAnimation: React.FC<ThrowingAnimationProps> = ({ attacker, show, onComplete }) => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  
  useEffect(() => {
    if (show) {
      // Set timeout to hide the animation after it completes
      const timer = setTimeout(() => {
        onComplete();
      }, 1000); // Animation duration
      
      return () => clearTimeout(timer);
    }
  }, [show, onComplete]);
  
  if (!show) return null;
  
  return (
    <div className="absolute inset-0 pointer-events-none z-40 overflow-hidden">
      <motion.div
        className="absolute"
        initial={{ x: attacker === 'chicken' ? "-20%" : "120%", y: "50%" }}
        animate={{ x: attacker === 'chicken' ? "120%" : "-20%", y: "50%" }}
        transition={{ duration: 1, ease: "easeOut" }}
      >
        {attacker === 'chicken' ? (
          <Egg size={48} className="text-white fill-white" />
        ) : (
          <Bottle size={48} className="text-amber-700 rotate-45" />
        )}
      </motion.div>
    </div>
  );
};

export default ThrowingAnimation;

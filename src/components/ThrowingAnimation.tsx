
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Egg, Beer } from 'lucide-react';

interface ThrowingAnimationProps {
  attacker: 'chicken' | 'cowboy';
  show: boolean;
  onComplete: () => void;
}

const ThrowingAnimation: React.FC<ThrowingAnimationProps> = ({ attacker, show, onComplete }) => {
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
        initial={{ 
          x: attacker === 'chicken' ? "-10%" : "110%", 
          y: "65%" // Start lower, under the dice area
        }}
        animate={{ 
          x: attacker === 'chicken' ? "110%" : "-10%", 
          y: "45%" // Move upward slightly as it travels
        }}
        transition={{ duration: 1, ease: "easeOut" }}
      >
        {attacker === 'chicken' ? (
          <div className="relative">
            <Egg 
              size={48} 
              className="text-white" 
              strokeWidth={3} 
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <Egg 
                size={36} 
                className="fill-amber-100" 
              />
            </div>
          </div>
        ) : (
          <Beer size={48} className="text-amber-700 fill-amber-500 rotate-45" />
        )}
      </motion.div>
    </div>
  );
};

export default ThrowingAnimation;


import React from 'react';

interface GameLayoutProps {
  children: React.ReactNode;
  gamePhase?: 'waiting' | 'selection' | 'countdown' | 'playing' | 'rolling' | 'result' | 'over';
}

const GameLayout: React.FC<GameLayoutProps> = ({ children, gamePhase }) => {
  // Log the current game phase to help with debugging
  React.useEffect(() => {
    console.log('GameLayout rendered with phase:', gamePhase);
  }, [gamePhase]);
  
  return (
    <div className="min-h-screen flex flex-col items-center bg-gameBackground p-4">
      <header className="w-full max-w-5xl flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gameAccent text-center w-full">Who's Buying Dinner?</h1>
      </header>
      
      <main className={`w-full max-w-5xl ${gamePhase !== 'over' ? 'bg-white/90 rounded-2xl shadow-xl p-6' : ''} flex-1`}>
        {children}
      </main>
      
      <footer className="w-full max-w-5xl mt-6 text-center text-sm text-gray-600">
        Who's Buying Dinner? © 2025 - Roll the dice, loser pays the price!
      </footer>
    </div>
  );
};

export default GameLayout;

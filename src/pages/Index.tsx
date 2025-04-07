
import React from 'react';
import { GameProvider } from '@/context/GameContext';
import Game from '@/pages/Game';

const Index = () => {
  return (
    <GameProvider>
      <Game />
    </GameProvider>
  );
};

export default Index;

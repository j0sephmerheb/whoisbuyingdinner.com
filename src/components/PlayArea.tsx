
import React from 'react';
import GameBoard from '@/components/GameBoard';
import DiceRoller from '@/components/DiceRoller';
import GameHeader from '@/components/GameHeader';
import { GamePhase, PlayerData } from '@/services/game';

interface PlayAreaProps {
  game: any;
  currentPlayer: PlayerData;
  opponent: PlayerData | null;
  rollDice: () => void;
}

const PlayArea: React.FC<PlayAreaProps> = ({
  game,
  currentPlayer,
  opponent,
  rollDice
}) => {
  return (
    <div className="flex flex-col items-center">
      <GameHeader 
        currentRound={game.current_round} 
        playerName={currentPlayer.name}
        opponentName={opponent?.name || 'Opponent'} 
      />
      
      <GameBoard currentPlayer={currentPlayer} opponent={opponent} />
      
      <DiceRoller 
        gamePhase={game.game_phase as GamePhase} 
        currentPlayer={currentPlayer}
        opponent={opponent}
        onRoll={rollDice}
        isCurrentPlayer={true}
      />
    </div>
  );
};

export default PlayArea;


import React from 'react';
import { Button } from '@/components/ui/button';
import { Team } from '@/types/gameTypes';

interface TeamSelectionProps {
  onSelect: (team: Team) => void;
}

const TeamSelection: React.FC<TeamSelectionProps> = ({ onSelect }) => {
  return (
    <div className="flex flex-col items-center gap-8 p-8">
      <h1 className="text-4xl font-bold text-gameAccent mb-2">Choose Your Team</h1>
      
      <div className="flex flex-col md:flex-row gap-8 w-full max-w-2xl">
        <div 
          className="flex-1 bg-chicken rounded-xl p-6 shadow-lg hover:shadow-xl transition-all cursor-pointer border-2 border-transparent hover:border-gameAccent"
          onClick={() => onSelect('chicken')}
        >
          <div className="flex flex-col items-center gap-4">
            <div className="h-32 w-32 flex items-center justify-center bg-white rounded-full shadow-inner">
              <span className="text-7xl animate-float">🐔</span>
            </div>
            <h2 className="text-2xl font-bold">Team Chicken</h2>
            <p className="text-center text-gray-700">Armed with explosive eggs and plenty of cluck</p>
            <Button 
              className="w-full bg-gameAccent hover:bg-gameAccent/80 text-white font-bold" 
              onClick={() => onSelect('chicken')}
            >
              Select Chickens
            </Button>
          </div>
        </div>
        
        <div 
          className="flex-1 bg-cowboy rounded-xl p-6 shadow-lg hover:shadow-xl transition-all cursor-pointer border-2 border-transparent hover:border-gameAccent"
          onClick={() => onSelect('cowboy')}
        >
          <div className="flex flex-col items-center gap-4">
            <div className="h-32 w-32 flex items-center justify-center bg-white rounded-full shadow-inner">
              <span className="text-7xl animate-float">🤠</span>
            </div>
            <h2 className="text-2xl font-bold">Team Cowboy</h2>
            <p className="text-center text-gray-700">Ready to throw whiskey bottles with deadly aim</p>
            <Button 
              className="w-full bg-gameAccent hover:bg-gameAccent/80 text-white font-bold" 
              onClick={() => onSelect('cowboy')}
            >
              Select Cowboys
            </Button>
          </div>
        </div>
      </div>
      
      <div className="mt-8 p-4 bg-white/80 rounded-lg shadow">
        <h3 className="text-xl font-semibold mb-2">Game Rules</h3>
        <ul className="list-disc pl-6 space-y-1">
          <li>You'll have 5 characters on your team</li>
          <li>Each round, roll your dice against your opponent</li>
          <li>Highest roll gets to attack and eliminate one opponent</li>
          <li>Last team with characters standing wins!</li>
        </ul>
      </div>
    </div>
  );
};

export default TeamSelection;

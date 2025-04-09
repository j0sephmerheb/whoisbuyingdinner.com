
import React from 'react';
import { Loader2 } from 'lucide-react';

const LoadingState = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gameBackground">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-gameAccent" />
        <p className="text-gameAccent">Loading game...</p>
      </div>
    </div>
  );
};

export default LoadingState;

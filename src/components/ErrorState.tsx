
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface ErrorStateProps {
  error: string | null;
}

const ErrorState: React.FC<ErrorStateProps> = ({ error }) => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gameBackground">
      <Card className="max-w-md w-full">
        <CardContent className="p-6 text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
          <p>{error || "Game not found or you don't have access"}</p>
          <Button 
            onClick={() => navigate('/')}
            className="mt-4"
          >
            Back to Home
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default ErrorState;

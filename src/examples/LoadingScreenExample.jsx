// Example usage in your Dashboard or App component

import React, { useState, useEffect } from 'react';
import LoadingScreen, { LoadingDots } from '../components/LoadingScreen';

const ExampleUsage = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState(null);

  // Simulate data loading
  useEffect(() => {
    const loadData = async () => {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 3000));
      setData("Data loaded!");
      setIsLoading(false);
    };

    loadData();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Full screen loading overlay */}
      <LoadingScreen isVisible={isLoading} />
      
      {/* Your main content */}
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">Mi App de Hábitos</h1>
        
        {/* Inline loading dots for smaller components */}
        <div className="bg-white p-4 rounded-lg border">
          <h2 className="text-lg font-semibold mb-2">Cargando datos...</h2>
          <LoadingDots size="sm" className="mb-4" />
          <p className="text-gray-600">Esto podría tardar un momento...</p>
        </div>
        
        {/* Custom loading with different texts */}
        <div className="mt-8">
          <LoadingScreen 
            isVisible={false} // Set to true to show
            customTexts={[
              "Sincronizando datos...",
              "Actualizando hábitos...",
              "Guardando progreso...",
              "Casi terminado..."
            ]}
            className="bg-black/50" // Dark overlay
          />
        </div>
      </div>
    </div>
  );
};

export default ExampleUsage;

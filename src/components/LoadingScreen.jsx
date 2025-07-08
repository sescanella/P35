import React, { useState, useEffect } from 'react';

/**
 * Pantalla de carga con diseño minimalista inspirado en Notion
 * - Dots animados con efecto de rebote secuencial
 * - Textos relacionados con hábitos que cambian con fade
 * - Gradientes sutiles y sombras para profundidad visual
 */
const LoadingScreen = ({ 
  isVisible = true, 
  customTexts = null,
  showDots = true,
  className = ""
}) => {
  // Textos relacionados con hábitos que rotan
  const defaultHabitTexts = [
    "Leyendo...",
    "Meditando...",
    "Ejercitándose...",
    "Hidratándose...",
    "Organizando...",
    "Reflexionando...",
    "Creando rutinas...",
    "Construyendo hábitos...",
    "Mejorando cada día..."
  ];

  const habitTexts = customTexts || defaultHabitTexts;
  const [currentTextIndex, setCurrentTextIndex] = useState(0);
  const [isTextVisible, setIsTextVisible] = useState(true);

  // Rotar textos cada 1.5 segundos con fade
  useEffect(() => {
    if (!isVisible) return;

    const interval = setInterval(() => {
      // Fade out
      setIsTextVisible(false);
      
      // Cambiar texto después del fade out
      setTimeout(() => {
        setCurrentTextIndex((prevIndex) => 
          (prevIndex + 1) % habitTexts.length
        );
        // Fade in
        setIsTextVisible(true);
      }, 300);
    }, 1500);

    return () => clearInterval(interval);
  }, [isVisible, habitTexts.length]);

  if (!isVisible) return null;

  return (
    <div className={`fixed inset-0 bg-white/95 backdrop-blur-sm z-50 flex items-center justify-center ${className}`}>
      <div className="flex flex-col items-center justify-center space-y-8 p-8">
        {/* Animated Dots */}
        {showDots && (
          <div className="flex space-x-2">
            {[0, 1, 2].map((index) => (
              <div
                key={index}
                className="w-3 h-3 rounded-full bg-gradient-to-br from-gray-600 to-gray-800 shadow-lg animate-bounce-wave"
                style={{
                  animationDelay: `${index * 0.2}s`,
                  filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))'
                }}
              />
            ))}
          </div>
        )}

        {/* Rotating Habit Text */}
        <div className="text-center">
          <p 
            className={`text-lg font-medium text-gray-700 transition-all duration-300 ease-in-out transform ${
              isTextVisible 
                ? 'opacity-100 translate-y-0' 
                : 'opacity-0 translate-y-2'
            }`}
          >
            {habitTexts[currentTextIndex]}
          </p>
        </div>

        {/* Subtle progress indicator */}
        <div className="w-32 h-1 bg-gray-200 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-gray-400 to-gray-600 rounded-full animate-progress" />
        </div>
      </div>
    </div>
  );
};

// Componente más simple solo con dots (para uso en otros lugares)
export const LoadingDots = ({ size = 'md', className = "" }) => {
  const sizeClasses = {
    sm: 'w-2 h-2',
    md: 'w-3 h-3',
    lg: 'w-4 h-4'
  };

  return (
    <div className={`flex space-x-2 ${className}`}>
      {[0, 1, 2].map((index) => (
        <div
          key={index}
          className={`${sizeClasses[size]} rounded-full bg-gradient-to-br from-gray-600 to-gray-800 shadow-sm animate-bounce-wave`}
          style={{
            animationDelay: `${index * 0.2}s`
          }}
        />
      ))}
    </div>
  );
};

export default LoadingScreen;

import React, { useState, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext.jsx';

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
  const { theme } = useTheme();
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
    <div 
      className={`fixed inset-0 backdrop-blur-sm z-50 flex items-center justify-center transition-all duration-300 ${className}`}
      style={{ backgroundColor: `${theme.primary}F2` }} // F2 = 95% opacity
    >
      <div className="flex flex-col items-center justify-center space-y-8 p-8">
        {/* Animated Dots */}
        {showDots && (
          <div className="flex space-x-2">
            {[0, 1, 2].map((index) => (
              <div
                key={index}
                className="w-3 h-3 rounded-full shadow-lg animate-bounce-wave"
                style={{
                  background: `linear-gradient(135deg, ${theme.accent}, ${theme.text})`,
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
            className={`text-lg font-medium transition-all duration-300 ease-in-out transform ${
              isTextVisible 
                ? 'opacity-100 translate-y-0' 
                : 'opacity-0 translate-y-2'
            }`}
            style={{ color: theme.textSecondary }}
          >
            {habitTexts[currentTextIndex]}
          </p>
        </div>

        {/* Subtle progress indicator */}
        <div 
          className="w-32 h-1 rounded-full overflow-hidden"
          style={{ backgroundColor: theme.borderLight }}
        >
          <div 
            className="h-full rounded-full animate-progress" 
            style={{ background: `linear-gradient(90deg, ${theme.accent}, ${theme.text})` }}
          />
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen;

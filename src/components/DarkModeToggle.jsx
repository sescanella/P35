import React from 'react';
import { useTheme } from '../contexts/ThemeContext.jsx';

/**
 * Dark Mode Toggle Switch - iOS Style
 * Square with rounded corners to match app design
 */
const DarkModeToggle = () => {
  const { isDark, toggleTheme, theme } = useTheme();

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm font-medium" style={{ color: theme.textSecondary }}>
        {isDark ? '🌙' : '☀️'}
      </span>
      
      <button
        onClick={toggleTheme}
        className="relative w-12 h-6 rounded-md transition-all duration-300 ease-in-out transform hover:scale-105"
        style={{
          backgroundColor: isDark ? theme.accent : theme.borderLight,
          border: `1px solid ${theme.border}`
        }}
        title={`Cambiar a modo ${isDark ? 'claro' : 'oscuro'}`}
        aria-label={`Cambiar a modo ${isDark ? 'claro' : 'oscuro'}`}
      >
        {/* Toggle circle */}
        <div
          className="absolute top-0.5 w-5 h-5 rounded transition-all duration-300 ease-in-out"
          style={{
            backgroundColor: isDark ? theme.primary : theme.accent,
            transform: isDark ? 'translateX(24px)' : 'translateX(2px)',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.3)'
          }}
        />
        
        {/* Animation effect */}
        <div 
          className="absolute inset-0 rounded-md opacity-0 pointer-events-none transition-opacity duration-150"
          style={{
            backgroundColor: isDark ? theme.accent : theme.primary,
            opacity: 0
          }}
        />
      </button>
      
      <span className="text-xs font-medium hidden sm:inline" style={{ color: theme.textTertiary }}>
        {isDark ? 'Oscuro' : 'Claro'}
      </span>
    </div>
  );
};

export default DarkModeToggle;

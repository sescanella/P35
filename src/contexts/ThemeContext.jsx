import React, { createContext, useContext, useState, useEffect } from 'react';

// iOS-style colors
export const themes = {
  light: {
    // Backgrounds
    primary: '#FFFFFF',
    secondary: '#F2F2F7',
    tertiary: '#FFFFFF',
    
    // Text colors
    text: '#000000',
    textSecondary: '#6D6D80',
    textTertiary: '#8E8E93',
    
    // UI elements
    border: '#1C1C1E',
    borderLight: '#C6C6C8',
    accent: '#1C1C1E',
    
    // Chart colors
    chartBackground: '#FFFFFF',
    chartGrid: 'rgba(0, 0, 0, 0.1)',
    chartText: '#666666',
    
    // Cards and containers
    card: '#FFFFFF',
    cardBorder: '#1C1C1E'
  },
  dark: {
    // Backgrounds (iOS dark mode colors)
    primary: '#000000',
    secondary: '#1C1C1E',
    tertiary: '#2C2C2E',
    
    // Text colors
    text: '#FFFFFF',
    textSecondary: '#EBEBF5',
    textTertiary: '#8E8E93',
    
    // UI elements
    border: '#38383A',
    borderLight: '#48484A',
    accent: '#FFFFFF',
    
    // Chart colors
    chartBackground: '#1C1C1E',
    chartGrid: 'rgba(255, 255, 255, 0.1)',
    chartText: '#EBEBF5',
    
    // Cards and containers
    card: '#1C1C1E',
    cardBorder: '#38383A'
  }
};

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [isDark, setIsDark] = useState(false);

  // Load theme preference from localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem('habitTracker_theme');
    if (savedTheme === 'dark') {
      setIsDark(true);
    }
  }, []);

  // Save theme preference to localStorage
  useEffect(() => {
    localStorage.setItem('habitTracker_theme', isDark ? 'dark' : 'light');
    
    // Apply theme to document body for global styles
    document.body.style.backgroundColor = isDark ? themes.dark.primary : themes.light.primary;
    document.body.style.color = isDark ? themes.dark.text : themes.light.text;
    document.body.style.transition = 'background-color 0.3s ease, color 0.3s ease';
  }, [isDark]);

  const toggleTheme = () => {
    setIsDark(!isDark);
  };

  const currentTheme = isDark ? themes.dark : themes.light;

  return (
    <ThemeContext.Provider value={{ 
      isDark, 
      toggleTheme, 
      theme: currentTheme,
      themes
    }}>
      {children}
    </ThemeContext.Provider>
  );
};

export default ThemeContext;

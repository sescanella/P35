import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import { useTheme } from '../contexts/ThemeContext.jsx';

/**
 * Formulario para crear hábitos con sistema de puntuación basado en dimensiones.
 * Calcula automáticamente el priority_score basado en 3 dimensiones (1-5):
 * - Personal Impact (40%)
 * - Perceived Difficulty (40%) 
 * - Time/Effort Required (20%)
 */
const HabitForm = ({ onHabitCreated }) => {
  const { theme } = useTheme();
  // Initial state values
  const initialState = {
    name: '',
    impact: 3,
    difficulty: 3,
    timeEffort: 3,
    selectedColor: '#B1D8B8'
  };

  const [name, setName] = useState(initialState.name);
  const [impact, setImpact] = useState(initialState.impact);
  const [difficulty, setDifficulty] = useState(initialState.difficulty);
  const [timeEffort, setTimeEffort] = useState(initialState.timeEffort);
  const [selectedColor, setSelectedColor] = useState(initialState.selectedColor);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);

  // Predefined colors - only for habit identification
  const availableColors = [
    { hex: '#FBBA16', name: 'habit-yellow' },
    { hex: '#00492C', name: 'habit-dark-green' },
    { hex: '#9BCCD0', name: 'habit-light-blue' },
    { hex: '#E22028', name: 'habit-red' },
    { hex: '#E2B2B4', name: 'habit-pink' },
    { hex: '#1E4380', name: 'habit-dark-blue' },
    { hex: '#B1D8B8', name: 'habit-light-green' }
  ];

  // Calculate priority score in real-time
  const calculatePriorityScore = () => {
    const baseScore = (impact * 0.4) + (difficulty * 0.4) + (timeEffort * 0.2);
    return Math.round(baseScore * 8.33);
  };

  const priorityScore = calculatePriorityScore();

  // Reset form to initial state
  const handleCancel = () => {
    setName(initialState.name);
    setImpact(initialState.impact);
    setDifficulty(initialState.difficulty);
    setTimeEffort(initialState.timeEffort);
    setSelectedColor(initialState.selectedColor);
    setError('');
    setSuccessMessage('');
    setShowSuccessAnimation(false);
  };

  // Animated Success Checkmark Component
  const SuccessCheckmark = () => (
    <div className={`inline-flex items-center justify-center w-6 h-6 rounded-full bg-green-500 transition-all duration-500 ${showSuccessAnimation ? 'scale-100 opacity-100' : 'scale-0 opacity-0'}`}>
      <svg 
        className="w-4 h-4 text-white" 
        fill="none" 
        stroke="currentColor" 
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          strokeWidth={3} 
          d="M5 13l4 4L19 7"
          className="animate-drawCheck"
        />
      </svg>
    </div>
  );

  // Clear success message and animation after 3 seconds
  useEffect(() => {
    if (successMessage) {
      setShowSuccessAnimation(true);
      const timer = setTimeout(() => {
        setSuccessMessage('');
        setShowSuccessAnimation(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  // Remove the old useEffect with habit dependency as it's no longer needed
  // useEffect(() => {
  //   if (habit) {
  //     setName(habit.name || '');
  //     setScore(habit.score || 0);
  //     setSelectedColor(habit.color_hex || '');
  //   }
  // }, [habit]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    setShowSuccessAnimation(false);
    setIsSaving(true);
    
    try {
      // Validations
      if (!name.trim()) {
        throw new Error('El nombre es requerido');
      }
      if (!selectedColor) {
        throw new Error('Debes seleccionar un color');
      }
      if (impact < 1 || impact > 5) {
        throw new Error('El impacto personal debe estar entre 1 y 5');
      }
      if (difficulty < 1 || difficulty > 5) {
        throw new Error('La dificultad debe estar entre 1 y 5');
      }
      if (timeEffort < 1 || timeEffort > 5) {
        throw new Error('El tiempo/esfuerzo debe estar entre 1 y 5');
      }

      // Save to Supabase
      const { data, error: supabaseError } = await supabase
        .from('p35_habits')
        .insert([
          {
            name: name.trim(),
            priority_score: priorityScore,
            color_hex: selectedColor,
            active: true
          }
        ]);

      if (supabaseError) {
        throw new Error(supabaseError.message);
      }

      // Success: show animated message, clear form, trigger soft reload
      setSuccessMessage('¡Hábito creado exitosamente!');
      
      // Reset form after brief delay
      setTimeout(() => {
        handleCancel();
        // Call parent component to refresh habit list (soft reload)
        if (onHabitCreated) {
          onHabitCreated();
        }
      }, 2000);

    } catch (err) {
      setError(err.message || 'Error al guardar el hábito');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="w-full h-auto">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Habit Name */}
        <div className="space-y-2">
          <label 
            className="font-medium text-sm" 
            htmlFor="habit-name"
            style={{ color: theme.text }}
          >
            Nombre del hábito
          </label>
          <input
            id="habit-name"
            type="text"
            className="w-full px-4 py-3 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-200"
            style={{ 
              backgroundColor: theme.card,
              color: theme.text,
              borderColor: theme.border,
              borderWidth: '1px',
              borderStyle: 'solid',
              borderRadius: '0.5rem'
            }}
            value={name}
            onChange={e => setName(e.target.value)}
            required
            placeholder="Ej: Meditar 10 minutos..."
            autoComplete="off"
            aria-describedby="habit-name-desc"
          />
          <p id="habit-name-desc" className="sr-only">
            Ingresa un nombre descriptivo para tu hábito
          </p>
        </div>
        
        {/* Personal Impact Slider */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <label className="font-medium text-sm" style={{ color: theme.text }}>
              Impacto Personal
            </label>
            <div 
              className="text-xs font-bold w-6 h-6 rounded flex items-center justify-center" 
              style={{ 
                backgroundColor: theme.accent,
                color: theme.accent === '#FFFFFF' ? '#000000' : '#FFFFFF'
              }}
            >
              {impact}
            </div>
          </div>
          <div className="px-1 relative">
            <input
              type="range"
              min="1"
              max="5"
              step="1"
              value={impact}
              onChange={e => setImpact(parseInt(e.target.value))}
              className="w-full h-3 rounded-lg appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-200"
              style={{
                background: `linear-gradient(to right, ${theme.accent} 0%, ${theme.accent} ${((impact - 1) / 4) * 100}%, ${theme.borderLight} ${((impact - 1) / 4) * 100}%, ${theme.borderLight} 100%)`,
                outline: 'none'
              }}
              aria-label={`Impacto personal: ${impact} de 5`}
              aria-describedby="impact-desc"
            />
            <div className="flex justify-between text-xs mt-1" style={{ color: theme.textSecondary }}>
              <span>Bajo</span>
              <span>Alto</span>
            </div>
            <p id="impact-desc" className="sr-only">
              Selecciona qué tan importante es este hábito para tu vida, del 1 al 5
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <label className="font-medium text-sm" style={{ color: theme.text }}>
              Dificultad Percibida
            </label>
            <div 
              className="text-xs font-bold w-6 h-6 rounded flex items-center justify-center" 
              style={{ 
                backgroundColor: theme.accent,
                color: theme.accent === '#FFFFFF' ? '#000000' : '#FFFFFF'
              }}
            >
              {difficulty}
            </div>
          </div>
          <div className="px-1 relative">
            <input
              type="range"
              min="1"
              max="5"
              step="1"
              value={difficulty}
              onChange={e => setDifficulty(parseInt(e.target.value))}
              className="w-full h-3 rounded-lg appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-200"
              style={{
                background: `linear-gradient(to right, ${theme.accent} 0%, ${theme.accent} ${((difficulty - 1) / 4) * 100}%, ${theme.borderLight} ${((difficulty - 1) / 4) * 100}%, ${theme.borderLight} 100%)`,
                outline: 'none'
              }}
              aria-label={`Dificultad percibida: ${difficulty} de 5`}
              aria-describedby="difficulty-desc"
            />
            <div className="flex justify-between text-xs mt-1" style={{ color: theme.textSecondary }}>
              <span>Fácil</span>
              <span>Difícil</span>
            </div>
            <p id="difficulty-desc" className="sr-only">
              Selecciona qué tan difícil es mantener este hábito, del 1 al 5
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <label className="font-medium text-sm" style={{ color: theme.text }}>
              Tiempo/Esfuerzo Requerido
            </label>
            <div 
              className="text-xs font-bold w-6 h-6 rounded flex items-center justify-center" 
              style={{ 
                backgroundColor: theme.accent,
                color: theme.accent === '#FFFFFF' ? '#000000' : '#FFFFFF'
              }}
            >
              {timeEffort}
            </div>
          </div>
          <div className="px-1 relative">
            <input
              type="range"
              min="1"
              max="5"
              step="1"
              value={timeEffort}
              onChange={e => setTimeEffort(parseInt(e.target.value))}
              className="w-full h-3 rounded-lg appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-200"
              style={{
                background: `linear-gradient(to right, ${theme.accent} 0%, ${theme.accent} ${((timeEffort - 1) / 4) * 100}%, ${theme.borderLight} ${((timeEffort - 1) / 4) * 100}%, ${theme.borderLight} 100%)`,
                outline: 'none'
              }}
              aria-label={`Tiempo y esfuerzo requerido: ${timeEffort} de 5`}
              aria-describedby="time-effort-desc"
            />
            <div className="flex justify-between text-xs mt-1" style={{ color: theme.textSecondary }}>
              <span>Poco</span>
              <span>Mucho</span>
            </div>
            <p id="time-effort-desc" className="sr-only">
              Selecciona cuánto tiempo o energía requiere este hábito diariamente, del 1 al 5
            </p>
          </div>
        </div>

        {/* Calculated Priority Score */}
        <div 
          className="p-4 text-center mx-2 mb-4 rounded-lg transition-all duration-300"
          style={{ backgroundColor: theme.secondary }}
        >
          <div className="text-4xl font-bold mb-1" style={{ color: theme.text }} aria-live="polite">
            {priorityScore}
          </div>
          <div className="text-xs" style={{ color: theme.textSecondary }}>Puntuación calculada</div>
        </div>

        {/* Color Picker */}
        <div className="space-y-2">
          <label className="font-medium text-sm" style={{ color: theme.text }}>
            Color del hábito *
          </label>
          <div 
            className="grid grid-cols-4 gap-2" 
            role="radiogroup" 
            aria-label="Seleccionar color para el hábito"
          >
            {availableColors.map((color, index) => (
              <button
                key={color.hex}
                type="button"
                onClick={() => setSelectedColor(color.hex)}
                className={`w-full h-10 transition-all duration-200 transform hover:scale-105 focus:scale-105 border-2 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                  selectedColor === color.hex 
                    ? 'ring-2 shadow-md' 
                    : 'hover:border-gray-600'
                }`}
                style={{ 
                  backgroundColor: color.hex,
                  borderColor: selectedColor === color.hex ? theme.border : theme.borderLight,
                  focusRingColor: theme.border
                }}
                title={`Seleccionar color ${color.name}`}
                aria-label={`Color ${color.name}`}
                role="radio"
                aria-checked={selectedColor === color.hex}
                tabIndex={selectedColor === color.hex ? 0 : -1}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setSelectedColor(color.hex);
                  }
                  // Arrow key navigation
                  if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
                    e.preventDefault();
                    const nextIndex = (index + 1) % availableColors.length;
                    document.querySelector(`[aria-label="Color ${availableColors[nextIndex].name}"]`)?.focus();
                  }
                  if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
                    e.preventDefault();
                    const prevIndex = index === 0 ? availableColors.length - 1 : index - 1;
                    document.querySelector(`[aria-label="Color ${availableColors[prevIndex].name}"]`)?.focus();
                  }
                }}
              >
                {selectedColor === color.hex && (
                  <span className="text-white text-lg font-bold drop-shadow-lg" aria-hidden="true">✓</span>
                )}
              </button>
            ))}
          </div>
          {selectedColor && (
            <p className="text-sm mt-2" style={{ color: theme.text }}>
              Color seleccionado: <span style={{ color: selectedColor }} aria-hidden="true">●</span> {selectedColor}
            </p>
          )}
        </div>

        {/* Success Message with Animated Checkmark */}
        {successMessage && (
          <div 
            className="px-4 py-3 text-sm flex items-center gap-3 rounded-lg"
            style={{ backgroundColor: '#d1fae5', color: '#065f46' }}
          >
            <SuccessCheckmark />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div 
            className="px-4 py-3 text-sm rounded-lg" 
            style={{ backgroundColor: '#fee2e2', color: '#dc2626' }}
            role="alert"
          >
            <span aria-hidden="true">❌</span> {error}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            className="flex-1 font-semibold py-3 px-4 rounded-lg hover:opacity-80 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            style={{ 
              backgroundColor: theme.accent,
              color: theme.accent === '#FFFFFF' ? '#000000' : '#FFFFFF'
            }}
            disabled={isSaving}
            aria-label="Crear nuevo hábito"
          >
            {isSaving ? '⏳ Guardando...' : '✨ Crear Hábito'}
          </button>
          <button
            type="button"
            onClick={handleCancel}
            className="px-6 font-semibold py-3 rounded-lg hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            style={{ 
              backgroundColor: theme.card,
              color: theme.text,
              borderColor: theme.border,
              borderWidth: '1px',
              borderStyle: 'solid'
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = theme.accent;
              e.target.style.color = theme.accent === '#FFFFFF' ? '#000000' : '#FFFFFF';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = theme.card;
              e.target.style.color = theme.text;
            }}
            disabled={isSaving}
            aria-label="Cancelar y limpiar formulario"
          >
            🔄 Cancelar
          </button>
        </div>
      </form>
    </div>
  );
};

export default HabitForm;

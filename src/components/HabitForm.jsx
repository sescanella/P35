import React, { useState, useEffect } from 'react';

/**
 * Formulario para crear o editar hábitos.
 * Props:
 * - habit: { name: string, score: number, color_hex: string } (opcional)
 * - onSave: function(nombre, puntaje, color_hex)
 */
const HabitForm = ({ habit, onSave }) => {
  const [name, setName] = useState(habit ? habit.name : '');
  const [score, setScore] = useState(habit ? habit.score : 0);
  const [selectedColor, setSelectedColor] = useState(habit ? habit.color_hex : '');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

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

  useEffect(() => {
    if (habit) {
      setName(habit.name || '');
      setScore(habit.score || 0);
      setSelectedColor(habit.color_hex || '');
    }
  }, [habit]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSaving(true);
    
    try {
      if (!name.trim()) {
        throw new Error('El nombre es requerido');
      }
      if (!selectedColor) {
        throw new Error('Debes seleccionar un color');
      }
      
      await onSave(name.trim(), score, selectedColor);
      setName('');
      setScore(0);
      setSelectedColor('');
    } catch (err) {
      setError(err.message || 'Error al guardar el hábito');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-white border border-black rounded-xl p-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <label className="text-black font-medium text-sm" htmlFor="habit-name">
            Nombre del hábito
          </label>
          <input
            id="habit-name"
            type="text"
            className="w-full bg-white border border-black rounded-xl px-4 py-3 text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-black transition-all duration-200"
            value={name}
            onChange={e => setName(e.target.value)}
            required
            placeholder="Ej: Meditar 10 minutos..."
            autoComplete="off"
          />
        </div>
        
        <div className="space-y-2">
          <label className="text-black font-medium text-sm" htmlFor="habit-score">
            Puntos por completar
          </label>
          <div className="relative">
            <input
              id="habit-score"
              type="number"
              className="w-full bg-white border border-black rounded-xl px-4 py-3 text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-black transition-all duration-200"
              value={score}
              onChange={e => setScore(e.target.value)}
              required
              min={1}
              max={100}
              placeholder="10"
            />
            <span className="absolute right-3 top-3 text-gray-600 text-sm">pts</span>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-black font-medium text-sm">
            Color del hábito *
          </label>
          <div className="grid grid-cols-4 gap-2">
            {availableColors.map((color) => (
              <button
                key={color.hex}
                type="button"
                onClick={() => setSelectedColor(color.hex)}
                className={`w-full h-10 rounded-lg transition-all duration-200 transform hover:scale-105 border-2 ${
                  selectedColor === color.hex 
                    ? 'border-black ring-2 ring-black shadow-md' 
                    : 'border-gray-300 hover:border-gray-600'
                }`}
                style={{ backgroundColor: color.hex }}
                title={`Seleccionar color ${color.name}`}
              >
                {selectedColor === color.hex && (
                  <span className="text-white text-lg font-bold drop-shadow-lg">✓</span>
                )}
              </button>
            ))}
          </div>
          {selectedColor && (
            <p className="text-black text-sm mt-2">
              Color seleccionado: <span style={{ color: selectedColor }}>●</span> {selectedColor}
            </p>
          )}
        </div>

        {error && (
          <div className="text-red-500 text-sm mt-2">
            {error}
          </div>
        )}

        <button
          type="submit"
          className="w-full bg-black text-white font-semibold py-3 rounded-lg hover:bg-gray-800 hover:scale-105 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
          disabled={isSaving}
        >
          {isSaving ? '⏳ Guardando...' : (habit ? '✏️ Actualizar' : '✨ Crear Hábito')}
        </button>
      </form>
    </div>
  );
};

export default HabitForm;

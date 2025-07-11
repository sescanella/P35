import React from 'react';
import { useTheme } from '../contexts/ThemeContext.jsx';

/**
 * Lista de hábitos.
 * Props:
 * - habits: [{ id, name, score }]
 * - onEdit: function(habit)
 * - onDelete: function(habit_id)
 */
const HabitList = ({ habits = [], onEdit, onDelete }) => {
  const { theme } = useTheme();
  return (
    <div className="space-y-4">
      {habits.length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📋</div>
          <p className="text-lg" style={{ color: theme.textSecondary }}>No tienes hábitos aún</p>
          <p className="text-sm" style={{ color: theme.textTertiary }}>¡Crea tu primer hábito arriba!</p>
        </div>
      )}
      
      {habits.map((habit, index) => (
        <div
          key={habit.id}
          className="group relative rounded-2xl p-4 transition-all duration-300 hover:shadow-md"
          style={{ 
            backgroundColor: theme.card,
            borderColor: habit.active ? theme.border : theme.borderLight,
            borderWidth: '1px',
            borderStyle: 'solid',
            animationDelay: `${index * 100}ms`
          }}
          onMouseEnter={(e) => e.target.style.borderColor = theme.border}
          onMouseLeave={(e) => e.target.style.borderColor = habit.active ? theme.border : theme.borderLight}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 flex-1">
              {/* Color indicator */}
              <div 
                className="w-6 h-6 rounded-full border-2 shadow-sm flex-shrink-0"
                style={{ 
                  backgroundColor: habit.color || habit.color_hex || '#9CA3AF',
                  borderColor: theme.border
                }}
                title={`Color: ${habit.color || habit.color_hex || 'Sin color'}`}
              ></div>
              
              <div className="flex-1">
                <h3 className="font-semibold text-lg" style={{ color: theme.text }}>
                  {habit.name}
                </h3>
                <span 
                  className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium mt-1"
                  style={{ 
                    backgroundColor: theme.secondary, 
                    color: theme.text,
                    borderColor: theme.borderLight,
                    borderWidth: '1px',
                    borderStyle: 'solid'
                  }}
                >
                  {habit.score} puntos
                </span>
              </div>
            </div>
            
            <div className="flex space-x-2 opacity-100">
              <button
                onClick={() => onEdit && onEdit(habit)}
                className="font-semibold py-2 px-3 rounded-lg hover:opacity-80 hover:scale-105 transition-all duration-200"
                style={{ 
                  backgroundColor: theme.accent,
                  color: theme.accent === '#FFFFFF' ? '#000000' : '#FFFFFF'
                }}
                title="Editar hábito"
              >
                <span className="text-sm">✏️</span>
              </button>
              <button
                onClick={() => {
                  if (window.confirm('¿Estás seguro que deseas eliminar este hábito? Esta acción lo desactivará.')) {
                    onDelete && onDelete(habit.id)
                  }
                }}
                className="font-semibold py-2 px-3 rounded-lg hover:scale-105 transition-all duration-200"
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
                title="Eliminar hábito"
              >
                <span className="text-sm">🗑️</span>
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default HabitList;

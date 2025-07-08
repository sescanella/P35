import React from 'react';

/**
 * Lista de hábitos.
 * Props:
 * - habits: [{ id, name, score }]
 * - onEdit: function(habit)
 * - onDelete: function(habit_id)
 */
const HabitList = ({ habits = [], onEdit, onDelete }) => {
  return (
    <div className="space-y-4">
      {habits.length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📋</div>
          <p className="text-gray-600 text-lg">No tienes hábitos aún</p>
          <p className="text-gray-500 text-sm">¡Crea tu primer hábito arriba!</p>
        </div>
      )}
      
      {habits.map((habit, index) => (
        <div
          key={habit.id}
          className="group relative bg-white border border-gray-300 rounded-2xl p-4 transition-all duration-300 hover:shadow-md"
          style={{ 
            animationDelay: `${index * 100}ms`,
            borderColor: habit.active ? '#1C1C1E' : '#d1d5db'
          }}
          onMouseEnter={(e) => e.target.style.borderColor = '#1C1C1E'}
          onMouseLeave={(e) => e.target.style.borderColor = habit.active ? '#1C1C1E' : '#d1d5db'}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 flex-1">
              {/* Color indicator */}
              <div 
                className="w-6 h-6 rounded-full border-2 shadow-sm flex-shrink-0"
                style={{ 
                  backgroundColor: habit.color || habit.color_hex || '#9CA3AF',
                  borderColor: '#1C1C1E'
                }}
                title={`Color: ${habit.color || habit.color_hex || 'Sin color'}`}
              ></div>
              
              <div className="flex-1">
                <h3 className="font-semibold text-lg text-black">
                  {habit.name}
                </h3>
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-black mt-1 border border-gray-300">
                  {habit.score} puntos
                </span>
              </div>
            </div>
            
            <div className="flex space-x-2 opacity-100">
              <button
                onClick={() => onEdit && onEdit(habit)}
                className="text-white font-semibold py-2 px-3 rounded-lg hover:opacity-80 hover:scale-105 transition-all duration-200"
                style={{ backgroundColor: '#1C1C1E' }}
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
                className="bg-white text-black border font-semibold py-2 px-3 rounded-lg hover:text-white hover:scale-105 transition-all duration-200"
                style={{ borderColor: '#1C1C1E' }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = '#1C1C1E';
                  e.target.style.color = 'white';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = 'white';
                  e.target.style.color = 'black';
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

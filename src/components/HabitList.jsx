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
          className="group relative bg-white border border-gray-300 rounded-2xl p-4 hover:border-black transition-all duration-300 hover:shadow-md"
          style={{ animationDelay: `${index * 100}ms` }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 flex-1">
              {/* Color indicator */}
              <div 
                className="w-4 h-4 rounded-full border-2 border-black shadow-sm flex-shrink-0"
                style={{ backgroundColor: habit.color_hex || '#9CA3AF' }}
                title={`Color: ${habit.color_hex || 'Sin color'}`}
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
                className="p-2 bg-black text-white hover:bg-gray-800 rounded-xl transition-colors duration-200"
                title="Editar hábito"
              >
                <span className="text-lg">✏️</span>
              </button>
              <button
                onClick={() => {
                  if (window.confirm('¿Estás seguro que deseas eliminar este hábito? Esta acción lo desactivará.')) {
                    onDelete && onDelete(habit.id)
                  }
                }}
                className="p-2 bg-white text-black border border-black hover:bg-gray-100 rounded-xl transition-colors duration-200"
                title="Eliminar hábito"
              >
                <span className="text-lg">🗑️</span>
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default HabitList;

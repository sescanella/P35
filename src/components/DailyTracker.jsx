import React, { useState, useEffect } from 'react'
import { 
  getHabits, 
  insertHabitTracking, 
  calculateDailyScore, 
  getHabitTrackingByDate,
  clearHabitTrackingByDate,
  saveDailyNote,
  getDailyNote,
  calculateNotePoints
} from '../models/habitModel.js'
import { supabase } from '../services/supabase.js'
import { getCurrentLocalDate, formatLocalDate, isToday } from '../utils/dateUtils.js'
import { useTheme } from '../contexts/ThemeContext.jsx'

const MAX_INSTANCES = 7; // or whatever value you need

const DailyTracker = () => {
  const { theme } = useTheme();
  const [selectedDate, setSelectedDate] = useState(getCurrentLocalDate())
  const [habits, setHabits] = useState([])
  const [habitCounts, setHabitCounts] = useState({})
  const [totalScore, setTotalScore] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [dailyNote, setDailyNote] = useState('')
  const [notePoints, setNotePoints] = useState(0)

  // Cargar hábitos activos al montar el componente
  useEffect(() => {
    loadHabits()
  }, [])

  // Cargar datos de tracking cuando cambia la fecha
  useEffect(() => {
    loadTrackingData()
    loadDailyNote()
  }, [selectedDate, habits])

  const loadHabits = async () => {
    try {
      const data = await getHabits()
      setHabits(data)
    } catch (error) {
      console.error('Error loading habits:', error)
      setMessage('Error al cargar hábitos: ' + error.message)
    }
  }

  const loadTrackingData = async () => {
    if (habits.length === 0) return
    
    try {
      const trackingData = await getHabitTrackingByDate(selectedDate)
      
      // Contar instancias por hábito
      const counts = {}
      habits.forEach(habit => {
        counts[habit.id] = 0
      })
      
      trackingData.forEach(record => {
        if (counts.hasOwnProperty(record.habit_id)) {
          counts[record.habit_id]++
        }
      })
      
      setHabitCounts(counts)
      calculateCurrentTotal(counts)
    } catch (error) {
      console.error('Error loading tracking data:', error)
      setMessage('Error al cargar datos del día: ' + error.message)
    }
  }

  const loadDailyNote = async () => {
    try {
      const noteData = await getDailyNote(selectedDate)
      setDailyNote(noteData.note)
      setNotePoints(noteData.points)
    } catch (error) {
      console.error('Error loading daily note:', error)
      setDailyNote('')
      setNotePoints(0)
    }
  }

  const calculateCurrentTotal = (counts) => {
    let total = 0
    habits.forEach(habit => {
      const count = counts[habit.id] || 0
      const score = habit.priority_score || 0
      total += count * score
    })
    // Sumar puntos de notas silenciosamente
    setTotalScore(total + notePoints)
  }

  const handleNoteChange = async (e) => {
    const newNote = e.target.value
    setDailyNote(newNote)
    
    // Calcular puntos automáticamente
    const newNotePoints = calculateNotePoints(newNote)
    setNotePoints(newNotePoints)
    
    // Recalcular total incluyendo nuevos puntos de nota
    let habitTotal = 0
    habits.forEach(habit => {
      const count = habitCounts[habit.id] || 0
      const score = habit.priority_score || 0
      habitTotal += count * score
    })
    setTotalScore(habitTotal + newNotePoints)
    
    // Auto-guardar la nota (opcional)
    try {
      await saveDailyNote(selectedDate, newNote)
    } catch (error) {
      console.error('Error auto-saving note:', error)
    }
  }

  const addHabitInstance = async (habitId) => {
    try {
      await insertHabitTracking(habitId, selectedDate)
      
      // Actualizar el contador local
      const newCounts = {
        ...habitCounts,
        [habitId]: (habitCounts[habitId] || 0) + 1
      }
      setHabitCounts(newCounts)
      calculateCurrentTotal(newCounts)
      
      setMessage('✅ Instancia de hábito agregada')
      setTimeout(() => setMessage(''), 2000)
    } catch (error) {
      console.error('Error adding habit instance:', error)
      setMessage('Error al agregar instancia: ' + error.message)
    }
  }

  const removeHabitInstance = async (habitId) => {
    if ((habitCounts[habitId] || 0) === 0) return
    
    try {
      // Obtener las instancias de este hábito para la fecha
      const trackingData = await getHabitTrackingByDate(selectedDate)
      const habitInstances = trackingData.filter(record => record.habit_id === habitId)
      
      if (habitInstances.length > 0) {
        // Eliminar la última instancia
        const { error } = await supabase
          .from('p35_habit_tracking')
          .delete()
          .eq('id', habitInstances[habitInstances.length - 1].id)
        
        if (error) throw error
        
        // Actualizar el contador local
        const newCounts = {
          ...habitCounts,
          [habitId]: Math.max(0, (habitCounts[habitId] || 0) - 1)
        }
        setHabitCounts(newCounts)
        calculateCurrentTotal(newCounts)
        
        setMessage('✅ Instancia de hábito eliminada')
        setTimeout(() => setMessage(''), 2000)
      }
    } catch (error) {
      console.error('Error removing habit instance:', error)
      setMessage('Error al eliminar instancia: ' + error.message)
    }
  }

  const finalizeDay = async () => {
    if (totalScore === 0) {
      setMessage('⚠️ No hay hábitos registrados para finalizar el día')
      return
    }

    setIsLoading(true)
    try {
      // Guardar nota si hay contenido
      if (dailyNote.trim()) {
        await saveDailyNote(selectedDate, dailyNote.trim())
      }
      
      // Calcular puntaje diario (incluye hábitos + notas)
      const result = await calculateDailyScore(selectedDate)
      const finalTotal = result.totalScore
      
      setMessage(`🎉 Día finalizado! Puntaje total: ${finalTotal} puntos`)
      setTimeout(() => setMessage(''), 4000)
    } catch (error) {
      console.error('Error finalizing day:', error)
      setMessage('Error al finalizar el día: ' + error.message)
    } finally {
      setIsLoading(false)
    }
  }

  const clearDay = async () => {
    if (!window.confirm('¿Estás seguro de que deseas limpiar todos los hábitos de este día?')) {
      return
    }

    setIsLoading(true)
    try {
      await clearHabitTrackingByDate(selectedDate)
      
      // Resetear contadores
      const resetCounts = {}
      habits.forEach(habit => {
        resetCounts[habit.id] = 0
      })
      setHabitCounts(resetCounts)
      setTotalScore(0)
      
      setMessage('🧹 Día limpiado correctamente')
      setTimeout(() => setMessage(''), 2000)
    } catch (error) {
      console.error('Error clearing day:', error)
      setMessage('Error al limpiar el día: ' + error.message)
    } finally {
      setIsLoading(false)
    }
  }

  const formatDate = (dateString) => {
    return formatLocalDate(dateString, {
      weekday: 'long',
      year: 'numeric',
      month: 'long', 
      day: 'numeric' 
    })
  }

  const isTodaySelected = isToday(selectedDate)

  return (
    <div 
      className="border rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-300 h-fit"
      style={{ 
        backgroundColor: theme.card, 
        borderColor: theme.border 
      }}
    >
      {/* Header with date selector */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-6">
          <div 
            className="w-10 h-10 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: theme.accent }}
          >
            <span 
              className="text-lg" 
              style={{ color: theme.accent === '#FFFFFF' ? '#000000' : '#FFFFFF' }}
            >
              📅
            </span>
          </div>
          <h3 className="text-xl font-bold" style={{ color: theme.text }}>Registro Diario</h3>
        </div>
        
        <div className="space-y-4">
          <label className="block text-sm font-medium" style={{ color: theme.text }}>
            Fecha del registro:
          </label>
          <input
            type="date"
            value={selectedDate}
            onChange={e => setSelectedDate(e.target.value)}
            className="w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-all duration-200"
            style={{ 
              backgroundColor: theme.card,
              color: theme.text,
              borderColor: theme.border
            }}
          />
          <p className="text-sm" style={{ color: theme.textSecondary }}>
            Selecciona un día para registrar el progreso de tus hábitos.
            {isTodaySelected && (
              <span 
                className="ml-2 px-3 py-1 rounded-full text-xs font-medium"
                style={{ 
                  backgroundColor: theme.accent, 
                  color: theme.accent === '#FFFFFF' ? '#000000' : '#FFFFFF' 
                }}
              >
                Hoy
              </span>
            )}
          </p>
        </div>
      </div>

      {/* Habits section */}
      <div className="mb-8">
        <h4 className="text-lg font-semibold mb-4" style={{ color: theme.text }}>Hábitos disponibles:</h4>
        
        {habits.length === 0 ? (
          <div className="text-center py-8">
            <p style={{ color: theme.textSecondary }}>No hay hábitos activos</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            {habits.map((habit) => {
              const count = habitCounts[habit.id] || 0
              const habitScore = habit.priority_score || 0
              const maxScore = habitScore * MAX_INSTANCES
              const currentScore = habitScore * count

              return (
                <div
                  key={habit.id}
                  className="border rounded-lg p-4 hover:shadow-md transition-all duration-300"
                  style={{ 
                    backgroundColor: theme.card,
                    borderColor: theme.borderLight,
                    ':hover': { borderColor: theme.border }
                  }}
                  onMouseEnter={(e) => e.target.style.borderColor = theme.border}
                  onMouseLeave={(e) => e.target.style.borderColor = theme.borderLight}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3 flex-1">
                      {/* Color indicator */}
                      <div 
                        className="w-4 h-4 rounded-full border flex-shrink-0"
                        style={{ 
                          backgroundColor: habit.color_hex || '#9CA3AF',
                          borderColor: theme.border
                        }}
                        title={`Color: ${habit.color_hex || 'Sin color'}`}
                      ></div>
                      
                      <div className="flex-1 min-w-0">
                        <h5 className="font-semibold text-sm truncate" style={{ color: theme.text }}>
                          {habit.name}
                        </h5>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 ml-2">
                      <button
                        onClick={() => removeHabitInstance(habit.id)}
                        disabled={count === 0}
                        className="w-8 h-8 rounded-full border hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-all duration-200 text-xs"
                        style={{ 
                          backgroundColor: theme.card,
                          borderColor: theme.border,
                          color: theme.text
                        }}
                        onMouseEnter={(e) => {
                          if (!e.target.disabled) {
                            e.target.style.backgroundColor = theme.accent;
                            e.target.style.color = theme.accent === '#FFFFFF' ? '#000000' : '#FFFFFF';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!e.target.disabled) {
                            e.target.style.backgroundColor = theme.card;
                            e.target.style.color = theme.text;
                          }
                        }}
                        title="Quitar una instancia"
                      >
                        ➖
                      </button>
                      
                      <span className="w-6 text-center font-bold text-sm" style={{ color: theme.text }}>
                        {count}
                      </span>
                      
                      <button
                        onClick={() => addHabitInstance(habit.id)}
                        className="w-8 h-8 rounded-full hover:opacity-80 hover:scale-105 flex items-center justify-center transition-all duration-200 text-xs"
                        style={{ 
                          backgroundColor: theme.accent,
                          color: theme.accent === '#FFFFFF' ? '#000000' : '#FFFFFF'
                        }}
                        title="Agregar una instancia"
                      >
                        ➕
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Total score */}
      <div 
        className="border rounded-lg p-6 mb-6 transition-all duration-300"
        style={{ 
          backgroundColor: theme.secondary, 
          borderColor: theme.borderLight 
        }}
      >
        <div className="text-center">
          <p className="text-lg mb-2 font-medium" style={{ color: theme.text }}>Puntaje total del día</p>
          <p className="text-4xl font-bold" style={{ color: theme.text }}>{totalScore} puntos</p>
          {notePoints > 0 && (
            <p className="text-sm mt-1" style={{ color: theme.textSecondary }}>
              (incluye {notePoints} pts de notas)
            </p>
          )}
        </div>
      </div>

      {/* Daily Notes Section */}
      <div 
        className="border rounded-lg p-6 mb-6 transition-all duration-300"
        style={{ 
          backgroundColor: theme.card, 
          borderColor: theme.borderLight 
        }}
      >
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-lg font-medium" style={{ color: theme.text }}>
              📝 Notas del día
            </label>
            {notePoints > 0 && (
              <span 
                className="text-sm px-2 py-1 rounded-full"
                style={{ 
                  backgroundColor: theme.secondary, 
                  color: theme.text 
                }}
              >
                +{notePoints} pts
              </span>
            )}
          </div>
          <textarea
            value={dailyNote}
            onChange={handleNoteChange}
            placeholder={`¿Cómo estuvo tu día? Comparte tus reflexiones...${'\n'}(1 punto por cada 20 caracteres)`}
            className="w-full h-32 p-4 rounded-lg border resize-none focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-200"
            style={{
              backgroundColor: theme.card,
              color: theme.text,
              borderColor: theme.border,
              placeholderColor: theme.textSecondary
            }}
            maxLength={2000}
          />
          <div className="flex justify-between items-center text-sm">
            <span style={{ color: theme.textSecondary }}>
              {dailyNote.length}/2000 caracteres
            </span>
            <span style={{ color: theme.textSecondary }}>
              Puntos calculados: {notePoints}
            </span>
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex gap-3">
        <button
          onClick={finalizeDay}
          disabled={isLoading || totalScore === 0}
          className="flex-1 font-semibold py-3 px-4 rounded-lg hover:opacity-80 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
          style={{ 
            backgroundColor: theme.accent,
            color: theme.accent === '#FFFFFF' ? '#000000' : '#FFFFFF'
          }}
        >
          {isLoading ? '⏳ Finalizando...' : '✅ Finalizar Día'}
        </button>
        
        <button
          onClick={clearDay}
          disabled={isLoading || totalScore === 0}
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
        >
          🧹 Limpiar
        </button>
      </div>

      {/* Status message */}
      {message && (
        <div 
          className="mt-4 p-3 border rounded-lg transition-all duration-300"
          style={{ 
            backgroundColor: theme.secondary, 
            borderColor: theme.borderLight 
          }}
        >
          <p className="text-center" style={{ color: theme.text }}>{message}</p>
        </div>
      )}
    </div>
  )
}

export default DailyTracker

import React, { useState, useEffect } from 'react'
import { 
  getHabits, 
  insertHabitTracking, 
  calculateDailyScore, 
  getHabitTrackingByDate,
  clearHabitTrackingByDate 
} from '../models/habitModel.js'
import { supabase } from '../services/supabase.js'

const MAX_INSTANCES = 7; // or whatever value you need

const DailyTracker = () => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [habits, setHabits] = useState([])
  const [habitCounts, setHabitCounts] = useState({})
  const [totalScore, setTotalScore] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState('')

  // Cargar hábitos activos al montar el componente
  useEffect(() => {
    loadHabits()
  }, [])

  // Cargar datos de tracking cuando cambia la fecha
  useEffect(() => {
    loadTrackingData()
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

  const calculateCurrentTotal = (counts) => {
    let total = 0
    habits.forEach(habit => {
      const count = counts[habit.id] || 0
      total += count * habit.priority_score
    })
    setTotalScore(total)
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
      const result = await calculateDailyScore(selectedDate)
      setMessage(`🎉 Día finalizado! Puntaje total: ${result.totalScore} puntos`)
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
    const date = new Date(dateString + 'T00:00:00')
    return date.toLocaleDateString('es-ES', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })
  }

  const isToday = selectedDate === new Date().toISOString().split('T')[0]

  return (
    <div className="bg-white border border-black rounded-3xl p-8 shadow-lg">
      {/* Header with date selector */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-black rounded-xl flex items-center justify-center">
            <span className="text-2xl text-white">📅</span>
          </div>
          <h2 className="text-2xl font-bold text-black">Registro Diario</h2>
        </div>
        
        <div className="space-y-3">
          <label className="block text-sm font-medium text-black">
            Fecha del registro:
          </label>
          <input
            type="date"
            value={selectedDate}
            onChange={e => setSelectedDate(e.target.value)}
            className="w-full bg-white border border-black rounded-xl px-4 py-3 text-black focus:outline-none focus:ring-2 focus:ring-gray-500"
          />
          <p className="text-sm text-gray-600">
            Selecciona un día para registrar el progreso de tus hábitos.
            {isToday && <span className="ml-2 px-2 py-1 bg-black text-white rounded-full text-xs">Hoy</span>}
          </p>
        </div>
      </div>

      {/* Habits section */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-black">Hábitos disponibles:</h3>
        
        {habits.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-600">No hay hábitos activos</p>
          </div>
        ) : (
          <div className="space-y-4 mt-4">
            {habits.map((habit) => {
              const count = habitCounts[habit.id] || 0
              const maxScore = habit.score * MAX_INSTANCES
              const currentScore = habit.score * count

              return (
                <div
                  key={habit.id}
                  className="bg-white border border-gray-300 rounded-xl p-4 hover:border-black transition-all"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3 flex-1">
                      {/* Color indicator */}
                      <div 
                        className="w-4 h-4 rounded-full border-2 border-black flex-shrink-0"
                        style={{ backgroundColor: habit.color_hex || '#9CA3AF' }}
                        title={`Color: ${habit.color_hex || 'Sin color'}`}
                      ></div>
                      
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-semibold text-black">{habit.name}</h4>
                            <div className="flex items-center gap-2 text-sm">
                              <span className="text-gray-600">
                                {habit.score} pts × {count} = {currentScore} pts
                              </span>
                              <span className="text-xs text-gray-500">
                                (máx: {maxScore} pts)
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => removeHabitInstance(habit.id)}
                        disabled={count === 0}
                        className="w-8 h-8 rounded-full bg-white text-black border border-black hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
                        title="Quitar una instancia"
                      >
                        ➖
                      </button>
                      
                      <span className="w-8 text-center font-bold text-lg">
                        {count}
                      </span>
                      
                      <button
                        onClick={() => addHabitInstance(habit.id)}
                        className="w-8 h-8 rounded-full bg-black text-white hover:bg-gray-800 flex items-center justify-center transition-colors"
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
      <div className="bg-gray-50 border border-gray-300 rounded-xl p-6 mb-6">
        <div className="text-center">
          <p className="text-lg text-black mb-2">Puntaje total del día</p>
          <p className="text-4xl font-bold text-black">{totalScore} puntos</p>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex gap-3">
        <button
          onClick={finalizeDay}
          disabled={isLoading || totalScore === 0}
          className="flex-1 bg-black text-white font-semibold py-3 rounded-xl hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
        >
          {isLoading ? '⏳ Finalizando...' : '✅ Finalizar Día'}
        </button>
        
        <button
          onClick={clearDay}
          disabled={isLoading || totalScore === 0}
          className="px-6 bg-white text-black border border-black font-semibold py-3 rounded-xl hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
        >
          🧹 Limpiar
        </button>
      </div>

      {/* Status message */}
      {message && (
        <div className="mt-4 p-3 bg-gray-100 border border-gray-300 rounded-xl">
          <p className="text-black text-center">{message}</p>
        </div>
      )}
    </div>
  )
}

export default DailyTracker

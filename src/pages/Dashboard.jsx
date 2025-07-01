import { useState, useEffect } from 'react'
import HabitForm from '../components/HabitForm.jsx'
import HabitList from '../components/HabitList.jsx'
import HabitChart from '../components/HabitChart.jsx'
import DailyTracker from '../components/DailyTracker.jsx'
import { createHabit, getHabits, updateHabit, deactivateHabit, getHabitTrackingByDate } from '../models/habitModel.js'
import { supabase } from '../services/supabase.js'

function Dashboard() {
  // Estado de hábitos y formulario
  const [habits, setHabits] = useState([])
  const [tracking, setTracking] = useState([])
  const [editingHabit, setEditingHabit] = useState(null)
  const [showEditOptions, setShowEditOptions] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  // Cargar hábitos desde Supabase al montar
  useEffect(() => {
    async function loadData() {
      setIsLoading(true)
      setError(null)
      try {
        // Cargar hábitos
        const habitsData = await getHabits()
        const formattedHabits = habitsData.map(h => ({
          id: h.id,
          name: h.name,
          score: h.priority_score,
          color: h.color_hex,
          done: false
        }))
        setHabits(formattedHabits)

        // Cargar datos de tracking de los últimos 7 días
        await loadTrackingData()
      } catch (error) {
        console.error('Error al cargar datos:', error)
        setError(error.message || 'Error al cargar datos')
      } finally {
        setIsLoading(false)
      }
    }
    loadData()
  }, [])

  // Función para cargar datos de tracking de los últimos 21 días
  const loadTrackingData = async () => {
    try {
      const trackingData = []
      
      // Obtener los últimos 21 días
      for (let i = 20; i >= 0; i--) {
        const date = new Date()
        date.setDate(date.getDate() - i)
        const dateStr = date.toISOString().split('T')[0]
        
        // Obtener tracking para cada fecha
        const { data, error } = await supabase
          .from('p35_habit_tracking')
          .select('habit_id, date, done')
          .eq('date', dateStr)
        
        if (error) {
          console.error('Error loading tracking data for', dateStr, error)
          continue
        }
        
        // Agregar cada registro de tracking con formato estándar
        data.forEach(record => {
          trackingData.push({
            habit_id: record.habit_id,
            date: record.date,
            completed: record.done
          })
        })
      }
      
      setTracking(trackingData)
    } catch (error) {
      console.error('Error loading tracking data:', error)
    }
  }

  // Guardar hábito (crear o editar)
  const handleSaveHabit = async (name, score, color_hex) => {
    if (editingHabit) {
      try {
        await updateHabit(editingHabit.id, { name, priority_score: Number(score), color_hex })
        // Refrescar hábitos
        const data = await getHabits()
        setHabits(data.map(h => ({
          id: h.id,
          name: h.name,
          score: h.priority_score,
          color: h.color_hex,
          done: false
        })))
        setEditingHabit(null)
        setShowEditOptions(false)
      } catch (error) {
        alert('Error al actualizar el hábito: ' + (error.message || error))
      }
    } else {
      try {
        const newHabit = await createHabit({ name, priority_score: Number(score), color_hex })
        // Refrescar todos los hábitos
        const data = await getHabits()
        setHabits(data.map(h => ({
          id: h.id,
          name: h.name,
          score: h.priority_score,
          color: h.color_hex,
          done: false
        })))
        // Refrescar tracking data también
        await loadTrackingData()
      } catch (error) {
        console.error('Error al guardar el hábito en Supabase:', error)
        alert('Error al guardar el hábito en Supabase: ' + (error.message || error))
      }
    }
  }

  // Cambiar estado done
  const handleToggleDone = (id, done) => {
    setHabits(habits.map(h => h.id === id ? { ...h, done } : h))
  }

  // Editar hábito: muestra opciones
  const handleEdit = (habit) => {
    setEditingHabit(habit)
    setShowEditOptions(true)
  }

  // Eliminar (desactivar) hábito
  const handleDeactivate = async (id) => {
    try {
      await deactivateHabit(id)
      // Refrescar hábitos
      const data = await getHabits()
      setHabits(data.map(h => ({
        id: h.id,
        name: h.name,
        score: h.priority_score,
        color_hex: h.color_hex,
        done: false
      })))
      setEditingHabit(null)
      setShowEditOptions(false)
    } catch (error) {
      alert('Error al eliminar el hábito: ' + (error.message || error))
    }
  }

  // Borrar hábito local (no usado ahora)
  const handleDelete = (id) => setHabits(habits.filter(h => h.id !== id))

  return (
    <div className="max-w-7xl mx-auto">
      {error && (
        <div className="mb-4 p-4 bg-white border border-black text-black">
          {error}
        </div>
      )}
      {isLoading ? (
        <div className="flex items-center justify-center h-32">
          <div className="text-black">Cargando hábitos...</div>
        </div>
      ) : (
        <>
          {/* Hero Section */}
          <div className="text-center mb-6">
            <h1 className="text-5xl font-extrabold text-black mb-1 animate-scale-in">
              HABITOS SEBA
            </h1>
          </div>

          {/* Main Content Grid - 40%/60% split */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mb-6">
            {/* Left Column: Metrics + HabitForm + HabitList (40% width) */}
            <div className="lg:col-span-2 space-y-4">
              
              {/* Metrics Block */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="text-center bg-white border border-black rounded-2xl p-4">
                  <span className="text-xs font-medium text-gray-600 uppercase tracking-wide">Total de hábitos</span>
                  <div className="text-2xl font-bold text-black mt-1">{habits.length}</div>
                </div>
                <div className="text-center bg-white border border-black rounded-2xl p-4">
                  <span className="text-xs font-medium text-gray-600 uppercase tracking-wide">Completados hoy</span>
                  <div className="text-2xl font-bold text-black mt-1">{habits.filter(h => h.done).length}</div>
                </div>
              </div>

              {/* HabitForm - Collapsible */}
              <CollapsibleHabitForm 
                habit={editingHabit} 
                onSave={handleSaveHabit}
                showEditOptions={showEditOptions}
                onDeactivate={() => handleDeactivate(editingHabit.id)}
                onCancel={() => { setEditingHabit(null); setShowEditOptions(false); }}
              />

              {/* HabitList - Collapsible */}
              <CollapsibleHabitList
                habits={habits}
                onToggleDone={handleToggleDone}
                onEdit={handleEdit}
                onDelete={handleDeactivate}
              />
            </div>

            {/* Right Column: DailyTracker (60% width) */}
            <div className="lg:col-span-3">
              <DailyTracker habits={habits} />
            </div>
          </div>

          {/* Row 3: Chart - Full Width */}
          <div className="bg-white border border-black rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow duration-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-black rounded-lg flex items-center justify-center">
                <span className="text-lg text-white">📊</span>
              </div>
              <h2 className="text-xl font-bold text-black">Progreso Diario</h2>
            </div>
            <HabitChart habits={habits} tracking={tracking} />
          </div>
        </>
      )}
    </div>
  )
}

// Componente HabitForm Colapsable
function CollapsibleHabitForm({ habit, onSave, showEditOptions, onDeactivate, onCancel }) {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <div className="bg-white border border-black rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden">
      {/* Header clickeable */}
      <div 
        className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 transition-colors duration-200"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
            <span className="text-sm text-white">✨</span>
          </div>
          <h3 className="text-lg font-bold text-black">
            {habit ? 'Editar Hábito' : 'Crear Nuevo Hábito'}
          </h3>
        </div>
        <div className={`transition-transform duration-300 ${isExpanded ? 'rotate-90' : ''}`}>
          <svg className="w-4 h-4 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>

      {/* Contenido expandible */}
      <div className={`transition-all duration-300 ease-in-out ${
        isExpanded ? 'max-h-[800px] opacity-100' : 'max-h-0 opacity-0'
      } overflow-hidden`}>
        <div className="px-4 pb-4 border-t border-gray-100">
          <div className="pt-4">
            <HabitForm habit={habit} onSave={onSave} />
            {showEditOptions && (
              <div className="flex gap-2 mt-4">
                <button
                  className="flex-1 bg-black text-white py-2 px-4 rounded-lg hover:bg-gray-800 hover:scale-105 transition-all duration-200 font-medium"
                  onClick={onDeactivate}
                >
                  Eliminar
                </button>
                <button
                  className="flex-1 bg-white text-black border border-black py-2 px-4 rounded-lg hover:bg-black hover:text-white hover:scale-105 transition-all duration-200 font-medium"
                  onClick={onCancel}
                >
                  Cancelar
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// Componente HabitList Colapsable
function CollapsibleHabitList({ habits, onToggleDone, onEdit, onDelete }) {
  const [isExpanded, setIsExpanded] = useState(true) // Expandido por defecto

  return (
    <div className="bg-white border border-black rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden">
      {/* Header clickeable */}
      <div 
        className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 transition-colors duration-200"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
            <span className="text-sm text-white">📝</span>
          </div>
          <h3 className="text-lg font-bold text-black">Mis Hábitos</h3>
          <span className="text-xs font-medium text-gray-600 bg-gray-100 px-2 py-1 rounded-full">
            {habits.length}
          </span>
        </div>
        <div className={`transition-transform duration-300 ${isExpanded ? 'rotate-90' : ''}`}>
          <svg className="w-4 h-4 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>

      {/* Contenido expandible */}
      <div className={`transition-all duration-300 ease-in-out ${
        isExpanded ? 'max-h-[800px] opacity-100' : 'max-h-0 opacity-0'
      } overflow-hidden`}>
        <div className="px-4 pb-4 border-t border-gray-100">
          <div className="pt-4">
            <HabitList
              habits={habits}
              onToggleDone={onToggleDone}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard

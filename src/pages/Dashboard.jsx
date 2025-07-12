import { useState, useEffect } from 'react'
import HabitForm from '../components/HabitForm.jsx'
import HabitList from '../components/HabitList.jsx'
import HabitChart from '../components/HabitChart.jsx'
import DailyTracker from '../components/DailyTracker.jsx'
import LoadingScreen from '../components/LoadingScreen.jsx'
import TimezoneSettings from '../components/TimezoneSettings.jsx'
import DarkModeToggle from '../components/DarkModeToggle.jsx'
import { createHabit, getHabits, updateHabit, deactivateHabit, getHabitTrackingByDate } from '../models/habitModel.js'
import { supabase } from '../services/supabase.js'
import { getLastNDays } from '../utils/dateUtils.js'
import { useTheme } from '../contexts/ThemeContext.jsx'

function Dashboard() {
  // Get theme context
  const { theme } = useTheme();
  
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
        console.log('Iniciando carga de datos...')
        
        // Cargar hábitos
        const habitsData = await getHabits()
        console.log('Hábitos cargados:', habitsData)
        
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
        console.log('Datos cargados exitosamente')
      } catch (error) {
        console.error('Error al cargar datos:', error)
        setError(error.message || 'Error al cargar datos')
      } finally {
        console.log('Finalizando carga, setting isLoading to false')
        setIsLoading(false)
      }
    }
    loadData()
  }, [])

  // Función para cargar datos de tracking de los últimos 21 días
  const loadTrackingData = async () => {
    try {
      const trackingData = []
      
      // Obtener los últimos 21 días usando utilidad timezone-safe
      const last21Days = getLastNDays(21)
      
      for (const dateStr of last21Days) {
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
        // Refrescar hábitos después de crear uno nuevo
        await refreshHabits()
      } catch (error) {
        console.error('Error al guardar el hábito en Supabase:', error)
        alert('Error al guardar el hábito en Supabase: ' + (error.message || error))
      }
    }
  }

  // Función para refrescar hábitos después de crear uno nuevo
  const refreshHabits = async () => {
    try {
      const habitsData = await getHabits()
      const formattedHabits = habitsData.map(h => ({
        id: h.id,
        name: h.name,
        score: h.priority_score,
        color: h.color_hex,
        done: false
      }))
      setHabits(formattedHabits)
    } catch (error) {
      console.error('Error al refrescar hábitos:', error)
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
    <div className="max-w-7xl mx-auto transition-colors duration-300" style={{ backgroundColor: theme.primary }}>
      {/* Show LoadingScreen while loading */}
      <LoadingScreen isVisible={isLoading} />
      
      {error && (
        <div className="mb-4 p-4 rounded-lg border" style={{ 
          backgroundColor: theme.card, 
          borderColor: theme.border,
          color: theme.text 
        }}>
          {error}
        </div>
      )}
      
      {!isLoading && (
        <>
          {/* Hero Section */}
          <div className="text-center mb-6">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-4">
                <DarkModeToggle />
              </div>
              <h1 className="text-5xl font-extrabold mb-1 animate-scale-in" style={{ color: theme.text }}>
                HABITOS SEBA
              </h1>
              <TimezoneSettings 
                onTimezoneChange={(timezone) => {
                  console.log('Timezone changed to:', timezone);
                  // Reload tracking data when timezone changes
                  loadTrackingData();
                }}
              />
            </div>
          </div>

          {/* Main Content Grid - 40%/60% split */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mb-6">
            {/* Left Column: HabitForm + HabitList (40% width) */}
            <div className="lg:col-span-2 space-y-4">
              
              {/* HabitForm - Collapsible */}
              <CollapsibleHabitForm 
                habit={editingHabit} 
                onSave={handleSaveHabit}
                onHabitCreated={refreshHabits}
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
          <div 
            className="border rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-300"
            style={{ 
              backgroundColor: theme.card, 
              borderColor: theme.border 
            }}
          >
            <div className="flex items-center gap-3 mb-4">
              <div 
                className="w-10 h-10 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: theme.accent }}
              >
                <span 
                  className="text-lg"
                  style={{ color: theme.accent === '#FFFFFF' ? '#000000' : '#FFFFFF' }}
                >
                  📊
                </span>
              </div>
              <h2 
                className="text-xl font-bold transition-colors duration-300"
                style={{ color: theme.text }}
              >
                Progreso Diario
              </h2>
            </div>
            <HabitChart habits={habits} tracking={tracking} />
          </div>
        </>
      )}
    </div>
  )
}

// Componente HabitForm Colapsable
function CollapsibleHabitForm({ habit, onSave, onHabitCreated, showEditOptions, onDeactivate, onCancel }) {
  const { theme } = useTheme();
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <div 
      className="border rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden"
      style={{ 
        backgroundColor: theme.card, 
        borderColor: theme.border 
      }}
    >
      {/* Header clickeable */}
      <div 
        className="flex items-center justify-between p-4 cursor-pointer hover:opacity-80 transition-all duration-200"
        onClick={() => setIsExpanded(!isExpanded)}
        onMouseEnter={(e) => {
          e.target.style.backgroundColor = theme.secondary;
        }}
        onMouseLeave={(e) => {
          e.target.style.backgroundColor = theme.card;
        }}
      >
        <div className="flex items-center gap-3">
          <div 
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: theme.accent }}
          >
            <span 
              className="text-sm"
              style={{ color: theme.accent === '#FFFFFF' ? '#000000' : '#FFFFFF' }}
            >
              ✨
            </span>
          </div>
          <h3 
            className="text-lg font-bold transition-colors duration-300"
            style={{ color: theme.text }}
          >
            {habit ? 'Editar Hábito' : 'Crear Nuevo Hábito'}
          </h3>
        </div>
        <div className={`transition-transform duration-300 ${isExpanded ? 'rotate-90' : ''}`}>
          <svg 
            className="w-4 h-4 transition-colors duration-300" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
            style={{ color: theme.text }}
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>

      {/* Contenido expandible */}
      <div className={`transition-all duration-300 ease-in-out ${
        isExpanded ? 'max-h-fit opacity-100' : 'max-h-0 opacity-0'
      } overflow-hidden`}>
        <div 
          className="p-4 transition-colors duration-300"
          style={{ 
            borderTopColor: theme.borderLight,
            borderTopWidth: '1px',
            borderTopStyle: 'solid'
          }}
        >
          <div className="pt-0">
            {/* Use new HabitForm for creating new habits */}
            {!habit && (
              <HabitForm onHabitCreated={onHabitCreated} />
            )}
            
            {/* For editing existing habits, we'd need an EditHabitForm component */}
            {habit && (
              <div className="text-center py-8">
                <p style={{ color: theme.textSecondary }}>La edición de hábitos aún no está implementada.</p>
                <p 
                  className="text-sm mt-2"
                  style={{ color: theme.textTertiary }}
                >
                  Por ahora, puedes crear un nuevo hábito.
                </p>
              </div>
            )}
            
            {showEditOptions && (
              <div className="flex gap-2 mt-4">
                <button
                  className="flex-1 py-2 px-4 rounded-lg hover:opacity-80 hover:scale-105 transition-all duration-200 font-medium"
                  style={{ 
                    backgroundColor: theme.accent,
                    color: theme.accent === '#FFFFFF' ? '#000000' : '#FFFFFF'
                  }}
                  onClick={onDeactivate}
                >
                  Eliminar
                </button>
                <button
                  className="flex-1 py-2 px-4 rounded-lg hover:scale-105 transition-all duration-200 font-medium"
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
  const { theme } = useTheme();
  const [isExpanded, setIsExpanded] = useState(false) // Comprimido por defecto

  return (
    <div 
      className="rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden" 
      style={{ 
        backgroundColor: theme.card,
        borderColor: theme.border, 
        borderWidth: '1px', 
        borderStyle: 'solid' 
      }}
    >
      {/* Header clickeable */}
      <div 
        className="flex items-center justify-between p-4 cursor-pointer hover:opacity-80 transition-all duration-200"
        onClick={() => setIsExpanded(!isExpanded)}
        onMouseEnter={(e) => {
          e.target.style.backgroundColor = theme.secondary;
        }}
        onMouseLeave={(e) => {
          e.target.style.backgroundColor = theme.card;
        }}
      >
        <div className="flex items-center gap-3">
          <div 
            className="w-8 h-8 rounded-lg flex items-center justify-center" 
            style={{ backgroundColor: theme.accent }}
          >
            <span 
              className="text-sm"
              style={{ color: theme.accent === '#FFFFFF' ? '#000000' : '#FFFFFF' }}
            >
              📝
            </span>
          </div>
          <h3 
            className="text-lg font-bold transition-colors duration-300"
            style={{ color: theme.text }}
          >
            Mis Hábitos
          </h3>
          <span 
            className="text-xs font-medium px-2 py-1 rounded-full transition-colors duration-300"
            style={{ 
              color: theme.textSecondary, 
              backgroundColor: theme.secondary 
            }}
          >
            {habits.length}
          </span>
        </div>
        <div className={`transition-transform duration-300 ${isExpanded ? 'rotate-90' : ''}`}>
          <svg 
            className="w-4 h-4 transition-colors duration-300" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
            style={{ color: theme.text }}
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>

      {/* Contenido expandible */}
      <div className={`transition-all duration-300 ease-in-out ${
        isExpanded ? 'max-h-fit opacity-100' : 'max-h-0 opacity-0'
      } overflow-hidden`}>
        <div 
          className="p-4 transition-colors duration-300"
          style={{ 
            borderTopColor: theme.borderLight,
            borderTopWidth: '1px',
            borderTopStyle: 'solid'
          }}
        >
          <div className="pt-0">
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

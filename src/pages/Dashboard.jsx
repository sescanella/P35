import { useState, useEffect } from 'react'
import HabitForm from '../components/HabitForm.jsx'
import HabitList from '../components/HabitList.jsx'
import HabitChart from '../components/HabitChart.jsx'
import DailyTracker from '../components/DailyTracker.jsx'
import { createHabit, getHabits, updateHabit, deactivateHabit } from '../models/habitModel.js'

function Dashboard() {
  // Estado de hábitos y formulario
  const [habits, setHabits] = useState([])
  const [editingHabit, setEditingHabit] = useState(null)
  const [showEditOptions, setShowEditOptions] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  // Cargar hábitos desde Supabase al montar
  useEffect(() => {
    async function loadHabits() {
      setIsLoading(true)
      setError(null)
      try {
        const data = await getHabits()
        setHabits(
          data.map(h => ({
            id: h.id,
            name: h.name,
            score: h.priority_score,
            color_hex: h.color_hex,
            done: false
          }))
        )
      } catch (error) {
        console.error('Error al cargar hábitos:', error)
        setError(error.message || 'Error al cargar hábitos')
        // Mantener los hábitos anteriores en caso de error
      } finally {
        setIsLoading(false)
      }
    }
    loadHabits()
  }, [])

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
          color_hex: h.color_hex,
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
        setHabits([
          ...habits,
          { id: newHabit.id, name: newHabit.name, score: newHabit.priority_score, color_hex: newHabit.color_hex, done: false }
        ])
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

  // Datos para el gráfico
  const chartData = [
    { date: '2025-06-28', day_score: 25 },
    { date: '2025-06-29', day_score: 40 },
    { date: '2025-06-30', day_score: 30 },
  ]

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
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold text-black mb-4 animate-scale-in">
              Habitos Seba
            </h1>
            <p className="text-lg text-black max-w-2xl mx-auto animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
              Construye hábitos positivos y alcanza tus metas diarias con nuestro sistema de seguimiento inteligente
            </p>
            <div className="mt-6 flex justify-center gap-4 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
              <div className="bg-white border border-black rounded-2xl px-6 py-3 shadow-sm">
                <span className="text-sm text-gray-600">Total de hábitos</span>
                <div className="text-2xl font-bold text-black">{habits.length}</div>
              </div>
              <div className="bg-white border border-black rounded-2xl px-6 py-3 shadow-sm">
                <span className="text-sm text-gray-600">Completados hoy</span>
                <div className="text-2xl font-bold text-black">{habits.filter(h => h.done).length}</div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
            {/* Formulario - Tarjeta destacada */}
            <div className="xl:col-span-1 animate-slide-in-right" style={{ animationDelay: '0.1s' }}>
              <div className="bg-white border border-black rounded-3xl p-8 shadow-lg">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-black rounded-xl flex items-center justify-center">
                    <span className="text-2xl text-white">✨</span>
                  </div>
                  <h2 className="text-2xl font-bold text-black">{editingHabit ? 'Editar Hábito' : 'Crear Nuevo Hábito'}</h2>
                </div>
                <HabitForm habit={editingHabit} onSave={handleSaveHabit} />
                {showEditOptions && (
                  <div className="flex gap-2 mt-4">
                    <button
                      className="flex-1 bg-black text-white py-2 rounded-xl hover:bg-gray-800 transition"
                      onClick={() => handleDeactivate(editingHabit.id)}
                    >
                      Eliminar
                    </button>
                    <button
                      className="flex-1 bg-white text-black border border-black py-2 rounded-xl hover:bg-gray-100 transition"
                      onClick={() => { setEditingHabit(null); setShowEditOptions(false); }}
                    >
                      Cancelar
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Lista de hábitos */}
            <div className="xl:col-span-2 animate-slide-in-left" style={{ animationDelay: '0.2s' }}>
              <div className="bg-white border border-black rounded-3xl p-8 shadow-lg h-full">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-black rounded-xl flex items-center justify-center">
                    <span className="text-2xl text-white">📝</span>
                  </div>
                  <h2 className="text-2xl font-bold text-black">Mis Hábitos</h2>
                </div>
                <HabitList
                  habits={habits}
                  onToggleDone={handleToggleDone}
                  onEdit={handleEdit}
                  onDelete={handleDeactivate}
                />
              </div>
            </div>

            {/* Gráfico */}
            <div className="xl:col-span-1 animate-slide-in-right" style={{ animationDelay: '0.3s' }}>
              <div className="bg-white border border-black rounded-3xl p-8 shadow-lg">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-black rounded-xl flex items-center justify-center">
                    <span className="text-2xl text-white">📊</span>
                  </div>
                  <h2 className="text-2xl font-bold text-black">Progreso Diario</h2>
                </div>
                <HabitChart data={chartData} />
              </div>
            </div>
          </div>

          {/* Daily Tracker */}
          <div className="mt-8 animate-slide-in-up" style={{ animationDelay: '0.4s' }}>
            <DailyTracker habits={habits} />
          </div>
        </>
      )}
    </div>
  )
}

export default Dashboard

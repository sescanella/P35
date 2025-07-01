import { supabase } from '../services/supabase.js'

// Crea un nuevo hábito en la tabla 'p35_habits' de Supabase
export async function createHabit({ name, priority_score, color_hex }) {
  if (!name || !color_hex) {
    throw new Error('El nombre y el color son requeridos')
  }

  const { data, error } = await supabase
    .from('p35_habits')
    .insert([{ 
      name, 
      priority_score: priority_score || 0, 
      color_hex, 
      active: true 
    }])
    .select()
    .single()

  if (error) {
    console.error('Error al crear hábito:', error)
    throw new Error('No se pudo crear el hábito')
  }

  return data
}

// Obtiene todos los hábitos activos de la tabla 'p35_habits'
export async function getHabits() {
  const { data, error } = await supabase
    .from('p35_habits')
    .select('*')
    .eq('active', true)
    .order('name', { ascending: true })

  if (error) {
    console.error('Error al obtener hábitos:', error)
    throw new Error('No se pudieron obtener los hábitos')
  }

  return data || []
}

// Actualiza un hábito existente (nombre, puntaje y color)
export async function updateHabit(id, { name, priority_score, color_hex }) {
  const { data, error } = await supabase
    .from('p35_habits')
    .update({ name, priority_score, color_hex })
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

// Cambia el campo 'active' a false (eliminar lógico)
export async function deactivateHabit(id) {
  const { data, error } = await supabase
    .from('p35_habits')
    .update({ active: false })
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

// Inserta una nueva instancia de hábito realizado en una fecha específica
export async function insertHabitTracking(habit_id, date) {
  const { data, error } = await supabase
    .from('p35_habit_tracking')
    .insert([{ 
      habit_id, 
      date, 
      done: true 
    }])
    .select()
    .single()
  if (error) throw error
  return data
}

// Obtiene todas las instancias de hábitos para una fecha específica
export async function getHabitTrackingByDate(date) {
  const { data, error } = await supabase
    .from('p35_habit_tracking')
    .select(`
      *,
      p35_habits:habit_id (
        id,
        name,
        priority_score
      )
    `)
    .eq('date', date)
    .eq('done', true)
  if (error) throw error
  return data
}

// Calcula y guarda el puntaje diario total
export async function calculateDailyScore(date) {
  // Obtener todas las instancias de hábitos para la fecha
  const trackingData = await getHabitTrackingByDate(date)
  
  // Agrupar por hábito y contar instancias
  const habitCounts = {}
  trackingData.forEach(record => {
    const habitId = record.habit_id
    const habitData = record.p35_habits
    if (!habitCounts[habitId]) {
      habitCounts[habitId] = {
        count: 0,
        priority_score: habitData.priority_score
      }
    }
    habitCounts[habitId].count++
  })
  
  // Calcular el puntaje total
  let totalScore = 0
  Object.values(habitCounts).forEach(habit => {
    totalScore += habit.count * habit.priority_score
  })
  
  // Insertar o actualizar en p35_daily_score
  const { data, error } = await supabase
    .from('p35_daily_score')
    .upsert([{ 
      date, 
      habit_score_total: totalScore 
    }])
    .select()
    .single()
  
  if (error) throw error
  return { totalScore, data }
}

// Elimina todas las instancias de hábitos para una fecha específica
export async function clearHabitTrackingByDate(date) {
  const { error } = await supabase
    .from('p35_habit_tracking')
    .delete()
    .eq('date', date)
  if (error) throw error
}

// Obtiene el puntaje diario guardado para una fecha
export async function getDailyScore(date) {
  const { data, error } = await supabase
    .from('p35_daily_score')
    .select('*')
    .eq('date', date)
    .single()
  if (error && error.code !== 'PGRST116') throw error // PGRST116 = no rows returned
  return data
}

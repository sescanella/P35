import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://yulfzxskoknjjciqtjkq.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl1bGZ6eHNrb2tuampjaXF0amtxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg0Njg4NDUsImV4cCI6MjA2NDA0NDg0NX0.f2slOB27W3mGbiAPnW67YQXLqDQFU8NsZ-wHKTjAC2c'

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Supabase URL and key are required')
}

export const supabase = createClient(supabaseUrl, supabaseKey)

// Agregar manejador global de errores de red
supabase.auth.onAuthStateChange((event, session) => {
  if (event === 'SIGNED_OUT') {
    console.log('Usuario desconectado')
  }
})

// Verificar la conexión
export async function checkConnection() {
  try {
    const { error } = await supabase.from('p35_habits').select('id').limit(1)
    if (error) throw error
    return true
  } catch (error) {
    console.error('Error de conexión a Supabase:', error)
    return false
  }
}
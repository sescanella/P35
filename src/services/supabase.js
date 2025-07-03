import { createClient } from '@supabase/supabase-js'

// Load environment variables with proper validation
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Validate required environment variables
if (!supabaseUrl || !supabaseKey) {
  throw new Error(
    'Missing required environment variables. Please check that VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are defined in your .env file.'
  )
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
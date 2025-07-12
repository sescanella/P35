import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config();

// Configuración de Supabase
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const conversationsTable = process.env.SUPABASE_CONVERSATIONS_TABLE || 'P35_conversations_pipa';

// Validar que las variables estén configuradas
if (!supabaseUrl || !supabaseKey) {
  console.warn('⚠️  Variables de Supabase no configuradas completamente');
  console.warn('📝 Configura SUPABASE_URL y SUPABASE_ANON_KEY en el archivo .env');
}

// Crear cliente de Supabase (null si no está configurado)
export const supabase = (supabaseUrl && supabaseKey) 
  ? createClient(supabaseUrl, supabaseKey)
  : null;

/**
 * Guarda una conversación en Supabase
 * @param {Object} conversationData - Datos de la conversación
 * @param {string} conversationData.user_id - ID del usuario
 * @param {string} conversationData.thread_id - ID del thread de OpenAI
 * @param {string} conversationData.message - Mensaje del usuario
 * @param {string} conversationData.response - Respuesta de PiPa
 * @param {number} conversationData.tokens_used - Tokens utilizados
 * @param {string} conversationData.model_used - Modelo utilizado
 * @param {string} conversationData.session_id - ID de sesión
 * @returns {Promise<Object>} Resultado de la operación
 */
export async function saveConversation(conversationData) {
  if (!supabase) {
    console.log('📊 Supabase no configurado, saltando guardado...');
    return { success: false, error: 'Supabase no configurado' };
  }

  try {
    const { data, error } = await supabase
      .from(conversationsTable)
      .insert([{
        user_id: conversationData.user_id || 'anonymous',
        thread_id: conversationData.thread_id,
        message: conversationData.message,
        response: conversationData.response,
        tokens_used: conversationData.tokens_used || 0,
        model_used: conversationData.model_used || 'gpt-3.5-turbo',
        session_id: conversationData.session_id
      }])
      .select();

    if (error) {
      console.error('❌ Error guardando conversación:', error);
      return { success: false, error: error.message };
    }

    console.log('💾 Conversación guardada exitosamente');
    return { success: true, data: data[0] };

  } catch (error) {
    console.error('❌ Error inesperado guardando conversación:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Obtiene el historial de conversaciones de un usuario
 * @param {string} userId - ID del usuario
 * @param {string} sessionId - ID de sesión (opcional)
 * @param {number} limit - Límite de mensajes a recuperar
 * @returns {Promise<Array>} Array de conversaciones
 */
export async function getConversationHistory(userId = 'anonymous', sessionId = null, limit = 20) {
  if (!supabase) {
    console.log('📊 Supabase no configurado, devolviendo historial vacío...');
    return [];
  }

  try {
    let query = supabase
      .from(conversationsTable)
      .select('*')
      .eq('user_id', userId)
      .order('timestamp', { ascending: true })
      .limit(limit);

    // Si se proporciona session_id, filtrar por él
    if (sessionId) {
      query = query.eq('session_id', sessionId);
    }

    const { data, error } = await query;

    if (error) {
      console.error('❌ Error obteniendo historial:', error);
      return [];
    }

    console.log(`📚 Obtenido historial: ${data.length} mensajes`);
    return data || [];

  } catch (error) {
    console.error('❌ Error inesperado obteniendo historial:', error);
    return [];
  }
}

/**
 * Obtiene conversaciones por thread_id para mantener continuidad con OpenAI
 * @param {string} threadId - ID del thread de OpenAI
 * @returns {Promise<Array>} Array de conversaciones del thread
 */
export async function getConversationsByThread(threadId) {
  if (!supabase || !threadId) {
    return [];
  }

  try {
    const { data, error } = await supabase
      .from(conversationsTable)
      .select('*')
      .eq('thread_id', threadId)
      .order('timestamp', { ascending: true });

    if (error) {
      console.error('❌ Error obteniendo conversaciones por thread:', error);
      return [];
    }

    return data || [];

  } catch (error) {
    console.error('❌ Error inesperado obteniendo thread:', error);
    return [];
  }
}

/**
 * Verifica la conexión con Supabase
 * @returns {Promise<boolean>} True si la conexión es exitosa
 */
export async function testSupabaseConnection() {
  if (!supabase) {
    return false;
  }

  try {
    const { error } = await supabase
      .from(conversationsTable)
      .select('id')
      .limit(1);

    if (error) {
      console.error('❌ Error de conexión Supabase:', error);
      return false;
    }

    console.log('✅ Conexión Supabase exitosa');
    return true;

  } catch (error) {
    console.error('❌ Error inesperado conectando Supabase:', error);
    return false;
  }
}

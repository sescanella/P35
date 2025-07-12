import OpenAI from 'openai';
import dotenv from 'dotenv';
import { saveConversation, getConversationHistory } from './supabase.js';
import { v4 as uuidv4 } from 'uuid';

// Cargar variables de entorno
dotenv.config();

// Configuración condicional de OpenAI
const apiKey = process.env.OPENAI_API_KEY;
let openai = null;

if (apiKey && apiKey !== 'tu_api_key_aqui') {
  try {
    openai = new OpenAI({
      apiKey: apiKey,
    });
    console.log('✅ OpenAI inicializado correctamente');
  } catch (error) {
    console.error('❌ Error inicializando OpenAI:', error);
  }
} else {
  console.log('⚠️  API Key no configurada, usando modo simulación');
}

// Almacén temporal de threads por sesión (en memoria)
const sessionThreads = new Map();

/**
 * Función principal para chatear con PiPa (con memoria)
 * @param {string} userMessage - Mensaje del usuario
 * @param {string} sessionId - ID de sesión (opcional, se genera automáticamente)
 * @param {string} userId - ID del usuario (opcional)
 * @returns {Promise<Object>} Respuesta de PiPa con metadatos
 */
export async function chatWithPiPa(userMessage, sessionId = null, userId = 'anonymous') {
  // Generar session_id si no se proporciona
  if (!sessionId) {
    sessionId = uuidv4();
  }

  try {
    let pipaResponse;
    let tokensUsed = 0;
    let modelUsed = 'gpt-3.5-turbo';
    const threadId = `thread_${sessionId}`;

    if (!openai) {
      // Modo simulación con personalidad de gato mejorada
      console.log('⚠️  API Key no configurada, simulando respuesta de PiPa...');
      pipaResponse = generateSimulatedResponse(userMessage);
      tokensUsed = Math.floor(userMessage.length / 4) + Math.floor(pipaResponse.length / 4);
    } else {
      // Modo real con OpenAI
      try {
        const systemPrompt = `Eres PiPa, un asistente AI con personalidad de gato inteligente y amigable. 
        Características de tu personalidad:
        - Eres inteligente y útil, pero mantienes un toque juguetón y gatuno
        - Ocasionalmente usas emojis de gato (�, �🐾, 😸)
        - Eres conciso pero cálido en tus respuestas
        - Te gusta ayudar a los usuarios con cualquier tema
        - Mantienes una actitud positiva y motivacional
        
        Responde de manera natural y útil, incorporando sutilmente tu personalidad gatuna.`;

        const completion = await openai.chat.completions.create({
          model: 'gpt-3.5-turbo',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userMessage }
          ],
          max_tokens: 500,
          temperature: 0.7,
        });

        pipaResponse = completion.choices[0].message.content;
        tokensUsed = completion.usage.total_tokens;
        modelUsed = completion.model;
        
        console.log(`🤖 Respuesta OpenAI generada (${tokensUsed} tokens)`);
        
      } catch (openaiError) {
        console.error('❌ Error OpenAI:', openaiError);
        
        // Detectar errores específicos
        if (openaiError.code === 'insufficient_quota') {
          pipaResponse = "😿 ¡Ups! Se han agotado mis créditos de IA. Mi humano necesita recargar la cuenta de OpenAI. Mientras tanto, seguiré respondiendo en modo simulado. ¡Miau!";
        } else if (openaiError.code === 'rate_limit_exceeded') {
          pipaResponse = "😸 ¡Estoy un poco ocupado ahora! Demasiadas consultas al mismo tiempo. Intenta de nuevo en un momento, ¡miau!";
        } else {
          pipaResponse = "😿 Tuve un problemita técnico, pero aquí estoy para ayudarte. Mi modo simulado sigue funcionando perfectamente. ¿En qué puedo ayudarte?";
        }
        
        tokensUsed = Math.floor(userMessage.length / 4) + Math.floor(pipaResponse.length / 4);
      }
    }

    // Guardar conversación en Supabase
    const saveResult = await saveConversation({
      user_id: userId,
      thread_id: threadId,
      message: userMessage,
      response: pipaResponse,
      tokens_used: tokensUsed,
      model_used: modelUsed,
      session_id: sessionId
    });

    // Retornar respuesta en formato compatible con la API actual
    return pipaResponse;

  } catch (error) {
    console.error('❌ Error general en chatWithPiPa:', error);
    
    // Respuesta de emergencia
    return "😿 Tuve un problema técnico, pero seguiré intentando ayudarte. ¡Los gatos siempre caemos de pie! 🐾";
  }
}

/**
 * Genera respuestas simuladas con personalidad de gato mejorada
 * @param {string} userMessage - Mensaje del usuario
 * @returns {string} Respuesta simulada
 */
function generateSimulatedResponse(userMessage) {
  const responses = [
    "¡Miau! 🐱 Estoy en modo simulación, pero sigo siendo tu PiPa favorito. ¿En qué puedo ayudarte?",
    "🐾 ¡Hola! Aunque estoy en modo de práctica, mi cerebrito de gato está listo para ayudarte.",
    "😸 ¡Perfecto! Estoy funcionando en modo simulado pero con toda mi personalidad gatuna intacta.",
    "🐱 ¡Miau miau! En modo simulación, pero mi espíritu curioso de gato está aquí para ti.",
    "🐾 Aunque estoy en modo de entrenamiento, mis bigotes de gato detectan que necesitas ayuda. ¡Aquí estoy!",
    "😻 ¡Hola humano! Estoy en modo simulación, pero mi corazón gatuno late con ganas de ayudarte.",
    "🐱 ¡Ronroneo simulado activado! ¿Qué aventura planearemos hoy?",
    "🐾 En modo práctica, pero con toda la energía felina para asistirte. ¡Miau!"
  ];
  
  // Agregar algo de variación basada en el mensaje
  const index = userMessage.length % responses.length;
  return responses[index];
}

/**
 * Función para probar la conexión OpenAI
 * @returns {Promise<Object>} Estado de la conexión
 */
export async function testOpenAIConnection() {
  if (!openai) {
    return { 
      success: false, 
      message: 'OpenAI no configurado - modo simulación activo',
      mode: 'simulation'
    };
  }

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: 'Test' }],
      max_tokens: 5,
    });

    return { 
      success: true, 
      message: 'Conexión OpenAI exitosa',
      mode: 'real',
      model: completion.model
    };
  } catch (error) {
    console.error('❌ Error test OpenAI:', error);
    return { 
      success: false, 
      message: `Error: ${error.message}`,
      mode: 'error'
    };
  }
}

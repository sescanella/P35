import express from 'express';
import { chatWithPiPa, testOpenAIConnection } from '../services/openai.js';
import { testSupabaseConnection, getConversationHistory } from '../services/supabase.js';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

// POST /api/pipa - Endpoint para conversar con PiPa
router.post('/pipa', async (req, res) => {
  try {
    // Extraer el texto del body de la petición
    const { text, sessionId, userId } = req.body;
    
    // Validación básica
    if (!text || text.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'PiPa necesita que le escribas algo 🐱',
        message: 'El texto no puede estar vacío'
      });
    }

    // Generar sessionId si no se proporciona
    const currentSessionId = sessionId || uuidv4();
    const currentUserId = userId || 'anonymous';

    // Log para debugging (veremos qué recibe el servidor)
    console.log('📝 PiPa recibió:', {
      texto: text,
      longitud: text.length,
      sessionId: currentSessionId,
      userId: currentUserId,
      timestamp: new Date().toISOString()
    });

    // Enviar mensaje a OpenAI y obtener respuesta de PiPa
    const pipaResponse = await chatWithPiPa(text, currentSessionId, currentUserId);

    // Respuesta exitosa
    res.json({
      success: true,
      message: '¡PiPa respondió exitosamente! 🐾',
      data: {
        receivedText: text,
        pipaResponse: pipaResponse,
        sessionId: currentSessionId,
        timestamp: new Date().toISOString(),
        characterCount: text.length
      }
    });

  } catch (error) {
    // Manejo de errores
    console.error('❌ Error en /api/pipa:', error);
    res.status(500).json({
      success: false,
      error: 'PiPa tuvo un problema interno 😿',
      message: error.message
    });
  }
});

// GET /api/pipa/history - Obtener historial de conversaciones
router.get('/pipa/history/:sessionId?', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { userId = 'anonymous', limit = 20 } = req.query;

    const history = await getConversationHistory(userId, sessionId, parseInt(limit));

    res.json({
      success: true,
      data: {
        conversations: history,
        total: history.length,
        sessionId: sessionId || null,
        userId: userId
      }
    });

  } catch (error) {
    console.error('❌ Error obteniendo historial:', error);
    res.status(500).json({
      success: false,
      error: 'Error obteniendo historial de conversaciones',
      message: error.message
    });
  }
});

// GET /api/pipa/info - Información del sistema
router.get('/pipa/info', async (req, res) => {
  try {
    const openaiStatus = await testOpenAIConnection();
    const supabaseStatus = await testSupabaseConnection();

    res.json({
      success: true,
      data: {
        service: 'PiPa Chat API',
        version: '3.0.0',
        openai: openaiStatus,
        supabase: {
          connected: supabaseStatus,
          table: process.env.SUPABASE_CONVERSATIONS_TABLE || 'P35_conversations_pipa'
        },
        features: {
          conversationalMemory: true,
          threadManagement: true,
          supabaseIntegration: true,
          errorHandling: true
        },
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('❌ Error en info:', error);
    res.status(500).json({
      success: false,
      error: 'Error obteniendo información del sistema',
      message: error.message
    });
  }
});

export default router;

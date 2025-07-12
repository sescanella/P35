import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import chatRoutes from './api/routes/chat.js'; // ← Ajustar la ruta de importación
import { OpenAI } from 'openai';
import path from 'path';
import { fileURLToPath } from 'url';

// Para ES modules - obtener __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Cargar variables de entorno
dotenv.config();

// Inicializar OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY // Asegúrate de que la clave API esté definida
});

// Crear la aplicación Express
const app = express();
const PORT = process.env.PORT || 3001;

// Middlewares (software que se ejecuta entre petición y respuesta)
app.use(cors()); // Permite que el frontend (puerto 3000) hable con el backend (puerto 3001)
app.use(express.json()); // Permite recibir JSON en las peticiones

// Debug middleware
app.use((req, res, next) => {
  console.log(`🔍 ${req.method} ${req.url}`);
  next();
});

// Servir archivos estáticos del frontend
app.use(express.static(path.join(__dirname, 'dist')));

// Ruta de prueba - DEBE IR ANTES de las rutas de la API
app.get('/api/test', (req, res) => {
  console.log('📞 Ruta /api/test llamada');
  res.json({ 
    message: '¡Hola! Soy el servidor de PiPa 🐱', 
    status: 'funcionando',
    timestamp: new Date().toISOString()
  });
});

// Rutas de la API
console.log('🔧 Montando rutas en /api...');
app.use('/api', chatRoutes);

// Servir React app para todas las demás rutas
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist/index.html'));
});

// Iniciar el servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor PiPa ejecutándose en puerto ${PORT}`);
  console.log(`🐱 Frontend + Backend listos - v3`);
});

// Manejo de errores
app.use((err, req, res, next) => {
  console.error('Error en el servidor:', err);
  res.status(500).json({ 
    error: 'Algo salió mal en el servidor de PiPa 😿',
    message: err.message 
  });
});
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import chatRoutes from './routes/chat.js';

// Cargar variables de entorno
dotenv.config();

// Crear la aplicación Express
const app = express();
const PORT = process.env.PORT || 3001;

// Middlewares (software que se ejecuta entre petición y respuesta)
app.use(cors()); // Permite que el frontend (puerto 3000) hable con el backend (puerto 3001)
app.use(express.json()); // Permite recibir JSON en las peticiones

// Rutas de la API
app.use('/api', chatRoutes);

// Ruta de prueba - solo para verificar que funciona
app.get('/', (req, res) => {
  res.json({ 
    message: '¡Hola! Soy el servidor de PiPa 🐱', 
    status: 'funcionando',
    timestamp: new Date().toISOString()
  });
});

// Ruta específica para saludar a PiPa
app.get('/api/pipa', (req, res) => {
  res.json({ 
    message: '¡Miau! PiPa está lista para ayudarte 🐾',
    tips: [
      'Escríbeme sobre tus hábitos',
      'Cuéntame cómo te sientes',
      'Pregúntame lo que necesites'
    ]
  });
});

// Iniciar el servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor PiPa ejecutándose en http://localhost:${PORT}`);
  console.log(`🐱 Backend listo para recibir peticiones`);
  console.log(`📡 Frontend debería estar en http://localhost:3000`);
});

// Manejo de errores
app.use((err, req, res, next) => {
  console.error('Error en el servidor:', err);
  res.status(500).json({ 
    error: 'Algo salió mal en el servidor de PiPa 😿',
    message: err.message 
  });
});

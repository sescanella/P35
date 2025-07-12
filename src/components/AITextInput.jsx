import React, { useState } from 'react';
import { useTheme } from '../contexts/ThemeContext.jsx';

const AITextInput = () => {
  const { theme } = useTheme();
  const [isExpanded, setIsExpanded] = useState(false);
  const [text, setText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState(''); // 'success', 'error', or ''
  const [isPressed, setIsPressed] = useState(false);
  const [pipaResponse, setPipaResponse] = useState('');

  const handleSend = async () => {
    if (!text.trim() || isLoading) return;
    
    setIsLoading(true);
    setStatus('');
    setPipaResponse('');
    
    try {
      const response = await fetch('http://localhost:3001/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: text.trim() })
      });

      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success) {
        setStatus('success');
        setPipaResponse(data.data.pipaResponse || 'PiPa respondió exitosamente 🐾');
        // Limpiar el texto después del envío exitoso
        setText('');
      } else {
        throw new Error(data.error || 'Error desconocido');
      }
      
      setTimeout(() => setStatus(''), 5000); // Limpiar mensaje después de 5s
    } catch (error) {
      console.error('Error al enviar mensaje a PiPa:', error);
      setStatus('error');
      setTimeout(() => setStatus(''), 5000);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = () => {
    setText('');
    setStatus('');
    setPipaResponse('');
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      handleSend();
    }
  };

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
              🐱
            </span>
          </div>
          <h3 
            className="text-lg font-bold transition-colors duration-300"
            style={{ color: theme.text }}
          >
            Conversa con PiPa
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
          <div className="space-y-4">
            {/* Textarea con botón de limpiar */}
            <div className="relative">
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Escríbele a PiPa..."
                rows={4}
                className="w-full p-3 pr-10 rounded-lg resize-none transition-all duration-200 focus:outline-none focus:ring-2"
                style={{
                  backgroundColor: theme.secondary,
                  color: theme.text,
                  borderColor: theme.border,
                  borderWidth: '1px',
                  borderStyle: 'solid',
                  focusRingColor: theme.accent
                }}
                disabled={isLoading}
              />
              
              {/* Botón limpiar */}
              {text && (
                <button
                  onClick={handleClear}
                  className="absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center hover:scale-110 transition-all duration-200"
                  style={{
                    backgroundColor: theme.accent,
                    color: theme.accent === '#FFFFFF' ? '#000000' : '#FFFFFF'
                  }}
                  title="Limpiar texto"
                >
                  <span className="text-xs">❌</span>
                </button>
              )}
            </div>

            {/* Botón de envío retro 3D */}
            <div className="flex justify-center">
              <button
                onClick={handleSend}
                onMouseDown={() => setIsPressed(true)}
                onMouseUp={() => setIsPressed(false)}
                onMouseLeave={() => setIsPressed(false)}
                disabled={!text.trim() || isLoading}
                className={`
                  px-6 py-3 rounded-lg font-bold text-white transition-all duration-150
                  ${!text.trim() || isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:brightness-110 active:scale-95'}
                `}
                style={{
                  backgroundColor: '#228B22', // Verde clásico
                  border: `2px solid ${isPressed ? '#1e7e1e' : '#2e8b2e'}`,
                  borderTop: `2px solid ${isPressed ? '#1e7e1e' : '#3cb371'}`,
                  borderLeft: `2px solid ${isPressed ? '#1e7e1e' : '#3cb371'}`,
                  borderRight: `2px solid ${isPressed ? '#1e7e1e' : '#1e7e1e'}`,
                  borderBottom: `2px solid ${isPressed ? '#1e7e1e' : '#1e7e1e'}`,
                  boxShadow: isPressed 
                    ? 'inset 2px 2px 4px rgba(0,0,0,0.3)' 
                    : '2px 2px 6px rgba(0,0,0,0.2), inset -1px -1px 2px rgba(0,0,0,0.1)',
                  transform: isPressed ? 'translate(1px, 1px)' : 'translate(0, 0)'
                }}
              >
                <div className="flex items-center gap-2">
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Enviando...</span>
                    </>
                  ) : (
                    <>
                      <span 
                        className="text-lg transform transition-transform duration-150"
                        style={{ 
                          transform: isPressed ? 'scale(0.9)' : 'scale(1)',
                          filter: isPressed ? 'brightness(0.8)' : 'brightness(1)'
                        }}
                      >
                        🐾
                      </span>
                      <span>Enviar a PiPa</span>
                    </>
                  )}
                </div>
              </button>
            </div>

            {/* Mensajes de estado */}
            {status && (
              <div 
                className={`p-3 rounded-lg text-center font-medium transition-all duration-300 ${
                  status === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}
              >
                {status === 'success' ? (
                  <span>✅ ¡Mensaje enviado a PiPa exitosamente!</span>
                ) : (
                  <span>❌ Error al enviar mensaje. Inténtalo de nuevo.</span>
                )}
              </div>
            )}

            {/* Respuesta de PiPa */}
            {pipaResponse && (
              <div 
                className="p-4 rounded-lg border-l-4 transition-all duration-300"
                style={{
                  backgroundColor: theme.secondary,
                  borderLeftColor: '#228B22',
                  borderColor: theme.border
                }}
              >
                <div className="flex items-start gap-3">
                  <div 
                    className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: '#228B22' }}
                  >
                    <span className="text-white text-sm">🐱</span>
                  </div>
                  <div className="flex-1">
                    <div 
                      className="font-medium text-sm mb-1"
                      style={{ color: theme.accent }}
                    >
                      PiPa responde:
                    </div>
                    <div 
                      className="text-sm leading-relaxed"
                      style={{ color: theme.text }}
                    >
                      {pipaResponse}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Tip */}
            <div 
              className="text-xs text-center opacity-70"
              style={{ color: theme.textSecondary }}
            >
              💡 Tip: Usa Ctrl+Enter para enviar rápidamente
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AITextInput;

import React from 'react';
import { 
  getCurrentLocalDate, 
  getEffectiveTimezone, 
  formatLocalDate,
  getCurrentTimestamp
} from '../utils/dateUtils.js';
import { useTheme } from '../contexts/ThemeContext.jsx';

/**
 * Debug component to show timezone and date information
 * Helps verify that dates are being handled correctly
 */
const DateDebugInfo = ({ show = false }) => {
  const { theme } = useTheme();
  
  if (!show) return null;

  const currentDate = getCurrentLocalDate();
  const timezone = getEffectiveTimezone();
  const timestamp = getCurrentTimestamp();
  const oldWayDate = new Date().toISOString().split('T')[0];
  const browserTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  return (
    <div 
      className="fixed bottom-4 right-4 rounded-lg p-4 shadow-lg text-xs max-w-sm z-50 transition-all duration-300"
      style={{ 
        backgroundColor: theme.card, 
        borderColor: theme.border, 
        borderWidth: '1px', 
        borderStyle: 'solid' 
      }}
    >
      <h4 className="font-bold mb-2" style={{ color: theme.text }}>🐛 Debug Info</h4>
      <div className="space-y-1" style={{ color: theme.text }}>
        <div><strong>Zona horaria del navegador:</strong> {browserTimezone}</div>
        <div><strong>Zona horaria efectiva:</strong> {timezone}</div>
        <div><strong>Fecha actual (nueva):</strong> {currentDate}</div>
        <div><strong>Fecha actual (antigua):</strong> {oldWayDate}</div>
        <div><strong>¿Coinciden?:</strong> {currentDate === oldWayDate ? '✅ Sí' : '❌ No'}</div>
        <div><strong>Timestamp UTC:</strong> {timestamp}</div>
        <div><strong>Formateada:</strong> {formatLocalDate(currentDate, { 
          day: '2-digit', 
          month: '2-digit', 
          year: 'numeric' 
        })}</div>
      </div>
      <div className="mt-2" style={{ color: theme.textSecondary }}>
        {currentDate !== oldWayDate && (
          <div className="text-xs" style={{ color: '#dc2626' }}>
            ⚠️ Posible diferencia de zona horaria detectada
          </div>
        )}
      </div>
    </div>
  );
};

export default DateDebugInfo;

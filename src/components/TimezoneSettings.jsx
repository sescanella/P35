import React, { useState, useEffect } from 'react';
import { setUserTimezone, getEffectiveTimezone } from '../utils/dateUtils.js';
import { useTheme } from '../contexts/ThemeContext.jsx';

/**
 * Settings component for timezone preferences
 * Useful when users travel or move between timezones
 */
const TimezoneSettings = ({ onTimezoneChange }) => {
  const { theme } = useTheme();
  const [selectedTimezone, setSelectedTimezone] = useState(getEffectiveTimezone());
  const [isOpen, setIsOpen] = useState(false);

  // Common timezones for easy selection
  const commonTimezones = [
    { value: 'auto', label: '🌍 Automático (detectar del sistema)', zone: null },
    { value: 'America/Santiago', label: '🇨🇱 Santiago, Chile (UTC-3/-4)', zone: 'America/Santiago' },
    { value: 'Europe/Lisbon', label: '🇵🇹 Lisboa, Portugal (UTC+0/+1)', zone: 'Europe/Lisbon' },
    { value: 'Europe/Madrid', label: '🇪🇸 Madrid, España (UTC+1/+2)', zone: 'Europe/Madrid' },
    { value: 'America/New_York', label: '🇺🇸 Nueva York, EE.UU. (UTC-5/-4)', zone: 'America/New_York' },
    { value: 'Europe/London', label: '🇬🇧 Londres, Reino Unido (UTC+0/+1)', zone: 'Europe/London' },
    { value: 'Asia/Tokyo', label: '🇯🇵 Tokio, Japón (UTC+9)', zone: 'Asia/Tokyo' },
  ];

  useEffect(() => {
    // Load saved timezone preference from localStorage
    const savedTimezone = localStorage.getItem('habitTracker_timezone');
    if (savedTimezone && savedTimezone !== 'auto') {
      setUserTimezone(savedTimezone);
      setSelectedTimezone(savedTimezone);
    }
  }, []);

  const handleTimezoneChange = (value, zone) => {
    setSelectedTimezone(value);
    
    if (value === 'auto' || !zone) {
      // Clear user preference, use system timezone
      setUserTimezone(null);
      localStorage.removeItem('habitTracker_timezone');
    } else {
      // Set user preference
      setUserTimezone(zone);
      localStorage.setItem('habitTracker_timezone', zone);
    }
    
    // Notify parent component
    if (onTimezoneChange) {
      onTimezoneChange(zone || 'auto');
    }
    
    setIsOpen(false);
  };

  const getCurrentTimezoneInfo = () => {
    const currentZone = getEffectiveTimezone();
    const found = commonTimezones.find(tz => tz.zone === currentZone);
    return found || { 
      value: currentZone, 
      label: `🌍 ${currentZone}`, 
      zone: currentZone 
    };
  };

  const currentInfo = getCurrentTimezoneInfo();

  return (
    <div className="relative">
      {/* Timezone Selector Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 rounded-lg hover:scale-105 transition-all duration-200 text-sm border"
        style={{
          backgroundColor: theme.card,
          borderColor: theme.borderLight,
          color: theme.text
        }}
        title="Configurar zona horaria"
      >
        <span>🕐</span>
        <span className="hidden sm:inline">Zona horaria:</span>
        <span className="font-medium">{currentInfo.label.split(' ')[0]}</span>
        <span style={{ color: theme.textTertiary }}>{isOpen ? '▲' : '▼'}</span>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-80 rounded-lg shadow-lg z-50 border" style={{
          backgroundColor: theme.card,
          borderColor: theme.border
        }}>
          <div className="p-3 border-b" style={{ borderColor: theme.borderLight }}>
            <h4 className="font-semibold text-sm" style={{ color: theme.text }}>Configurar Zona Horaria</h4>
            <p className="text-xs mt-1" style={{ color: theme.textSecondary }}>
              Útil al viajar o mudarse entre países
            </p>
          </div>
          
          <div className="max-h-64 overflow-y-auto">
            {commonTimezones.map((tz) => (
              <button
                key={tz.value}
                onClick={() => handleTimezoneChange(tz.value, tz.zone)}
                className={`w-full text-left px-4 py-3 text-sm transition-colors duration-150 border-b last:border-b-0 ${
                  selectedTimezone === tz.value ? 'font-medium' : ''
                }`}
                style={{
                  backgroundColor: selectedTimezone === tz.value ? theme.secondary : 'transparent',
                  borderColor: theme.borderLight,
                  color: theme.text
                }}
                onMouseEnter={(e) => {
                  if (selectedTimezone !== tz.value) {
                    e.target.style.backgroundColor = theme.secondary;
                  }
                }}
                onMouseLeave={(e) => {
                  if (selectedTimezone !== tz.value) {
                    e.target.style.backgroundColor = 'transparent';
                  }
                }}
              >
                <div className="flex items-center justify-between">
                  <span>{tz.label}</span>
                  {selectedTimezone === tz.value && (
                    <span className="text-green-600 text-xs">✓ Activo</span>
                  )}
                </div>
              </button>
            ))}
          </div>
          
          <div className="p-3 border-t" style={{ 
            borderColor: theme.borderLight,
            backgroundColor: theme.secondary 
          }}>
            <p className="text-xs" style={{ color: theme.textSecondary }}>
              💡 <strong>Consejo:</strong> Si te mudas de Santiago a Lisboa, 
              cambia la zona horaria aquí para que los registros de hábitos 
              coincidan con tu nueva ubicación.
            </p>
          </div>
        </div>
      )}
      
      {/* Click outside to close */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};

export default TimezoneSettings;

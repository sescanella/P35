import React, { useRef } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';

ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement, Title, Tooltip, Legend, Filler);

/**
 * Gráfico de líneas moderno para el progreso de hábitos.
 * Props:
 * - data: [{ date, day_score }]
 */
const HabitChart = ({ data = [] }) => {
  const chartRef = useRef();

  // Datos de muestra si no hay datos
  const sampleData = data.length > 0 ? data : [
    { date: '2025-06-25', day_score: 15 },
    { date: '2025-06-26', day_score: 25 },
    { date: '2025-06-27', day_score: 35 },
    { date: '2025-06-28', day_score: 30 },
    { date: '2025-06-29', day_score: 40 },
    { date: '2025-06-30', day_score: 32 },
  ];

  // Gradiente para el área bajo la línea
  const getGradient = (ctx, chartArea) => {
    const gradient = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
    gradient.addColorStop(0, 'rgba(34, 197, 94, 0.3)');
    gradient.addColorStop(0.5, 'rgba(59, 130, 246, 0.2)');
    gradient.addColorStop(1, 'rgba(168, 85, 247, 0.1)');
    return gradient;
  };

  const chartData = {
    labels: sampleData.map(d => {
      const date = new Date(d.date);
      return date.toLocaleDateString('es-ES', { month: 'short', day: 'numeric' });
    }),
    datasets: [
      {
        label: 'Puntos del día',
        data: sampleData.map(d => d.day_score),
        borderColor: 'rgba(59, 130, 246, 1)',
        borderWidth: 3,
        fill: true,
        backgroundColor: ctx => {
          const chart = chartRef.current;
          if (!chart) return 'rgba(59, 130, 246, 0.1)';
          const { ctx: context, chartArea } = chart;
          if (!chartArea) return 'rgba(59, 130, 246, 0.1)';
          return getGradient(context, chartArea);
        },
        tension: 0.4,
        pointRadius: 6,
        pointHoverRadius: 8,
        pointBackgroundColor: '#ffffff',
        pointBorderColor: 'rgba(59, 130, 246, 1)',
        pointBorderWidth: 3,
        pointHoverBackgroundColor: 'rgba(59, 130, 246, 1)',
        pointHoverBorderColor: '#ffffff',
        pointHoverBorderWidth: 3,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      intersect: false,
      mode: 'index',
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        titleColor: '#1f2937',
        bodyColor: '#374151',
        borderColor: 'rgba(59, 130, 246, 0.5)',
        borderWidth: 1,
        padding: 12,
        cornerRadius: 12,
        displayColors: false,
        titleFont: { size: 14, weight: 'bold' },
        bodyFont: { size: 13 },
        callbacks: {
          title: (items) => `📅 ${items[0].label}`,
          label: (item) => `⭐ ${item.parsed.y} puntos`,
        },
      },
    },
    scales: {
      x: {
        display: true,
        grid: {
          display: false,
        },
        ticks: {
          color: '#6b7280',
          font: { size: 12, weight: '500' },
          padding: 8,
        },
      },
      y: {
        display: true,
        beginAtZero: true,
        grid: {
          color: 'rgba(156, 163, 175, 0.1)',
          lineWidth: 1,
        },
        ticks: {
          color: '#6b7280',
          font: { size: 12, weight: '500' },
          padding: 8,
          callback: function(value) {
            return value + ' pts';
          }
        },
      },
    },
    elements: {
      line: {
        borderJoinStyle: 'round',
        borderCapStyle: 'round',
      },
    },
  };

  const maxScore = Math.max(...sampleData.map(d => d.day_score));
  const avgScore = Math.round(sampleData.reduce((sum, d) => sum + d.day_score, 0) / sampleData.length);

  return (
    <div className="space-y-4">
      {/* Estadísticas rápidas */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white border border-gray-300 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-black">{maxScore}</div>
          <div className="text-xs text-gray-600">Mejor día</div>
        </div>
        <div className="bg-white border border-gray-300 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-black">{avgScore}</div>
          <div className="text-xs text-gray-600">Promedio</div>
        </div>
      </div>

      {/* Gráfico */}
      <div className="bg-white border border-gray-300 rounded-2xl p-4">
        <h3 className="text-lg font-semibold text-black mb-4 text-center">
          📈 Últimos 7 días
        </h3>
        <div style={{ height: 200 }}>
          <Line ref={chartRef} data={chartData} options={options} />
        </div>
      </div>
    </div>
  );
};

export default HabitChart;

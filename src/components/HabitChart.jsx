import React, { useState, useMemo } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement, Title, Tooltip, Legend);

const HabitChart = ({ habits = [], tracking = [] }) => {
  const [mode, setMode] = useState('daily'); // 'daily' or 'habits'

  // Helper function to get last 21 days
  const getLast21Days = () => {
    const days = [];
    for (let i = 20; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      days.push(date.toISOString().split('T')[0]);
    }
    return days;
  };

  // Helper function to calculate streak for a habit
  const calculateStreak = (habitId) => {
    const today = new Date().toISOString().split('T')[0];
    let streak = 0;
    let currentDate = new Date();
    
    while (true) {
      const dateStr = currentDate.toISOString().split('T')[0];
      const completed = tracking.some(t => 
        t.habit_id === habitId && 
        t.date === dateStr && 
        t.completed
      );
      
      if (completed) {
        streak++;
        currentDate.setDate(currentDate.getDate() - 1);
      } else {
        break;
      }
    }
    
    return streak;
  };

  // Process daily mode data
  const dailyData = useMemo(() => {
    const last21Days = getLast21Days();
    
    return last21Days.map(date => {
      const dayTracking = tracking.filter(t => t.date === date);
      const completedHabits = dayTracking.filter(t => t.completed);
      const dayScore = completedHabits.reduce((total, t) => {
        const habit = habits.find(h => h.id === t.habit_id);
        return total + (habit?.score || 0);
      }, 0);
      
      return {
        date,
        day_score: dayScore
      };
    });
  }, [habits, tracking]);

  // Process habits mode data
  const habitsData = useMemo(() => {
    const last21Days = getLast21Days();
    
    return habits.map(habit => {
      const weekData = last21Days.map(date => {
        const completed = tracking.some(t => 
          t.habit_id === habit.id && 
          t.date === date && 
          t.completed
        );
        return { date, habit_daily_score: completed ? habit.score : 0 };
      });
      
      const completedDays = weekData.filter(d => d.habit_daily_score > 0).length;
      const percentage = Math.round((completedDays / 21) * 100);
      const streak = calculateStreak(habit.id);
      
      return {
        ...habit,
        weekData,
        completedDays,
        percentage,
        streak
      };
    });
  }, [habits, tracking]);

  // Chart configuration for daily mode
  const dailyChartData = {
    labels: dailyData.map(d => {
      const date = new Date(d.date);
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }),
    datasets: [
      {
        label: 'Daily Score',
        data: dailyData.map(d => d.day_score),
        borderColor: '#E22028',
        backgroundColor: 'transparent',
        borderWidth: 4,
        fill: false,
        tension: 0.3,
        pointRadius: 3,
        pointHoverRadius: 5,
        pointBackgroundColor: '#ffffff',
        pointBorderColor: '#E22028',
        pointBorderWidth: 2,
      }
    ]
  };

  // Chart configuration for habits mode
  const habitsChartData = {
    labels: getLast21Days().map(date => {
      const d = new Date(date);
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }),
    datasets: habitsData.map((habit, index) => ({
      label: habit.name,
      data: habit.weekData.map(d => d.habit_daily_score),
      borderColor: habit.color || '#000000',
      backgroundColor: 'transparent',
      borderWidth: 4,
      fill: false,
      tension: 0.3,
      pointRadius: 3,
      pointHoverRadius: 5,
      pointBackgroundColor: '#ffffff',
      pointBorderColor: habit.color || '#000000',
      pointBorderWidth: 2,
    }))
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      intersect: false,
      mode: 'index',
    },
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        titleColor: '#000000',
        bodyColor: '#000000',
        borderColor: '#000000',
        borderWidth: 1,
        padding: 12,
        cornerRadius: 8,
        displayColors: mode === 'habits',
        titleFont: { size: 14, weight: 'bold' },
        bodyFont: { size: 13 },
        callbacks: {
          title: (items) => {
            const dayIndex = items[0].dataIndex;
            const date = new Date(getLast21Days()[dayIndex]);
            return `📅 ${date.toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}`;
          },
          label: (item) => {
            if (mode === 'daily') {
              const dayData = dailyData[item.dataIndex];
              return `⭐ ${dayData.day_score} points`;
            } else {
              const habit = habitsData.find(h => h.name === item.dataset.label);
              const score = habit?.score || 0;
              return `🏋️ ${habit?.name || item.dataset.label}: ${item.parsed.y ? score : 0} pts`;
            }
          }
        }
      }
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: {
          color: '#666666',
          font: { size: 12 }
        }
      },
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
          lineWidth: 1
        },
        ticks: {
          color: '#666666',
          font: { size: 12 },
          callback: function(value) {
            return value + ' pts';
          }
        }
      }
    }
  };

  // Calculate stats for daily mode
  const bestDay = dailyData.length > 0 
    ? Math.max(...dailyData.map(d => d.day_score))
    : 0;
  const averageDailyScore = dailyData.length > 0 
    ? Math.round(dailyData.reduce((sum, d) => sum + d.day_score, 0) / dailyData.length)
    : 0;

  return (
    <div className="space-y-6">
      {/* Mode Toggle */}
      <div className="flex justify-center">
        <div className="bg-white rounded-lg p-1 flex" style={{ borderColor: '#1C1C1E', borderWidth: '1px', borderStyle: 'solid' }}>
          <button
            onClick={() => setMode('daily')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 hover:scale-105 ${
              mode === 'daily'
                ? 'text-white'
                : 'text-black hover:bg-gray-100'
            }`}
            style={mode === 'daily' ? { backgroundColor: '#1C1C1E' } : {}}
          >
            Daily View
          </button>
          <button
            onClick={() => setMode('habits')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 hover:scale-105 ${
              mode === 'habits'
                ? 'text-white'
                : 'text-black hover:bg-gray-100'
            }`}
            style={mode === 'habits' ? { backgroundColor: '#1C1C1E' } : {}}
          >
            Habits View
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      {mode === 'daily' && (
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white border border-black rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-black">{bestDay}</div>
            <div className="text-sm text-gray-600">Best day</div>
          </div>
          <div className="bg-white border border-black rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-black">{averageDailyScore}</div>
            <div className="text-sm text-gray-600">Average daily score</div>
          </div>
        </div>
      )}

      {/* Habits Mode: Streak Cards (now above the chart) */}
      {mode === 'habits' && habitsData.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
          {habitsData.map(habit => (
            <div
              key={habit.id}
              className="bg-gray-50 border border-black rounded-lg p-3 text-center shadow-sm hover:shadow-md transition-shadow duration-200 flex flex-col items-center"
            >
              <div className="font-bold text-xs text-black mb-1 tracking-wide uppercase truncate w-full">
                {habit.name}
              </div>
              <div className="flex flex-col items-center justify-center flex-1">
                <span className="text-2xl font-extrabold text-black leading-tight mb-0.5">
                  {habit.streak}
                </span>
                <span className="text-xs font-semibold text-gray-700 tracking-wider uppercase">days</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Chart */}
      <div className="bg-white border border-black rounded-lg p-6">
        <h3 className="text-lg font-semibold text-black mb-4 text-center">
          {mode === 'daily' ? 'Daily Completion Rate' : '📈 Individual Habit Progress'}
        </h3>
        <div style={{ height: mode === 'habits' ? 300 : 250 }}>
          <Line 
            data={mode === 'daily' ? dailyChartData : habitsChartData} 
            options={chartOptions} 
          />
        </div>
      </div>
    </div>
  );
};

export default HabitChart;

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
import { getLastNDays, createLocalDate, getCurrentLocalDate, addDays } from '../utils/dateUtils.js';
import { useTheme } from '../contexts/ThemeContext.jsx';

ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement, Title, Tooltip, Legend);

const HabitChart = ({ habits = [], tracking = [] }) => {
  const [mode, setMode] = useState('daily'); // 'daily' or 'habits'
  const { theme } = useTheme();

  // Helper function to get last 21 days using timezone-safe utility
  const getLast21Days = () => {
    return getLastNDays(21);
  };

  // Helper function to calculate streak for a habit
  const calculateStreak = (habitId) => {
    let streak = 0;
    // Start from yesterday and work backwards to avoid requiring today to be completed
    let checkDate = addDays(getCurrentLocalDate(), -1);
    
    while (true) {
      const completed = tracking.some(t => 
        t.habit_id === habitId && 
        t.date === checkDate && 
        t.completed
      );
      
      if (completed) {
        streak++;
        // Move to previous day using timezone-safe method
        checkDate = addDays(checkDate, -1);
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
      const date = createLocalDate(d.date);
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
        pointBackgroundColor: theme.chartBackground,
        pointBorderColor: '#E22028',
        pointBorderWidth: 2,
      }
    ]
  };

  // Chart configuration for habits mode
  const habitsChartData = {
    labels: getLast21Days().map(date => {
      const d = createLocalDate(date);
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }),
    datasets: habitsData.map((habit, index) => ({
      label: habit.name,
      data: habit.weekData.map(d => d.habit_daily_score),
      borderColor: habit.color || theme.text,
      backgroundColor: 'transparent',
      borderWidth: 3,
      fill: false,
      tension: 0.3,
      pointRadius: 3,
      pointHoverRadius: 5,
      pointBackgroundColor: theme.chartBackground,
      pointBorderColor: habit.color || theme.text,
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
        backgroundColor: theme.card,
        titleColor: theme.text,
        bodyColor: theme.text,
        borderColor: theme.border,
        borderWidth: 1,
        padding: 12,
        cornerRadius: 8,
        displayColors: mode === 'habits',
        titleFont: { size: 14, weight: 'bold' },
        bodyFont: { size: 13 },
        callbacks: {
          title: (items) => {
            const dayIndex = items[0].dataIndex;
            const date = createLocalDate(getLast21Days()[dayIndex]);
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
          color: theme.chartText,
          font: { size: 12 }
        }
      },
      y: {
        beginAtZero: true,
        grid: {
          color: theme.chartGrid,
          lineWidth: 1
        },
        ticks: {
          color: theme.chartText,
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
        <div 
          className="rounded-lg p-1 flex transition-all duration-300" 
          style={{ 
            backgroundColor: theme.card, 
            borderColor: theme.border, 
            borderWidth: '1px', 
            borderStyle: 'solid' 
          }}
        >
          <button
            onClick={() => setMode('daily')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 hover:scale-105`}
            style={{
              backgroundColor: mode === 'daily' ? theme.accent : 'transparent',
              color: mode === 'daily' ? (theme.accent === '#FFFFFF' ? '#000000' : '#FFFFFF') : theme.text
            }}
          >
            Daily View
          </button>
          <button
            onClick={() => setMode('habits')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 hover:scale-105`}
            style={{
              backgroundColor: mode === 'habits' ? theme.accent : 'transparent',
              color: mode === 'habits' ? (theme.accent === '#FFFFFF' ? '#000000' : '#FFFFFF') : theme.text
            }}
          >
            Habits View
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      {mode === 'daily' && (
        <div className="grid grid-cols-2 gap-4">
          <div 
            className="rounded-lg p-4 text-center transition-all duration-300"
            style={{ 
              backgroundColor: theme.card, 
              borderColor: theme.cardBorder, 
              borderWidth: '1px', 
              borderStyle: 'solid' 
            }}
          >
            <div className="text-2xl font-bold" style={{ color: theme.text }}>{bestDay}</div>
            <div className="text-sm" style={{ color: theme.textSecondary }}>Best day</div>
          </div>
          <div 
            className="rounded-lg p-4 text-center transition-all duration-300"
            style={{ 
              backgroundColor: theme.card, 
              borderColor: theme.cardBorder, 
              borderWidth: '1px', 
              borderStyle: 'solid' 
            }}
          >
            <div className="text-2xl font-bold" style={{ color: theme.text }}>{averageDailyScore}</div>
            <div className="text-sm" style={{ color: theme.textSecondary }}>Average daily score</div>
          </div>
        </div>
      )}

      {/* Habits Mode: Streak Cards (now above the chart) */}
      {mode === 'habits' && habitsData.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
          {habitsData.map(habit => (
            <div
              key={habit.id}
              className="rounded-lg p-3 text-center shadow-sm hover:shadow-md transition-all duration-300 flex flex-col items-center"
              style={{ 
                backgroundColor: theme.secondary, 
                borderColor: theme.cardBorder, 
                borderWidth: '1px', 
                borderStyle: 'solid' 
              }}
            >
              <div 
                className="font-bold text-xs mb-1 tracking-wide uppercase truncate w-full"
                style={{ color: theme.text }}
              >
                {habit.name}
              </div>
              <div className="flex flex-col items-center justify-center flex-1">
                <span 
                  className="text-2xl font-extrabold leading-tight mb-0.5"
                  style={{ color: theme.text }}
                >
                  {habit.streak}
                </span>
                <span 
                  className="text-xs font-semibold tracking-wider uppercase"
                  style={{ color: theme.textSecondary }}
                >
                  days
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Chart */}
      <div 
        className="rounded-lg p-6 transition-all duration-300"
        style={{ 
          backgroundColor: theme.chartBackground, 
          borderColor: theme.cardBorder, 
          borderWidth: '1px', 
          borderStyle: 'solid' 
        }}
      >
        <h3 
          className="text-lg font-semibold mb-4 text-center"
          style={{ color: theme.text }}
        >
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

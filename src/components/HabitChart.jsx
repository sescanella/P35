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
import annotationPlugin from 'chartjs-plugin-annotation';
import { getLastNDays, createLocalDate, getCurrentLocalDate, addDays } from '../utils/dateUtils.js';
import { useTheme } from '../contexts/ThemeContext.jsx';

ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement, Title, Tooltip, Legend, annotationPlugin);

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
      
      // Get list of completed habit names for this day
      const completedHabitNames = completedHabits.map(t => {
        const habit = habits.find(h => h.id === t.habit_id);
        return habit?.name || 'Unknown Habit';
      });
      
      return {
        date,
        day_score: dayScore,
        completed_habits: completedHabitNames
      };
    });
  }, [habits, tracking]);

  // Helper function to get chart annotations (month labels + reference lines)
  const getChartAnnotations = useMemo(() => {
    const last21Days = getLast21Days();
    const annotations = {};
    
    // Get today's date to identify current month
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    const currentMonthKey = `${currentYear}-${currentMonth}`;
    const currentMonthName = today.toLocaleDateString('en-US', { month: 'long' });
    
    // Track month changes for separator lines
    let previousMonth = null;
    let currentMonthDays = [];
    
    last21Days.forEach((date, index) => {
      const dateObj = createLocalDate(date);
      const month = dateObj.getMonth();
      const year = dateObj.getFullYear();
      const monthKey = `${year}-${month}`;
      
      // Add separator line when month changes (but not at the beginning)
      if (previousMonth !== null && monthKey !== previousMonth) {
        const lineIntensity = theme.isDark ? 0.25 : 0.4;
        annotations[`monthLine_${index}`] = {
          type: 'line',
          xMin: index - 0.5,
          xMax: index - 0.5,
          yMin: '75%',
          yMax: '100%',
          borderColor: `rgba(${theme.isDark ? '255,255,255' : '100,100,100'}, ${lineIntensity})`,
          borderWidth: 1,
          borderDash: [3, 3]
        };
      }
      
      // Collect days that belong to current month
      if (monthKey === currentMonthKey) {
        currentMonthDays.push(index);
      }
      
      previousMonth = monthKey;
    });
    
    // Only show label for current month if it has days in the chart
    if (currentMonthDays.length > 0) {
      // Calculate center position of current month days
      const firstDay = currentMonthDays[0];
      const lastDay = currentMonthDays[currentMonthDays.length - 1];
      const centerPosition = firstDay + (lastDay - firstDay) / 2;
      
      // If current month spans most of the chart (single month view)
      if (currentMonthDays.length >= 15) {
        annotations.currentMonth = {
          type: 'label',
          backgroundColor: 'transparent',
          color: theme.textSecondary,
          content: currentMonthName,
          font: {
            size: 11,
            weight: '500'
          },
          position: {
            x: 'start',
            y: 'center'
          },
          xAdjust: -35,
          yAdjust: 0
        };
      } else {
        // Multiple months view - show current month label in chart
        annotations.currentMonth = {
          type: 'label',
          backgroundColor: 'transparent',
          color: theme.textSecondary,
          content: currentMonthName,
          font: {
            size: 10,
            weight: '500'
          },
          position: {
            x: centerPosition,
            y: '90%'
          },
          xAdjust: 0,
          yAdjust: 0
        };
      }
    }

    // Add reference lines only in daily mode (no labels - they will be rendered as HTML)
    if (mode === 'daily' && dailyData.length > 0) {
      // No labels here - they will be rendered as HTML elements
    }
    
    return annotations;
  }, [theme, mode, dailyData]);

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
      const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
      const dayNumber = date.getDate();
      return `${dayName} ${dayNumber}`;
    }),
    datasets: (() => {
      const datasets = [];
      
      // Calculate reference values
      const bestDayValue = Math.max(...dailyData.map(d => d.day_score));
      const averageValue = Math.round(dailyData.reduce((sum, d) => sum + d.day_score, 0) / dailyData.length);
      
      // Add Best Day line as dataset (behind main line)
      if (bestDayValue > 0) {
        datasets.push({
          label: 'Best Day Reference',
          data: dailyData.map(() => bestDayValue),
          borderColor: theme.isDark ? '#10B981' : '#059669',
          backgroundColor: 'transparent',
          borderWidth: 2,
          fill: false,
          tension: 0,
          order: 2, // Higher order = behind
          pointRadius: 0, // No points
          pointHoverRadius: 0,
          borderDash: [],
        });
      }
      
      // Add Average line as dataset (behind main line)
      if (averageValue > 0) {
        datasets.push({
          label: 'Average Reference',
          data: dailyData.map(() => averageValue),
          borderColor: theme.isDark ? '#3B82F6' : '#2563EB',
          backgroundColor: 'transparent',
          borderWidth: 2,
          fill: false,
          tension: 0,
          order: 2, // Higher order = behind
          pointRadius: 0, // No points
          pointHoverRadius: 0,
          borderDash: [5, 5],
        });
      }
      
      // Add main data line (in front)
      datasets.push({
        label: 'Daily Score',
        data: dailyData.map(d => d.day_score),
        borderColor: '#E22028',
        backgroundColor: 'transparent',
        borderWidth: 4,
        fill: false,
        tension: 0.3,
        order: 0, // Lowest order = in front
        pointRadius: 3, // Uniform small size for all points
        pointHoverRadius: 5,
        pointBackgroundColor: theme.chartBackground,
        pointBorderColor: '#E22028',
        pointBorderWidth: 2,
        pointStyle: dailyData.map((d, index) => {
          // Calculate metrics for comparison
          const bestDayValue = Math.max(...dailyData.map(item => item.day_score));
          const averageValue = dailyData.reduce((sum, item) => sum + item.day_score, 0) / dailyData.length;
          
          // Return emoji for special achievements
          if (d.day_score === bestDayValue && bestDayValue > 0) {
            return '🏆';
          } else if (d.day_score > averageValue && averageValue > 0) {
            return '⭐';
          }
          return 'circle';
        }),
      });
      
      return datasets;
    })()
  };

  // Chart configuration for habits mode
  const habitsChartData = {
    labels: getLast21Days().map(date => {
      const d = createLocalDate(date);
      const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
      const dayNumber = d.getDate();
      return `${dayName} ${dayNumber}`;
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
      annotation: {
        annotations: getChartAnnotations
      },
      tooltip: {
        backgroundColor: theme.card,
        titleColor: theme.text,
        bodyColor: theme.text,
        borderColor: theme.border,
        borderWidth: 1,
        padding: 12,
        cornerRadius: 8,
        displayColors: false, // Hide color boxes for cleaner look
        titleFont: { size: 14, weight: 'bold' },
        bodyFont: { size: 13 },
        filter: function(tooltipItem) {
          // In daily mode, only show tooltip for the main data line
          if (mode === 'daily') {
            return tooltipItem.dataset.label === 'Daily Score';
          }
          return true; // Show all tooltips in habits mode
        },
        callbacks: {
          title: (items) => {
            const dayIndex = items[0].dataIndex;
            const date = createLocalDate(getLast21Days()[dayIndex]);
            return `📅 ${date.toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}`;
          },
          label: (item) => {
            if (mode === 'daily') {
              // Only show tooltip for the main data line (Daily Score), hide for reference lines
              if (item.dataset.label !== 'Daily Score') {
                return null; // Hide tooltip for Best Day and Average reference lines
              }
              
              const dayData = dailyData[item.dataIndex];
              const bestDayValue = Math.max(...dailyData.map(d => d.day_score));
              const averageValue = Math.round(dailyData.reduce((sum, d) => sum + d.day_score, 0) / dailyData.length);
              
              let statusText = '';
              if (dayData.day_score === bestDayValue && bestDayValue > 0) {
                statusText = ' 🏆 Best Day!';
              } else if (dayData.day_score > averageValue && averageValue > 0) {
                statusText = ' ⭐ Above Average';
              }
              
              // Create tooltip lines
              const tooltipLines = [];
              
              // Add score line
              tooltipLines.push(`💪 ${dayData.day_score} points${statusText}`);
              
              // Add completed habits
              dayData.completed_habits.forEach(habitName => {
                tooltipLines.push(`✅ ${habitName}`);
              });
              
              // If no habits completed, show message
              if (dayData.completed_habits.length === 0) {
                tooltipLines.push('😴 No habits completed');
              }
              
              return tooltipLines;
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

      {/* Stats Cards - Only show in Habits mode */}
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
        
        {/* Reference Lines Labels - Between title and chart */}
        {mode === 'daily' && dailyData.length > 0 && (() => {
          const bestDayValue = Math.max(...dailyData.map(d => d.day_score));
          const averageValue = Math.round(dailyData.reduce((sum, d) => sum + d.day_score, 0) / dailyData.length);
          
          return (
            <div className="flex justify-center gap-6 mb-4">
              {bestDayValue > 0 && (
                <div 
                  className="px-3 py-2 rounded-lg text-sm font-semibold flex items-center gap-2"
                  style={{
                    backgroundColor: theme.isDark ? 'rgba(16, 185, 129, 0.15)' : 'rgba(5, 150, 105, 0.15)',
                    color: theme.isDark ? '#10B981' : '#059669',
                    border: `1px solid ${theme.isDark ? '#10B981' : '#059669'}`,
                  }}
                >
                  <div 
                    className="w-4 h-0.5"
                    style={{ backgroundColor: theme.isDark ? '#10B981' : '#059669' }}
                  />
                  🏆 Best Day: {bestDayValue} pts
                </div>
              )}
              
              {averageValue > 0 && (
                <div 
                  className="px-3 py-2 rounded-lg text-sm font-semibold flex items-center gap-2"
                  style={{
                    backgroundColor: theme.isDark ? 'rgba(59, 130, 246, 0.15)' : 'rgba(37, 99, 235, 0.15)',
                    color: theme.isDark ? '#3B82F6' : '#2563EB',
                    border: `1px solid ${theme.isDark ? '#3B82F6' : '#2563EB'}`,
                  }}
                >
                  <div 
                    className="w-4 h-0.5 border-t-2 border-dashed"
                    style={{ borderColor: theme.isDark ? '#3B82F6' : '#2563EB' }}
                  />
                  ⭐ Average: {averageValue} pts
                </div>
              )}
            </div>
          );
        })()}
        
        <div className="relative">
          {/* Chart */}
          <div style={{ height: mode === 'habits' ? 300 : 250 }}>
            <Line 
              data={mode === 'daily' ? dailyChartData : habitsChartData} 
              options={chartOptions} 
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default HabitChart;

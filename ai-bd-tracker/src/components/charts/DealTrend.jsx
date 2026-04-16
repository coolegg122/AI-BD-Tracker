import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useTheme } from '../../context/ThemeContext';

const data = [
  { month: 'Apr', deals: 4, intelligence: 10 },
  { month: 'May', deals: 3, intelligence: 15 },
  { month: 'Jun', deals: 7, intelligence: 22 },
  { month: 'Jul', deals: 5, intelligence: 30 },
  { month: 'Aug', deals: 9, intelligence: 45 },
  { month: 'Sep', deals: 12, intelligence: 58 },
  { month: 'Oct', deals: 15, intelligence: 72 }
];

export default function DealTrend() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
        >
          <defs>
            <linearGradient id="colorDeals" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={isDark ? '#60a5fa' : '#2563eb'} stopOpacity={0.4}/>
              <stop offset="95%" stopColor={isDark ? '#60a5fa' : '#2563eb'} stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="colorIntel" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#f97316" stopOpacity={0.4}/>
              <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDark ? '#334155' : '#f1f5f9'} />
          <XAxis 
            dataKey="month" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fontSize: 11, fontWeight: 600, fill: isDark ? '#94a3b8' : '#64748b' }} 
          />
          <YAxis 
            axisLine={false} 
            tickLine={false} 
            tick={{ fontSize: 11, fontWeight: 600, fill: isDark ? '#94a3b8' : '#64748b' }} 
          />
          <Tooltip 
            contentStyle={{ 
                backgroundColor: isDark ? '#1e293b' : '#ffffff',
                borderRadius: '12px', 
                border: isDark ? '1px solid #334155' : 'none', 
                boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                fontSize: '12px',
                fontWeight: 'bold',
                color: isDark ? '#f1f5f9' : '#0f172a'
              }}
              itemStyle={{ color: isDark ? '#f1f5f9' : '#0f172a' }}
          />
          <Area 
            type="monotone" 
            dataKey="deals" 
            stroke={isDark ? '#60a5fa' : '#2563eb'} 
            fillOpacity={1} 
            fill="url(#colorDeals)" 
            strokeWidth={3}
          />
          <Area 
            type="monotone" 
            dataKey="intelligence" 
            stroke="#f97316" 
            fillOpacity={1} 
            fill="url(#colorIntel)" 
            strokeWidth={3}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { useTheme } from '../../context/ThemeContext';

const STAGE_COLORS = {
  'Initial Contact': '#94a3b8', // slate-400
  'CDA Signed': '#6366f1',    // indigo-500
  'Due Diligence': '#f97316',  // orange-500
  'Term Sheet': '#2563eb',     // blue-600
  'Negotiation': '#1e40af'     // blue-800
};

export default function DealFunnel({ deals }) {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // Aggregate data by stage
  const stageData = [
    { name: 'Initial Contact', count: 0 },
    { name: 'CDA Signed', count: 0 },
    { name: 'Due Diligence', count: 0 },
    { name: 'Term Sheet', count: 0 },
    { name: 'Negotiation', count: 0 }
  ];

  deals.forEach(p => {
    const entry = stageData.find(d => d.name === p.stage);
    if (entry) entry.count += 1;
  });

  const handleClick = (data) => {
    if (data && data.name) {
      // In a real app, we'd pass state or query params. 
      // For now, let's navigate to the pipeline page.
      navigate('/pipeline');
    }
  };

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={stageData}
          layout="vertical"
          margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
          onClick={(data) => {
            if (data && data.activePayload) {
              handleClick(data.activePayload[0].payload);
            }
          }}
        >
          <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke={isDark ? '#334155' : '#f1f5f9'} />
          <XAxis type="number" hide />
          <YAxis 
            dataKey="name" 
            type="category" 
            tick={{ fontSize: 11, fontWeight: 600, fill: isDark ? '#94a3b8' : '#64748b' }}
            width={100}
          />
          <Tooltip 
            cursor={{ fill: isDark ? 'rgba(255,255,255,0.05)' : '#f8fafc' }}
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
          <Bar 
            dataKey="count" 
            radius={[0, 4, 4, 0]} 
            barSize={24}
            className="cursor-pointer"
          >
            {stageData.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={STAGE_COLORS[entry.name] || (isDark ? '#475569' : '#cbd5e1')} 
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

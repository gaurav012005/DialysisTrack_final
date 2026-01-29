import React from 'react';

// Simple Chart Components using CSS and SVG
export const LineChart = ({ data, title, color = '#3B82F6' }) => {
  const maxValue = Math.max(...data.map(d => d.value));
  const points = data.map((d, i) => {
    const x = (i / (data.length - 1)) * 300;
    const y = 150 - (d.value / maxValue) * 120;
    return `${x},${y}`;
  }).join(' ');

  return (
    <div className="bg-white p-4 rounded-lg border">
      <h3 className="text-lg font-semibold mb-4">{title}</h3>
      <svg width="300" height="150" className="w-full">
        <polyline
          fill="none"
          stroke={color}
          strokeWidth="2"
          points={points}
        />
        {data.map((d, i) => {
          const x = (i / (data.length - 1)) * 300;
          const y = 150 - (d.value / maxValue) * 120;
          return (
            <circle
              key={i}
              cx={x}
              cy={y}
              r="4"
              fill={color}
            />
          );
        })}
      </svg>
      <div className="flex justify-between text-xs text-gray-500 mt-2">
        {data.map((d, i) => (
          <span key={i}>{d.label}</span>
        ))}
      </div>
    </div>
  );
};

export const BarChart = ({ data, title, color = '#10B981' }) => {
  const maxValue = Math.max(...data.map(d => d.value));
  
  return (
    <div className="bg-white p-4 rounded-lg border">
      <h3 className="text-lg font-semibold mb-4">{title}</h3>
      <div className="flex items-end justify-between h-32 space-x-2">
        {data.map((d, i) => {
          const height = (d.value / maxValue) * 100;
          return (
            <div key={i} className="flex flex-col items-center flex-1">
              <div className="text-xs text-gray-600 mb-1">{d.value}</div>
              <div
                className="w-full rounded-t"
                style={{
                  height: `${height}%`,
                  backgroundColor: color,
                  minHeight: '4px'
                }}
              />
              <div className="text-xs text-gray-500 mt-1 text-center">{d.label}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export const PieChart = ({ data, title }) => {
  const total = data.reduce((sum, d) => sum + d.value, 0);
  let currentAngle = 0;
  
  const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];
  
  return (
    <div className="bg-white p-4 rounded-lg border">
      <h3 className="text-lg font-semibold mb-4">{title}</h3>
      <div className="flex items-center">
        <svg width="120" height="120" className="mr-4">
          <circle cx="60" cy="60" r="50" fill="#f3f4f6" />
          {data.map((d, i) => {
            const angle = (d.value / total) * 360;
            const startAngle = currentAngle;
            const endAngle = currentAngle + angle;
            currentAngle += angle;
            
            const x1 = 60 + 50 * Math.cos((startAngle - 90) * Math.PI / 180);
            const y1 = 60 + 50 * Math.sin((startAngle - 90) * Math.PI / 180);
            const x2 = 60 + 50 * Math.cos((endAngle - 90) * Math.PI / 180);
            const y2 = 60 + 50 * Math.sin((endAngle - 90) * Math.PI / 180);
            
            const largeArcFlag = angle > 180 ? 1 : 0;
            
            return (
              <path
                key={i}
                d={`M 60 60 L ${x1} ${y1} A 50 50 0 ${largeArcFlag} 1 ${x2} ${y2} Z`}
                fill={colors[i % colors.length]}
              />
            );
          })}
        </svg>
        <div className="space-y-2">
          {data.map((d, i) => (
            <div key={i} className="flex items-center text-sm">
              <div
                className="w-3 h-3 rounded mr-2"
                style={{ backgroundColor: colors[i % colors.length] }}
              />
              <span>{d.label}: {d.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
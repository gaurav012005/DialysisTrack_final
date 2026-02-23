import React from 'react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// Reusable Line Chart Component
export const TrendLineChart = ({ data, dataKey, title, color = "#0891b2", height = 300 }) => {
  return (
    <div className="w-full">
      {title && <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">{title}</h3>}
      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:stroke-gray-700" />
          <XAxis
            dataKey="name"
            stroke="#6b7280"
            className="dark:stroke-gray-400"
          />
          <YAxis
            stroke="#6b7280"
            className="dark:stroke-gray-400"
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'var(--bg-primary)',
              border: '1px solid var(--border-primary)',
              borderRadius: '0.5rem'
            }}
            labelStyle={{ color: 'var(--text-primary)' }}
          />
          <Legend />
          <Line
            type="monotone"
            dataKey={dataKey}
            stroke={color}
            strokeWidth={2}
            dot={{ fill: color, r: 4 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

// Reusable Bar Chart Component
export const UtilizationBarChart = ({ data, dataKey, title, color = "#10b981", height = 300 }) => {
  return (
    <div className="w-full">
      {title && <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">{title}</h3>}
      <ResponsiveContainer width="100%" height={height}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:stroke-gray-700" />
          <XAxis
            dataKey="name"
            stroke="#6b7280"
            className="dark:stroke-gray-400"
          />
          <YAxis
            stroke="#6b7280"
            className="dark:stroke-gray-400"
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'var(--bg-primary)',
              border: '1px solid var(--border-primary)',
              borderRadius: '0.5rem'
            }}
            labelStyle={{ color: 'var(--text-primary)' }}
          />
          <Legend />
          <Bar
            dataKey={dataKey}
            fill={color}
            radius={[8, 8, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

// Reusable Pie Chart Component
export const DistributionPieChart = ({ data, title, height = 300 }) => {
  const COLORS = ['#0891b2', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

  return (
    <div className="w-full">
      {title && <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">{title}</h3>}
      <ResponsiveContainer width="100%" height={height}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: 'var(--bg-primary)',
              border: '1px solid var(--border-primary)',
              borderRadius: '0.5rem'
            }}
          />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

// Multi-line Chart Component
export const MultiLineChart = ({ data, lines, title, height = 300 }) => {
  const COLORS = ['#0891b2', '#10b981', '#f59e0b', '#ef4444'];

  return (
    <div className="w-full">
      {title && <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">{title}</h3>}
      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:stroke-gray-700" />
          <XAxis
            dataKey="name"
            stroke="#6b7280"
            className="dark:stroke-gray-400"
          />
          <YAxis
            stroke="#6b7280"
            className="dark:stroke-gray-400"
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'var(--bg-primary)',
              border: '1px solid var(--border-primary)',
              borderRadius: '0.5rem'
            }}
            labelStyle={{ color: 'var(--text-primary)' }}
          />
          <Legend />
          {lines.map((line, index) => (
            <Line
              key={line.dataKey}
              type="monotone"
              dataKey={line.dataKey}
              stroke={line.color || COLORS[index % COLORS.length]}
              strokeWidth={2}
              dot={{ r: 3 }}
              name={line.name || line.dataKey}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default {
  TrendLineChart,
  UtilizationBarChart,
  DistributionPieChart,
  MultiLineChart
};
import React from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';

const HistoricalChart = ({ data }) => {
  const formatXAxis = tick => {
    const d = new Date(tick);
    return `${d.getMonth() + 1}/${d.getDate()}`;
  };

  const getDomain = () => {
    if (!data || data.length === 0) return ['auto', 'auto'];
    const values = data.map(d => d.avg_voltage);
    let min = Math.min(...values);
    let max = Math.max(...values);
    if (min === max) return [min - 1, max + 1];
    const pad = (max - min) * 0.1;
    return [min - pad, max + pad];
  };

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(100,116,139,0.3)" />
        <XAxis
          dataKey="day"
          tickFormatter={formatXAxis}
          stroke="#94a3b8"
          fontSize={12}
        />
        <YAxis 
            stroke="#94a3b8" 
            fontSize={12}
            domain={getDomain()}
            allowDataOverflow={true}
            tickFormatter={(value) => `${(value / 1000).toFixed(1)}k`}
        />

        <Tooltip
          contentStyle={{
            backgroundColor: 'rgba(30,41,59,0.9)',
            borderColor: '#475569',
          }}
          labelFormatter={formatXAxis}
        />
        <Line
          type="monotone"
          dataKey="avg_voltage"
          stroke="#64b5f6"
          strokeWidth={2}
          isAnimationActive={false}
          dot={{ r: 2 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default HistoricalChart;

import React from 'react';
import { ResponsiveContainer, RadialBarChart, RadialBar, PolarAngleAxis } from 'recharts';

const ProbabilityGauge = ({ data }) => {
    if (!data) {
        return <div style={{textAlign: 'center', color: '#94a3b8'}}>No prediction data available.</div>;
    }

    const probability = data.failure_probability || 0;
    const percentage = Math.round(probability * 100);

    // Change color based on risk level
    let fillColor = '#22c55e'; // Green (low risk)
    if (percentage > 50) fillColor = '#f59e0b'; // Yellow (medium risk)
    if (percentage > 80) fillColor = '#ef4444'; // Red (high risk)

    // The data for the chart needs to be in an array
    const chartData = [{ name: 'Probability', value: percentage }];

    return (
        <ResponsiveContainer width="100%" height="100%">
            <RadialBarChart
                innerRadius="80%"
                outerRadius="100%"
                data={chartData}
                startAngle={180}
                endAngle={0}
                barSize={30}
            >
                <PolarAngleAxis
                    type="number"
                    domain={[0, 100]}
                    angleAxisId={0}
                    tick={false}
                />
                <RadialBar
                    background
                    dataKey="value"
                    angleAxisId={0}
                    fill={fillColor}
                    cornerRadius={15}
                />
                {/* Text in the middle of the gauge */}
                <text
                    x="50%"
                    y="70%"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fontSize="3rem"
                    fontWeight="600"
                    fill={fillColor}
                >
                    {`${percentage}%`}
                </text>
            </RadialBarChart>
        </ResponsiveContainer>
    );
};

export default ProbabilityGauge;
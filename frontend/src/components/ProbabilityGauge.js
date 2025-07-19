import React from 'react';

/**
 * Horizontal bar gauge
 * props.data = { failure_probability: 0 – 1 }
 */
const ProbabilityGauge = ({ data }) => {
  const prob = data?.failure_probability ?? 0;
  const pct = Math.round(prob * 100);      // 0–100
  const left = `${pct}%`;                  // 指针位置

  // 文本颜色：<=39 绿，40–69 黄，>=70 红
  const txtColor =
    pct >= 70 ? '#ef4444' : pct >= 40 ? '#facc15' : '#22c55e';

  return (
    <div className="bar-gauge-wrapper">
      <div className="bar-gauge-track">
        {/* 白色竖线 + 小三角指针 */}
        <div className="bar-gauge-pointer" style={{ left }} />
      </div>

      <div className="bar-gauge-text" style={{ color: txtColor }}>
        {pct}%
      </div>
    </div>
  );
};

export default ProbabilityGauge;

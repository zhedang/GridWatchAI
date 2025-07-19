import React from 'react';
import {
  CircularProgressbar,
  buildStyles
} from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';

const AssetHealthGauge = ({ health }) => {
  const percentage = Math.round(health * 100);
  const isPerfect = percentage === 100;          // 100% ➜ 绿色，其它 ➜ 黄色

  return (
    <div style={{ width: 140, height: 140 }}>
      <CircularProgressbar
        value={percentage}
        text={`${percentage}%`}
        styles={buildStyles({
          textColor: '#e2e8f0',
          trailColor: '#334155',
          pathColor: isPerfect ? '#22c55e' : '#facc15'
        })}
      />
    </div>
  );
};

export default AssetHealthGauge;

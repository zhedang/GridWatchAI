// src/components/PredictionSummary.js
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

const PredictionSummary = ({ currentTime }) => {
  const [count, setCount] = useState(0);
  const [error, setError] = useState(null);
  const lastDate = useRef(null);

  useEffect(() => {
    if (!currentTime) return;

    const today = currentTime.toISOString().split('T')[0];
    if (today === lastDate.current) return;
    lastDate.current = today;

    const THRESHOLD = 0.35;
    const endDate = new Date(currentTime.getTime() + 7 * 86400000)
      .toISOString()
      .split('T')[0];

    axios
      .get(
        `http://localhost:3000/asset_predictions` +
          `?prediction_date=gte.${today}&prediction_date=lte.${endDate}` +
          `&failure_probability=gte.${THRESHOLD}`
      )
      .then(res => {
        const uniq = new Set(res.data.map(r => r.asset_id));
        setCount(uniq.size);
        setError(null);
      })
      .catch(() => {
        setError('Error');
        setCount(0);
      });
  }, [currentTime]);

  return (
    <div className="dashboard-panel">
      <h3 className="panel-title">7-Day Failure Prediction</h3>
      <div className="stat-card-content">
        {error ? (
          <div className="stat-error">{error}</div>
        ) : (
          <>
            <div
              className="stat-value"
              style={{
                fontSize: '3rem',
                color: count === 0 ? '#f8fafc' : '#ef4444'
              }}
            >
              {count}
            </div>
            <div className="stat-label">High-Risk Assets</div>
          </>
        )}
      </div>
    </div>
  );
};

export default PredictionSummary;

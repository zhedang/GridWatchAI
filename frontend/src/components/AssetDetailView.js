import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import HistoricalChart from './HistoricalChart';
import ProbabilityGauge from './ProbabilityGauge';

const getAssetDisplayName = (asset) => {
    if (!asset) return '';
    const prefix = asset.asset_type || '';
    const suffix = asset.asset_id?.slice(0, 5) || '';
    return `${prefix}_${suffix}`;
  };

const AssetDetailView = ({ asset, currentTime }) => {
  const [historicalData, setHistoricalData] = useState([]);
  const [predictionData, setPredictionData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const lastFetched = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!asset || !currentTime) return;

      const simDate = currentTime.toISOString().split('T')[0];
      if (asset.asset_id === lastFetched.current?.id && simDate === lastFetched.current?.date) return;

      setIsLoading(true);
      setError('');
      try {
        const [histRes, predRes] = await Promise.all([
          axios.post('http://localhost:3000/rpc/get_daily_voltage_history', {
            p_asset_id: asset.asset_id,
            p_end_date: simDate,
          }),
          axios.get(
            `http://localhost:3000/asset_predictions?asset_id=eq.${asset.asset_id}&prediction_date=eq.${simDate}`,
          ),
        ]);

        const cleaned = histRes.data
          .filter(d => d.avg_voltage != null && d.avg_voltage !== '')
          .map(d => ({ ...d, avg_voltage: Number(d.avg_voltage) }))
          .filter(d => !Number.isNaN(d.avg_voltage))
          .reverse();

        setHistoricalData(cleaned);
        setPredictionData(predRes.data[0] || null);
        lastFetched.current = { id: asset.asset_id, date: simDate };
      } catch {
        setError('Could not load details for this asset.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [asset, currentTime]);

  if (!asset) {
    return (
      <>
        <h3 className="panel-title">Asset Details</h3>
        <div className="details-placeholder">
          <p>Select an asset on the map to see details here.</p>
        </div>
      </>
    );
  }

  if (isLoading) {
    return (
      <>
        <h3 className="panel-title">{asset.name}</h3>
        <div className="details-placeholder">
          <p>Loading asset details...</p>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <h3 className="panel-title">{asset.name}</h3>
        <div className="details-placeholder">
          <p style={{ color: '#ef4444' }}>{error}</p>
        </div>
      </>
    );
  }

  return (
    <>
      <h3 className="panel-title">Asset: {getAssetDisplayName(asset)}</h3>

      <div className="details-content">
        <div className="chart-container">
          <h4>Avg. Daily Voltage (Last 30 Days)</h4>
          <HistoricalChart data={historicalData} />
        </div>
        <div className="chart-container">
          <h4>Failure Probability for Today</h4>
          <ProbabilityGauge data={predictionData} />
        </div>
      </div>
    </>
  );
};

export default AssetDetailView;

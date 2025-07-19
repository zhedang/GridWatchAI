import React, { useMemo } from 'react';


const SystemHealthWidget = ({ assets }) => {
  const { healthy, failed, percent } = useMemo(() => {
    if (!assets || assets.length === 0) return { healthy: 0, failed: 0, percent: 0 };
    const failed = assets.filter(a => a.failure_label === 1).length;
    const healthy = assets.length - failed;
    const percent = ((healthy / assets.length) * 100).toFixed(0);
    return { healthy, failed, percent };
  }, [assets]);

  return (
    <>
      <h3 className="panel-title">System Health</h3>
      <div className="stat-card-content">
        <div
          className="stat-value"
          style={{ color: percent === '100' ? '#22c55e' : '#facc15' }}
        >
          {percent}%
        </div>
        <div className="stat-label">Assets Healthy</div>
        <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '4px' }}>
          {healthy} healthy / {failed} failed
        </div>
      </div>
    </>
  );
};

export default SystemHealthWidget;

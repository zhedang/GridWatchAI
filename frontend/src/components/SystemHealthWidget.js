// src/components/SystemHealthWidget.js
import React, { useMemo } from 'react';
import AssetHealthGauge from './AssetHealthGauge';

/**
 * System Health
 * - healthy: failure_label !== 1
 * - failed : failure_label === 1
 * - healthRatio = healthy / total
 * - 颜色：100 % ➜ 绿，其它 ➜ 黄（由 AssetHealthGauge 控制）
 */
const SystemHealthWidget = ({ assets }) => {
  const { healthy, failed, healthRatio } = useMemo(() => {
    if (!assets || assets.length === 0) {
      return { healthy: 0, failed: 0, healthRatio: 0 };
    }
    const failed = assets.filter(a => a.failure_label === 1).length;
    const healthy = assets.length - failed;
    const healthRatio = healthy / assets.length;  // 0 – 1
    return { healthy, failed, healthRatio };
  }, [assets]);

  return (
    <div className="dashboard-panel">
      <h3 className="panel-title">System Health</h3>
      <div className="stat-card-content">
        <AssetHealthGauge health={healthRatio} />
        <div className="stat-label">Assets Healthy</div>
        <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: 4 }}>
          {healthy} healthy / {failed} failed
        </div>
      </div>
    </div>
  );
};

export default SystemHealthWidget;

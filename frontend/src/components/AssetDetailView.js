import React, { useEffect } from 'react';

const AssetDetailView = ({ asset }) => {
    
    // 每当传入的 asset 发生变化时，这个 hook 就会运行
    useEffect(() => {
        if (asset) {
            console.log("Details view updated for asset:", asset.asset_id);
            // 未来，所有获取历史数据和图表渲染的逻辑都将从这里开始！
        }
    }, [asset]);

    // 如果没有选中任何资产，显示提示信息
    if (!asset) {
        return (
            <>
                <h3 className="panel-title">Asset Details</h3>
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', color: '#475569' }}>
                    <p>Select an asset on the map to see details here.</p>
                </div>
            </>
        );
    }

    // 如果选中了资产，就显示其信息
    return (
        <>
            <h3 className="panel-title">{asset.name} ({asset.asset_type})</h3>
            <div style={{ padding: '10px' }}>
                <p>Asset ID: {asset.asset_id}</p>
                <p>Current Status: {asset.failure_label === 1 ? 'Failure' : 'Normal'}</p>
                
                <div style={{ marginTop: '30px', color: '#475569', textAlign: 'center' }}>
                    <h4>Historical Data Chart will be here</h4>
                </div>
                
                <div style={{ marginTop: '30px', color: '#475569', textAlign: 'center' }}>
                    <h4>Failure Probability Gauge will be here</h4>
                </div>
            </div>
        </>
    );
};

export default AssetDetailView;
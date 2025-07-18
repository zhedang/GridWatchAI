import React, { useState } from 'react'; // 暂时移除 useEffect 和 axios
import './Dashboard.css';

// 引入所有需要的组件
import TitleBar from './components/TitleBar';
import AssetDetailView from './components/AssetDetailView';
import AssetMap from './components/AssetMap';
import RightSidebar from './components/RightSidebar'; // 引入新的右侧栏容器

const Dashboard = () => {
    // 交互状态逻辑保持不变
    const [assetsWithCurrentData, setAssetsWithCurrentData] = useState([]); 
    const [selectedAssetId, setSelectedAssetId] = useState(null); 

    const handleAssetSelect = (assetId) => {
        console.log("Asset selected in Dashboard:", assetId);
        setSelectedAssetId(assetId);
    };
    
    const selectedAsset = assetsWithCurrentData.find(a => a.asset_id === selectedAssetId);

    return (
        <div className="dashboard-container">
            {/* 第 1 部分：标题栏 */}
            <div className="dashboard-panel title-bar-area">
                <TitleBar />
            </div>

            {/* 第 2 部分：左侧详情区 */}
            <div className="dashboard-panel details-area">
                <AssetDetailView asset={selectedAsset} />
            </div>

            {/* 第 3 部分：中间地图区 */}
            <div className="dashboard-panel main-map-area">
                <AssetMap 
                    assetsToDisplay={assetsWithCurrentData} 
                    onAssetSelect={handleAssetSelect}
                />
            </div>
            
            {/* 第 4 部分：右侧信息区 */}
            <div className="right-sidebar-area">
                <RightSidebar />
            </div>
        </div>
    );
};

export default Dashboard;
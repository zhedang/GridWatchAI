import React from 'react';
import PredictionSummary from './PredictionSummary';
import SystemHealthWidget from './SystemHealthWidget';

const RightSidebar = () => {
    return (
        <div className="right-sidebar-stack">
            <div className="dashboard-panel">
                <PredictionSummary />
            </div>
            <div className="dashboard-panel">
                <SystemHealthWidget />
            </div>
        </div>
    );
};

export default RightSidebar;
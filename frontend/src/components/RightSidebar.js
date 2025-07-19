import React from 'react';
import PredictionSummary from './PredictionSummary';
import SystemHealthWidget from './SystemHealthWidget';

const RightSidebar = ({ currentTime, assets }) => (
  <div className="right-sidebar-stack">
    <PredictionSummary currentTime={currentTime} />
    <SystemHealthWidget assets={assets} />
  </div>
);

export default RightSidebar;

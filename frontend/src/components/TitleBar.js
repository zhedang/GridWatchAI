import React from 'react';
import { FaBolt } from 'react-icons/fa';
import SimulationClock from './SimulationClock';

const TitleBar = ({ currentTime, isPaused, onTogglePause }) => {
    return (
        <div className="title-bar-content">
            <div className="title-group">
                <FaBolt className="title-icon" />
                <h1 className="title-text">Grid Watch AI</h1>
            </div>
            <div className="clock-controls">
                <SimulationClock currentTime={currentTime} />
                <button className="pause-button" onClick={onTogglePause}>
                    {isPaused ? 'Resume' : 'Pause'}
                </button>
            </div>
        </div>
    );
};

export default TitleBar;
import React from 'react';
import SimulationClock from './SimulationClock';
import { FaBolt } from 'react-icons/fa';

const TitleBar = ({ currentTime, isPaused, onTogglePause }) => {
    return (
        <div className="title-bar-content">
            {/* This div MUST have the class name "title-group" */}
            <div className="title-group">
                <FaBolt className="title-icon" />
                <h1 className="title-text">GRID WATCH AI</h1>
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
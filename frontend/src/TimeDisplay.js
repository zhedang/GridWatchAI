import React from 'react';

const TimeDisplay = ({ currentTime }) => {
    return (
        <div className="alert alert-primary" role="alert">
            Current Time: {currentTime ? currentTime.toISOString() : 'Loading...'}
        </div>
    );
};

export default TimeDisplay;

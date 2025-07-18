import React from 'react';

const SimulationClock = ({ currentTime }) => {
    // Formatting options for a clean date-time display
    const options = {
        year: 'numeric', month: '2-digit', day: '2-digit',
        hour: '2-digit', minute: '2-digit', second: '2-digit',
        hour12: false,
        timeZone: 'UTC'
    };

    // Format the date string, replacing slashes with dashes
    const formattedTime = currentTime 
        ? new Intl.DateTimeFormat('en-CA', options).format(currentTime).replace(/\//g, '-')
        : 'Loading...';

    const clockStyle = {
        fontFamily: 'monospace',
        fontSize: '1.5rem',
        color: '#a0aec0', // A lighter gray color
        fontWeight: '500'
    };

    return (
        <div style={clockStyle}>
            {formattedTime}
        </div>
    );
};

export default SimulationClock;
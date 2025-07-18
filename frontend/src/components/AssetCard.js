import React from 'react';

const AssetCard = ({ assetToDisplay }) => {
    // Destructure the properties we need
    const { asset_type, asset_id, failure_label, name, voltage } = assetToDisplay;
    
    const isFailure = failure_label === 1;
    const statusClass = isFailure ? 'status-failure' : 'status-normal';

    // Take the first 5 characters of the asset_id for the label
    const shortId = asset_id ? asset_id.substring(0, 5) : '';
    
    // Combine asset_type and shortId into the desired single-line format
    const displayText = `${asset_type}_${shortId}`;
    
    // Tooltip on hover still shows the full name for clarity
    const tooltipText = `Name: ${name}\nID: ${asset_id}\nVoltage: ${voltage != null ? voltage.toFixed(2) : 'N/A'}`;

    return (
        <div className="asset-icon" title={tooltipText}>
            <div className={`status-dot ${statusClass}`}></div>
            <span className="asset-info-compact">{displayText}</span>
        </div>
    );
};

export default AssetCard;
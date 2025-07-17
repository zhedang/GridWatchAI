import React, { useEffect, useRef } from 'react';
import { Marker, Popup } from 'react-leaflet';

const AssetMarker = ({ asset, greenIcon, redIcon }) => {
    // A ref to hold a direct reference to the Leaflet marker instance
    const markerRef = useRef(null);
    const isFailure = asset.failure_label === 1;

    // This is the key to the optimization.
    // This hook watches for changes ONLY to this specific asset's failure_label.
    useEffect(() => {
        // When it changes, we directly tell the Leaflet marker to update its icon.
        // This is extremely fast and avoids re-rendering the whole map.
        if (markerRef.current) {
            markerRef.current.setIcon(isFailure ? redIcon : greenIcon);
        }
    }, [isFailure, redIcon, greenIcon]); // Dependency array

    return (
        <Marker
            ref={markerRef}
            position={[asset.location_lat, asset.location_lon]}
            // Set the initial icon when the marker is first created
            icon={isFailure ? redIcon : greenIcon}
        >
            <Popup>
                <b>{asset.name}</b><br />
                {asset.asset_type}
            </Popup>
        </Marker>
    );
};

export default AssetMarker;
// In src/components/AssetMarker.js
import React, { useEffect, useRef } from 'react';
import { Marker, Popup } from 'react-leaflet';

// 接收 onSelect prop
const AssetMarker = ({ asset, greenIcon, redIcon, onSelect }) => { 
    const markerRef = useRef(null);
    const isFailure = asset.failure_label === 1;

    useEffect(() => {
        // ... (this part is the same)
    }, [isFailure, redIcon, greenIcon]);

    return (
        <Marker
            ref={markerRef}
            position={[asset.location_lat, asset.location_lon]}
            icon={isFailure ? redIcon : greenIcon}
            // 这是 react-leaflet 中处理事件的方式
            eventHandlers={{
                click: () => {
                    // 当标记被点击时，调用 onSelect 并传入资产ID
                    onSelect(asset.asset_id);
                },
            }}
        >
            <Popup>
                <b>{asset.name}</b><br />
                {asset.asset_type}
            </Popup>
        </Marker>
    );
};

export default AssetMarker;
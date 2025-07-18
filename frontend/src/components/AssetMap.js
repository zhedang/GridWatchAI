import React from 'react';
import { MapContainer, TileLayer, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import AssetMarker from './AssetMarker'; // Make sure this import is correct

// Icon definitions
const greenIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

const redIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

// There should only be ONE declaration of AssetMap
const AssetMap = ({ assetsToDisplay, onAssetSelect }) => {
    const assetsWithCoords = assetsToDisplay.filter(asset => asset.location_lat != null && asset.location_lon != null);

    if (assetsWithCoords.length === 0) {
        return (
            <MapContainer center={[44.6, -63.6]} zoom={10} style={{ height: '100%', width: '100%' }}>
                <TileLayer
                    url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                />
                <Popup position={[44.6, -63.6]}>No assets with location data to display.</Popup>
            </MapContainer>
        );
    }

    const lats = assetsWithCoords.map(a => a.location_lat);
    const lngs = assetsWithCoords.map(a => a.location_lon);
    const centerLat = lats.reduce((a, b) => a + b, 0) / lats.length;
    const centerLng = lngs.reduce((a, b) => a + b, 0) / lngs.length;
    const center = [centerLat, centerLng];

    return (
        <MapContainer center={center} zoom={12} style={{ height: '100%', width: '100%' }}>
            <TileLayer
                url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
            />
            {assetsWithCoords.map(asset => (
                <AssetMarker
                    key={asset.asset_id}
                    asset={asset}
                    greenIcon={greenIcon}
                    redIcon={redIcon}
                    onSelect={onAssetSelect}
                />
            ))}
        </MapContainer>
    );
};

export default AssetMap;
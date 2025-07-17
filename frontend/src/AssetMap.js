import React from 'react';
import { MapContainer, TileLayer, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import AssetMarker from './AssetMarker'; // Import our new component

// Keep the icon definitions here, as they only need to be created once.
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

const AssetMap = ({ assetsToDisplay }) => {
    const assetsWithCoords = assetsToDisplay.filter(asset => asset.location_lat != null && asset.location_lon != null);

    if (assetsWithCoords.length === 0) {
        return (
            <MapContainer center={[44.6, -63.6]} zoom={10} style={{ height: '100%', width: '100%' }}>
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
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
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            {/* Now we just map over the assets and render our smart AssetMarker component,
              passing the asset data and icons down as props.
            */}
            {assetsWithCoords.map(asset => (
                <AssetMarker
                    key={asset.asset_id}
                    asset={asset}
                    greenIcon={greenIcon}
                    redIcon={redIcon}
                />
            ))}
        </MapContainer>
    );
};

export default AssetMap;
import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import AssetCard from './AssetCard';
import './AssetCard.css';
import TimeDisplay from './TimeDisplay';
import AssetMap from './AssetMap';

const Dashboard = () => {
    const [assets, setAssets] = useState([]);
    const [sensorReadings, setSensorReadings] = useState([]);
    const [currentTime, setCurrentTime] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            console.log("Fetching asset and sensor data...");
            try {
                // We no longer fetch weather data
                const [assetsRes, sensorReadingsRes] = await Promise.all([
                    axios.get('http://localhost:3000/grid_assets'),
                    axios.get('http://localhost:3000/sensor_readings?order=timestamp.asc'),
                ]);

                console.log("Data fetched:", {
                    assets: assetsRes.data?.length,
                    sensors: sensorReadingsRes.data?.length,
                });

                if (!sensorReadingsRes.data || sensorReadingsRes.data.length === 0) {
                    setError("No sensor readings data found. Cannot start simulation.");
                    setLoading(false);
                    return;
                }

                setAssets(assetsRes.data || []);
                setSensorReadings(sensorReadingsRes.data);
                setCurrentTime(new Date(sensorReadingsRes.data[0].timestamp));

            } catch (err) {
                console.error("Error fetching data:", err);
                const errorMessage = err.response ? `Request failed with status code ${err.response.status}` : err.message;
                setError(`Failed to fetch data. Error: ${errorMessage}`);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    useEffect(() => {
        if (loading || error || !sensorReadings.length) return;
        const lastTimestamp = new Date(sensorReadings[sensorReadings.length - 1].timestamp);

        const timer = setInterval(() => {
            setCurrentTime(prevTime => {
                if (!prevTime) return null;

                // Use the more robust way of adding an hour
                const newTime = new Date(prevTime.getTime() + 3600 * 1000);

                if (newTime > lastTimestamp) {
                    clearInterval(timer);
                    return prevTime;
                }
                return newTime;
            });
        }, 1000);
        return () => clearInterval(timer);
    }, [loading, error, sensorReadings]);

    const sensorReadingsMap = useMemo(() => {
        const map = new Map();
        sensorReadings.forEach(r => {
            const timeKey = new Date(r.timestamp).getTime();
            if (!map.has(timeKey)) map.set(timeKey, {});
            map.get(timeKey)[r.asset_id] = r;
        });
        return map;
    }, [sensorReadings]);

    // The weatherDataMap has been completely removed.

    const assetsWithCurrentData = useMemo(() => {
        if (!currentTime || !assets.length) return [];
        const timeKey = currentTime.getTime();
        const currentSensorReadings = sensorReadingsMap.get(timeKey) || {};

        // Now we only merge asset data with sensor data
        return assets.map(asset => {
            const sensorReading = currentSensorReadings[asset.asset_id] || {};
            return {
                ...asset,
                voltage: sensorReading.voltage,
                failure_label: sensorReading.failure_label,
            };
        });
    }, [currentTime, assets, sensorReadingsMap]); // Dependency array is now smaller

    if (loading) {
        return <div className="container mt-4"><div className="alert alert-info">Loading data...</div></div>;
    }

    if (error) {
        return <div className="container mt-4"><div className="alert alert-danger">{error}</div></div>;
    }

    return (
        <div className="container-fluid mt-4">
            {/* Main container for the map and floating elements */}
            <div style={{ position: 'relative', width: '100%', height: 'calc(100vh - 40px)' }}>
                
                {/* The list of new asset icons, floating on the left */}
                <div className="asset-icon-list">
                    {assetsWithCurrentData.map(asset => (
                        <AssetCard key={asset.asset_id} assetToDisplay={asset} />
                    ))}
                </div>
    
                {/* The Time Display, floating on the top-right */}
                <div style={{ position: 'absolute', top: '20px', right: '20px', zIndex: 1000 }}>
                    <TimeDisplay currentTime={currentTime} />
                </div>
    
                {/* The Map takes up the full space in the background */}
                <AssetMap assetsToDisplay={assetsWithCurrentData} />
    
            </div>
        </div>
    );
};

export default Dashboard;
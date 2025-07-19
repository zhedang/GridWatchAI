import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import './Dashboard.css';

import TitleBar from './components/TitleBar';
import AssetDetailView from './components/AssetDetailView';
import AssetMap from './components/AssetMap';
import RightSidebar from './components/RightSidebar';

const Dashboard = () => {
    // --- STATE ---
    const [isPaused, setIsPaused] = useState(false);
    const [assets, setAssets] = useState([]);
    const [sensorReadings, setSensorReadings] = useState([]);
    const [currentTime, setCurrentTime] = useState(null); 
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedAssetId, setSelectedAssetId] = useState(null);

    // --- DATA FETCHING ---
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const [assetsRes, sensorReadingsRes] = await Promise.all([
                    axios.get('http://localhost:3000/grid_assets'),
                    axios.get('http://localhost:3000/sensor_readings?order=timestamp.asc'),
                ]);

                setAssets(assetsRes.data || []);
                setSensorReadings(sensorReadingsRes.data);
                setCurrentTime(new Date('2024-11-11T00:00:00Z')); 
                setError(null);
            } catch (err) {
                setError("Failed to fetch data.");
                console.error("Error fetching data:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    // --- SIMULATION CLOCK ENGINE ---
    useEffect(() => {
        if (loading || error || isPaused) {
            return; // Exit the effect if paused
        }

        const lastTimestamp = new Date('2024-12-31T23:00:00Z');

        const timer = setInterval(() => {
            setCurrentTime(prevTime => {
                const newTime = new Date(prevTime.getTime() + 3600 * 1000);
                if (newTime > lastTimestamp) {
                    clearInterval(timer);
                    setIsPaused(true); // Automatically pause at the end
                    return prevTime;
                }
                return newTime;
            });
        }, 1000); 
        
        return () => clearInterval(timer); 
    }, [loading, error, isPaused]);

    // --- EVENT HANDLERS ---
    const togglePause = () => {
        setIsPaused(prevPausedState => !prevPausedState);
    };
    
    const handleAssetSelect = (assetId) => {
        setSelectedAssetId(assetId);
    };

    // --- DERIVED DATA ---
    const sensorReadingsMap = useMemo(() => {
        const map = new Map();
        sensorReadings.forEach(r => {
            const timeKey = new Date(r.timestamp).getTime();
            if (!map.has(timeKey)) map.set(timeKey, {});
            map.get(timeKey)[r.asset_id] = r;
        });
        return map;
    }, [sensorReadings]);
    
    const assetsWithCurrentData = useMemo(() => {
        if (!currentTime || !assets.length) return [];
        const timeKey = currentTime.getTime();
        const currentSensorReadings = sensorReadingsMap.get(timeKey) || {};
        return assets.map(asset => {
            const sensorReading = currentSensorReadings[asset.asset_id] || {};
            return { ...asset, voltage: sensorReading.voltage, failure_label: sensorReading.failure_label };
        });
    }, [currentTime, assets, sensorReadingsMap]);
    
    const selectedAsset = assetsWithCurrentData.find(a => a.asset_id === selectedAssetId);

    // --- RENDER ---
    return (
        <div className="dashboard-container">
            <div className="dashboard-panel title-bar-area">
                <TitleBar 
                    currentTime={currentTime} 
                    isPaused={isPaused} 
                    onTogglePause={togglePause} 
                />
            </div>

            <div className="dashboard-panel details-area">
                {/* This is the line that was updated from your version */}
                <AssetDetailView asset={selectedAsset} currentTime={currentTime} />
            </div>

            <div className="dashboard-panel main-map-area">
                <AssetMap assetsToDisplay={assetsWithCurrentData} onAssetSelect={handleAssetSelect} />
            </div>
            
            <div className="right-sidebar-area">
                <RightSidebar currentTime={currentTime} assets={assetsWithCurrentData} />
            </div>
        </div>
    );
};

export default Dashboard;
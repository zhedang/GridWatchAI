import React, { useState, useEffect } from 'react';
import axios from 'axios';

const PredictionSummary = () => {
    // State to hold our final number, loading status, and any errors
    const [failureCount, setFailureCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchPredictionCount = async () => {
            // Define our "high risk" threshold
            const RISK_THRESHOLD = 0.8; // 80% probability

            try {
                setLoading(true);

                // This is the clever part. We ask PostgREST for two things:
                // 1. Filter the results where probability is greater than our threshold (gt.0.8)
                // 2. Add a special header 'Prefer: count=exact' to ask for the total count
                //    without downloading all the data.
                const response = await axios.get(
                    `http://localhost:3000/asset_predictions?failure_probability=gt.${RISK_THRESHOLD}`,
                    {
                        headers: {
                            'Prefer': 'count=exact'
                        }
                    }
                );
                
                // The total count is returned in a 'Content-Range' header, e.g., "0-24/150"
                const contentRange = response.headers['content-range'];
                if (contentRange) {
                    // We extract the number after the "/"
                    const total = parseInt(contentRange.split('/')[1], 10);
                    setFailureCount(total);
                }
                
                setError(null);
            } catch (err) {
                console.error("Error fetching prediction count:", err);
                setError("Could not load prediction data.");
            } finally {
                setLoading(false);
            }
        };

        fetchPredictionCount();
    }, []); // The empty array [] means this effect runs once when the component mounts

    // Helper function to render the content based on state
    const renderContent = () => {
        if (loading) {
            return <div className="stat-value">...</div>;
        }
        if (error) {
            return <div className="stat-error">{error}</div>;
        }
        return (
            <>
                <div className="stat-value">{failureCount}</div>
                <div className="stat-label">High-Risk Assets</div>
            </>
        );
    };

    return (
        <>
            <h3 className="panel-title">7-Day Failure Prediction</h3>
            <div className="stat-card-content">
                {renderContent()}
            </div>
        </>
    );
};

export default PredictionSummary;
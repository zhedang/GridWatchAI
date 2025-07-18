import React from 'react';

const MainMapArea = () => {
    return (
        <>
            {/* 这里的样式是为了让占位符内容居中，后续会被地图取代 */}
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: '8px' }}>
                <h2 style={{ color: '#475569' }}>Map and Asset List will be here</h2>
            </div>
        </>
    );
};

export default MainMapArea;
import React from 'react';
import { Link } from 'react-router-dom';

const LearningMode: React.FC = () => {
    return (
        <div style={{ padding: '20px' }}>
            <h1>Learning Mode</h1>
            <Link to="/">Back to Home</Link>
        </div>
    );
}


export default LearningMode;
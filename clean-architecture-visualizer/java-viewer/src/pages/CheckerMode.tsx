import React from 'react';
import { Link } from 'react-router-dom';

const CheckerMode: React.FC = () => {
    return (
        <div style={{ padding: '20px' }}>
            <h1>Checker Mode</h1>
            <Link to="/">Back to Home</Link>
            <Link to="/use-case-interaction-diagram" style={{ marginLeft: '20px' }}>
                View Use Case Interaction Diagram
            </Link>
        </div>
    );
}


export default CheckerMode;
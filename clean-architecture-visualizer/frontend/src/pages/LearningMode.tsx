import React from 'react';
import { Link } from 'react-router-dom';
import { CADiagram } from '../components/diagram';

const LearningMode: React.FC = () => {
    return (
        <div style={{ padding: '20px' }}>
              return <CADiagram />;
            
            <Link to="/">Back to Home</Link>
        </div>
    );
}


export default LearningMode;
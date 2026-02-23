import React from 'react';
import { Link } from 'react-router-dom';

const ProjectStarter: React.FC = () => {
    return (
        <div style={{ padding: '20px' }}>
            <h1>Project Starter</h1>
            <Link to="/">Back to Home</Link>
        </div>
    );
}


export default ProjectStarter;
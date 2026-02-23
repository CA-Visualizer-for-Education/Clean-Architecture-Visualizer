import React from 'react';
import { Link } from 'react-router-dom';

const Home: React.FC = () => {
    return (
        <div>
            <h1>Welcome to the Clean Architecture Visualizer</h1>
            <nav>
                <ul>
                    <li>
                        <Link to="/learning">Learning Mode</Link>
                    </li>
                    <li>
                        <Link to="/checker">Checker Mode</Link>
                    </li>
                    <li>
                        <Link to="/project-starter">Project Starter</Link>
                    </li>
                </ul>
            </nav>
        </div>
    );
};

export default Home;
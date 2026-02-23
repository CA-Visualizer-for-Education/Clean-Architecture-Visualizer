import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Dropdown from './Dropdown';

const Header: React.FC = () => {
    const navigate = useNavigate();

    const navigationOptions = ['Learning Mode', 'Checker Mode', 'Project Starter'];

    const handleNavigation = (option: string) => {
        switch (option) {
            case 'Learning Mode':
                navigate('/learning');
                break;
            case 'Checker Mode':
                navigate('/checker');
                break;
            case 'Project Starter':
                navigate('/project-starter');
                break;
        }
    };

    return (
        <header className="header">
            <div className="header-content">
                <Link to="/" className="home-link">
                    <h1>Clean Architecture Visualizer</h1>
                </Link>

                <nav className="header-nav">
                    <Dropdown
                        options={navigationOptions}
                        onSelect={handleNavigation}
                    />
                </nav>
            </div>
        </header>
    );
};

export default Header;
import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const VerticalNavBar = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { logout, user } = useAuth();

    const handleLogout = async () => {
        try {
            const result = await logout();
            if (result.success) {
                navigate('/signin');
            } else {
                alert(result.message || 'Failed to logout');
            }
        } catch (error) {
            console.error('Logout error:', error);
            alert('Failed to logout');
        }
    };

    return (
        <nav className="vertical-navbar">
            <div className="navbar-brand">
                <Link to="/" className="navbar-logo">
                    Task Board
                </Link>
            </div>
            <div className="navbar-links">
                <Link 
                    to="/" 
                    className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}
                >
                    Dashboard
                </Link>
                <Link 
                    to="/tasks" 
                    className={`nav-link ${location.pathname === '/tasks' ? 'active' : ''}`}
                >
                    Tasks
                </Link>
                <Link 
                    to="/projects" 
                    className={`nav-link ${location.pathname === '/projects' ? 'active' : ''}`}
                >
                    Projects
                </Link>
                <Link 
                    to="/settings" 
                    className={`nav-link ${location.pathname === '/settings' ? 'active' : ''}`}
                >
                    Settings
                </Link>
            </div>
            <div className="navbar-footer">
                {user && (
                    <div className="user-info">
                        <span className="user-email">{user.email}</span>
                        <button onClick={handleLogout} className="logout-button">
                            Logout
                        </button>
                    </div>
                )}
            </div>
        </nav>
    );
};

export default VerticalNavBar;
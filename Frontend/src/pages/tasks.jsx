import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, CircularProgress } from '@mui/material';
import { useAuth } from '../context/AuthContext';
import { getAuth } from 'firebase/auth';
import './tasks.css';

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

function Tasks() {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const { user } = useAuth();

    useEffect(() => {
        fetchTasks();
    }, []);

    const fetchTasks = async () => {
        try {
            const auth = getAuth();
            const token = await auth.currentUser?.getIdToken();
            
            if (!token) {
                setError('Authentication token not found');
                setLoading(false);
                return;
            }

            const response = await fetch(`${API_URL}/tasks/assigned`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch tasks');
            }

            const data = await response.json();
            setTasks(data);
        } catch (err) {
            console.error('Error fetching tasks:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = async (taskId, newStatus) => {
        try {
            const auth = getAuth();
            const token = await auth.currentUser?.getIdToken();
            
            if (!token) {
                setError('Authentication token not found');
                return;
            }

            const response = await fetch(`${API_URL}/tasks/${taskId}/status`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ status: newStatus })
            });

            if (!response.ok) {
                throw new Error('Failed to update task status');
            }

            setTasks(tasks.map(task => 
                task._id === taskId ? { ...task, status: newStatus } : task
            ));
        } catch (err) {
            console.error('Error updating task status:', err);
            setError(err.message);
        }
    };

    const getStatusColor = (status) => {
        switch (status.toLowerCase()) {
            case 'pending':
                return 'status-pending';
            case 'in progress':
                return 'status-in-progress';
            case 'completed':
                return 'status-completed';
            default:
                return 'status-pending';
        }
    };

    if (loading) {
        return (
            <div className="tasks-container">
                <div className="loading-state">
                    <CircularProgress style={{ color: '#DFD0B8' }} />
                </div>
            </div>
        );
    }

    return (
        <div className="tasks-container">
            <div className="tasks-header">
                <h1>My Tasks</h1>
                <Button 
                    variant="contained" 
                    onClick={() => navigate('/projects')}
                >
                    View Projects
                </Button>
            </div>

            {error && <div className="error-message">{error}</div>}

            {tasks.length === 0 ? (
                <div className="no-tasks">
                    No tasks assigned to you yet.
                </div>
            ) : (
                <div className="tasks-content">
                    {tasks.map(task => (
                        <div key={task._id} className="task-card">
                            <h3>{task.title}</h3>
                            <p>{task.description}</p>
                            
                            <div className="task-project">
                                Project: {task.project?.title || 'N/A'}
                            </div>

                            <div className="task-meta">
                                <span className={`task-status ${getStatusColor(task.status)}`}>
                                    {task.status}
                                </span>
                                <span className="task-due-date">
                                    Due: {new Date(task.dueDate).toLocaleDateString()}
                                </span>
                            </div>

                            <div className="task-actions">
                                {task.status !== 'completed' && (
                                    <Button
                                        variant="contained"
                                        onClick={() => handleStatusChange(task._id, 'completed')}
                                    >
                                        Mark Complete
                                    </Button>
                                )}
                                {task.status === 'pending' && (
                                    <Button
                                        variant="outlined"
                                        onClick={() => handleStatusChange(task._id, 'in progress')}
                                    >
                                        Start Task
                                    </Button>
                                )}
                                {task.status === 'in progress' && (
                                    <Button
                                        variant="outlined"
                                        onClick={() => handleStatusChange(task._id, 'pending')}
                                    >
                                        Pause Task
                                    </Button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default Tasks;

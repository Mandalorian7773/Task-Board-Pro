import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getAuth } from 'firebase/auth';
import {
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Box,
  Typography,
  CircularProgress
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { io } from 'socket.io-client';
import './TaskList.css';

const priorityColors = {
  low: '#4caf50',
  medium: '#ff9800',
  high: '#f44336'
};

const statusColors = {
  pending: '#9e9e9e',
  'in-progress': '#2196f3',
  completed: '#4caf50'
};

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

function TaskList({ projectId }) {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [socket, setSocket] = useState(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [editForm, setEditForm] = useState({
    title: '',
    description: '',
    priority: '',
    assignedTo: '',
    dueDate: ''
  });

  useEffect(() => {
    const newSocket = io(API_URL);
    setSocket(newSocket);

    newSocket.emit('join-project', projectId);

    newSocket.on('task-updated', (updatedTask) => {
      setTasks(prevTasks => 
        prevTasks.map(task => 
          task._id === updatedTask._id ? updatedTask : task
        )
      );
    });

    return () => newSocket.close();
  }, [projectId]);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const auth = getAuth();
        const token = await auth.currentUser?.getIdToken();
        
        if (!token) {
          setError('Authentication token not found');
          setLoading(false);
          return;
        }

        const response = await fetch(`${API_URL}/tasks/project/${projectId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          credentials: 'include'
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to fetch tasks');
        }

        const data = await response.json();
        setTasks(data);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    const checkAdminStatus = async () => {
      try {
        const auth = getAuth();
        const token = await auth.currentUser?.getIdToken();
        
        if (!token) {
          setError('Authentication token not found');
          return;
        }

        const response = await fetch(`${API_URL}/projects/${projectId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          credentials: 'include'
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to fetch project');
        }

        const project = await response.json();
        setIsAdmin(project.admin && project.admin.firebaseUid === user.uid);
      } catch (error) {
        setError(error.message);
      }
    };

    if (user) {
      fetchTasks();
      checkAdminStatus();
    } else {
      setLoading(false);
    }
  }, [projectId, user]);

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
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'credentials': 'include'
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update task status');
      }

      const updatedTask = await response.json();
      setTasks(prevTasks =>
        prevTasks.map(task =>
          task._id === taskId ? updatedTask : task
        )
      );
    } catch (error) {
      console.error('Error updating task status:', error);
      setError(error.message);
    }
  };

  const handleEditClick = (task) => {
    setSelectedTask(task);
    setEditForm({
      title: task.title || '',
      description: task.description || '',
      priority: task.priority || '',
      assignedTo: task.assignedTo || '',
      dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : ''
    });
    setEditDialogOpen(true);
  };

  const handleEditSubmit = async () => {
    try {
      const auth = getAuth();
      const token = await auth.currentUser?.getIdToken();
      
      if (!token) {
        setError('Authentication token not found');
        return;
      }

      const response = await fetch(`${API_URL}/tasks/${selectedTask._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'credentials': 'include'
        },
        body: JSON.stringify(editForm)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update task');
      }

      const updatedTask = await response.json();
      setTasks(prevTasks => 
        prevTasks.map(task => 
          task._id === updatedTask._id ? updatedTask : task
        )
      );
      setEditDialogOpen(false);
    } catch (error) {
      console.error('Error updating task:', error);
      setError(error.message);
    }
  };

  const handleDelete = async (taskId) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;

    try {
      const auth = getAuth();
      const token = await auth.currentUser?.getIdToken();
      
      if (!token) {
        setError('Authentication token not found');
        return;
      }

      const response = await fetch(`${API_URL}/tasks/${taskId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'credentials': 'include'
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete task');
      }

      setTasks(prevTasks => prevTasks.filter(task => task._id !== taskId));
    } catch (error) {
      console.error('Error deleting task:', error);
      setError(error.message);
    }
  };

  if (loading) {
    return (
      <div className="loading-state">
        <CircularProgress />
      </div>
    );
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <div className="task-list-container">
      {tasks.length === 0 ? (
        <p className="no-tasks">No tasks yet. Add your first task!</p>
      ) : (
        <div className="task-list">
          {tasks.map((task) => (
            <div key={task._id} className="task-card">
              <div className="task-header">
                <h3>{task.title}</h3>
                {isAdmin && (
                  <div className="task-actions">
                    <Button
                      size="small"
                      startIcon={<EditIcon />}
                      onClick={() => handleEditClick(task)}
                    >
                      Edit
                    </Button>
                    <Button
                      size="small"
                      color="error"
                      startIcon={<DeleteIcon />}
                      onClick={() => handleDelete(task._id)}
                    >
                      Delete
                    </Button>
                  </div>
                )}
              </div>
              <p>{task.description}</p>
              <div className="task-meta">
                <span className={`task-priority ${task.priority?.toLowerCase()}`}>
                  {task.priority}
                </span>
                <span className="task-due-date">
                  Due: {new Date(task.dueDate).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)}>
        <DialogTitle>Edit Task</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Title"
            type="text"
            fullWidth
            value={editForm.title}
            onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Description"
            type="text"
            fullWidth
            multiline
            rows={4}
            value={editForm.description}
            onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
          />
          <TextField
            select
            margin="dense"
            label="Priority"
            fullWidth
            value={editForm.priority}
            onChange={(e) => setEditForm({ ...editForm, priority: e.target.value })}
          >
            <MenuItem value="High">High</MenuItem>
            <MenuItem value="Medium">Medium</MenuItem>
            <MenuItem value="Low">Low</MenuItem>
          </TextField>
          <TextField
            margin="dense"
            label="Assigned To"
            type="text"
            fullWidth
            value={editForm.assignedTo}
            onChange={(e) => setEditForm({ ...editForm, assignedTo: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Due Date"
            type="date"
            fullWidth
            value={editForm.dueDate}
            onChange={(e) => setEditForm({ ...editForm, dueDate: e.target.value })}
            InputLabelProps={{
              shrink: true,
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleEditSubmit}>Save</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

export default TaskList; 
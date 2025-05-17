import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getAuth } from 'firebase/auth';
import {
  Box,
  Typography,
  Button,
  Paper,
  Grid,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  CircularProgress
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import TaskList from '../Components/TaskList';
import AddTask from '../Components/AddTask';
import './ProjectDetail.css';

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

function ProjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [addTaskOpen, setAddTaskOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    title: '',
    description: ''
  });

  useEffect(() => {
    const fetchProject = async () => {
      try {
        if (!user || !user.uid) {
          setError('User not authenticated');
          setLoading(false);
          return;
        }

        const auth = getAuth();
        const token = await auth.currentUser?.getIdToken();
        
        if (!token) {
          setError('Authentication token not found');
          setLoading(false);
          return;
        }

        const response = await fetch(`${API_URL}/projects/${id}`, {
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

        const data = await response.json();
        console.log('Project data:', data);
        console.log('Current user:', user);
        
        setProject(data);
        // Check if user is admin by comparing firebaseUid
        const isUserAdmin = data.admin && data.admin.firebaseUid === user.uid;
        console.log('Is user admin:', isUserAdmin);
        setIsAdmin(isUserAdmin);
        
        setEditForm({
          title: data.title || '',
          description: data.description || ''
        });
      } catch (error) {
        console.error('Error fetching project:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchProject();
    }
  }, [id, user]);

  const handleEditSubmit = async () => {
    try {
      if (!user || !user.uid) {
        setError('User not authenticated');
        return;
      }

      const auth = getAuth();
      const token = await auth.currentUser?.getIdToken();
      
      if (!token) {
        setError('Authentication token not found');
        return;
      }

      const response = await fetch(`${API_URL}/projects/${id}`, {
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
        throw new Error(errorData.message || 'Failed to update project');
      }

      const updatedProject = await response.json();
      setProject(updatedProject);
      setEditDialogOpen(false);
    } catch (error) {
      console.error('Error updating project:', error);
      setError(error.message);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this project?')) return;

    try {
      if (!user || !user.uid) {
        setError('User not authenticated');
        return;
      }

      const auth = getAuth();
      const token = await auth.currentUser?.getIdToken();
      
      if (!token) {
        setError('Authentication token not found');
        return;
      }

      const response = await fetch(`${API_URL}/projects/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'credentials': 'include'
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete project');
      }

      navigate('/projects');
    } catch (error) {
      console.error('Error deleting project:', error);
      setError(error.message);
    }
  };

  const handleCopyInviteCode = () => {
    if (project && project.inviteCode) {
      navigator.clipboard.writeText(project.inviteCode);
      alert('Invite code copied to clipboard!');
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
    return (
      <div className="error-state">
        <Typography color="error">{error}</Typography>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="error-state">
        <Typography>Project not found</Typography>
      </div>
    );
  }

  return (
    <div className="project-detail-container">
      <Paper className="project-header">
        <Grid container spacing={2} alignItems="center">
          <Grid item xs>
            <Typography variant="h4" className="project-title">
              {project.title}
            </Typography>
            <Typography variant="body1" className="project-description">
              {project.description}
            </Typography>
            <div className="project-meta">
              <Chip
                label={`${project.teamMembers?.length || 0} members`}
                color="primary"
                variant="outlined"
              />
              <Chip
                label={project.status || 'Active'}
                color={
                  project.status === 'Done'
                    ? 'success'
                    : project.status === 'In Progress'
                    ? 'warning'
                    : 'default'
                }
              />
            </div>
          </Grid>
          {isAdmin && (
            <Grid item>
              <div className="project-actions">
                <Button
                  variant="outlined"
                  startIcon={<EditIcon />}
                  onClick={() => setEditDialogOpen(true)}
                >
                  Edit
                </Button>
                <Button
                  variant="outlined"
                  color="error"
                  startIcon={<DeleteIcon />}
                  onClick={handleDelete}
                >
                  Delete
                </Button>
                <Button
                  variant="contained"
                  onClick={handleCopyInviteCode}
                >
                  Copy Invite Code
                </Button>
              </div>
            </Grid>
          )}
        </Grid>
      </Paper>

      <Paper className="tasks-section">
        <div className="tasks-header">
          <Typography variant="h5">Tasks</Typography>
          {isAdmin && (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setAddTaskOpen(true)}
            >
              Add Task
            </Button>
          )}
        </div>
        <TaskList projectId={id} />
      </Paper>

      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)}>
        <DialogTitle>Edit Project</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Title"
            value={editForm.title}
            onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Description"
            value={editForm.description}
            onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
            multiline
            rows={3}
            margin="normal"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleEditSubmit} variant="contained">
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>

      <AddTask
        open={addTaskOpen}
        onClose={() => setAddTaskOpen(false)}
        projectId={id}
        onTaskAdded={(newTask) => {
          // The TaskList component will handle the update through WebSocket
        }}
      />
    </div>
  );
}

export default ProjectDetail; 
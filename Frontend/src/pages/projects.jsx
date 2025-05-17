import React, { useEffect, useState } from "react";
import './projects.css';
import { useNavigate } from "react-router-dom";
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import TextField from '@mui/material/TextField';
import { io } from 'socket.io-client';
import { useAuth } from '../context/AuthContext';
import { getAuth } from 'firebase/auth';

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

function Projects() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [joinDialogOpen, setJoinDialogOpen] = useState(false);
  const [inviteCode, setInviteCode] = useState('');
  const [socket, setSocket] = useState(null);

  useEffect(() => {
  
    const newSocket = io(API_URL);
    setSocket(newSocket);

    return () => newSocket.close();
  }, []);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        if (!user) {
          console.error('No user found');
          setError('Not authenticated');
          setLoading(false);
          return;
        }

        const auth = getAuth();
        const token = await auth.currentUser?.getIdToken();
        
        if (!token) {
          console.error('No token found');
          setError('Not authenticated');
          setLoading(false);
          return;
        }

        console.log('Fetching projects with token:', token);
        const response = await fetch(`${API_URL}/projects`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          credentials: 'include'
        });

        if (!response.ok) {
          const errorData = await response.json();
          console.error('Error response:', errorData);
          throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log('Received projects data:', data);
        
        if (Array.isArray(data)) {
          setProjects(data);
        } else {
          console.error('Expected array but got:', data);
          setProjects([]);
        }
      } catch (error) {
        console.error("Error fetching projects:", error);
        setError(error.message);
        setProjects([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, [user]);

  const handleAddProject = () => {
    navigate("/addProject");
  };

  const handleJoinProject = async () => {
    try {
      const auth = getAuth();
      const token = await auth.currentUser?.getIdToken();
      
      if (!token) {
        throw new Error('Not authenticated');
      }

      const response = await fetch(`${API_URL}/projects/join`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'credentials': 'include'
        },
        body: JSON.stringify({ inviteCode })
      });

      const data = await response.json();
      if (response.ok) {
        setProjects(prevProjects => [...prevProjects, data.project]);
        setJoinDialogOpen(false);
        setInviteCode('');
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error("Error joining project:", error);
      alert("Failed to join project");
    }
  };

  const handleCopyInviteCode = (code) => {
    navigator.clipboard.writeText(code);
    alert("Invite code copied to clipboard!");
  };

  if (loading) {
    return <div className="projects-container"><p>Loading projects...</p></div>;
  }

  if (error) {
    return <div className="projects-container"><p>Error: {error}</p></div>;
  }

  return (
    <div className="projects-container">
      <main className="projects-content">
        <div className="projects-header">
          <h1>Projects</h1>
          <div className="project-actions">
            <Button variant="contained" onClick={() => setJoinDialogOpen(true)}>
              Join Project
            </Button>
            <Button className="add-Btn1" variant="contained" onClick={handleAddProject}>
              <img src="https://i.pinimg.com/736x/ef/ae/bb/efaebbb486712e10b693b0713cc0640c.jpg" alt="add" />
            </Button>
          </div>
        </div>

        {projects.length === 0 ? (
          <p>No projects yet. Add your first project!</p>
        ) : (
          <div className="projects-grid">
            {projects.map((project) => (
              <div
                key={project._id}
                className="project-card"
                onClick={() => navigate(`/projects/${project._id}`)}
              >
                <h2>{project.title}</h2>
                <p>{project.description}</p>
                {project.admin && project.admin.firebaseUid === user.uid && (
                  <div className="project-admin-info">
                    <p>Admin</p>
                    <Button
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCopyInviteCode(project.inviteCode);
                      }}
                    >
                      Copy Invite Code
                    </Button>
                  </div>
                )}
                <div className="project-members">
                  <p>{project.teamMembers ? project.teamMembers.length : 0} members</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <Dialog open={joinDialogOpen} onClose={() => setJoinDialogOpen(false)}>
        <DialogTitle>Join Project</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Invite Code"
            type="text"
            fullWidth
            value={inviteCode}
            onChange={(e) => setInviteCode(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setJoinDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleJoinProject}>Join</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

export default Projects;
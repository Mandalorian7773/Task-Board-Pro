import React, { useState } from "react";
import "./addProject.css";
import { TextField, Button, Chip } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getAuth } from 'firebase/auth';

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

function AddProject({ onProjectCreated }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [emails, setEmails] = useState([]);
  const [currentEmail, setCurrentEmail] = useState("");
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleAddEmail = () => {
    if (currentEmail && !emails.includes(currentEmail)) {
      setEmails([...emails, currentEmail]);
      setCurrentEmail("");
    }
  };

  const handleRemoveEmail = (emailToRemove) => {
    setEmails(emails.filter((email) => email !== emailToRemove));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!user) {
      setError('You must be logged in to create a project');
      return;
    }

    try {
      const auth = getAuth();
      const token = await auth.currentUser?.getIdToken();
      
      if (!token) {
        setError('Authentication token not found');
        return;
      }

      const response = await fetch(`${API_URL}/projects/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
          "credentials": "include"
        },
        body: JSON.stringify({ title, description }),
      });

      const data = await response.json();

      if (response.ok) {
        alert("Project created successfully!");
        if (onProjectCreated) {
          onProjectCreated(data);
        }
        setTitle("");
        setDescription("");
        setEmails([]);
        navigate('/projects');
      } else {
        setError(data.message || "Failed to create project");
      }
    } catch (err) {
      console.error("Error creating project:", err);
      setError("An error occurred while creating the project");
    }
  };

  return (
    <div className="add-project-container">
      <h1>Create New Project</h1>
      {error && <div className="error-message">{error}</div>}
      <form className="add-project-form" onSubmit={handleSubmit}>
        <TextField
          label="Project Title"
          variant="outlined"
          fullWidth
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        <TextField 
          className="description-input"
          label="Project Description"
          variant="outlined"
          multiline
          rows={4}
          fullWidth
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
        />
        <div className="email-input">
          <TextField
            label="Invite by Email"
            variant="outlined"
            value={currentEmail}
            onChange={(e) => setCurrentEmail(e.target.value)}
          />
          <Button variant="contained" onClick={handleAddEmail}>
            Add
          </Button>
        </div>
        <div className="email-list">
          {emails.map((email, index) => (
            <Chip
              key={index}
              label={email}
              onDelete={() => handleRemoveEmail(email)}
              style={{ margin: "5px" }}
            />
          ))}
        </div>
        <Button variant="contained" color="primary" type="submit">
          Create Project
        </Button>
      </form>
    </div>
  );
}

export default AddProject;

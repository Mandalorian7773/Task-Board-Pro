import React from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import './App.css';
import VerticalNavBar from './Components/navBar';
import SignIn from './Auth/signin';
import SignUp from './Auth/signup';
import Dashboard from './Dashboard/index';
import Projects from './pages/projects';
import ProjectDetail from './pages/ProjectDetail';
import AddProject from './pages/addProject';
import KanbanBoard from './Components/KanbanBoard';
import ProtectedRoute from './components/ProtectedRoute';
import Tasks from './pages/tasks';

function AppContent() {
  const location = useLocation();
  const noNavBar = ['/signin', '/signup'];

  return (
    <div className="app-container">
      {!noNavBar.includes(location.pathname) && <VerticalNavBar />}
      <div className="main-content">
        <Routes>
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          <Route path="/projects" element={
            <ProtectedRoute>
              <Projects />
            </ProtectedRoute>
          } />
          <Route path="/projects/:id" element={
            <ProtectedRoute>
              <ProjectDetail />
            </ProtectedRoute>
          } />
          <Route path="/addProject" element={
            <ProtectedRoute>
              <AddProject />
            </ProtectedRoute>
          } />
          <Route path="/projects/kanban" element={
            <ProtectedRoute>
              <KanbanBoard />
            </ProtectedRoute>
          } />
          <Route path="/tasks" element={
            <ProtectedRoute>
              <Tasks />
            </ProtectedRoute>
          } />
        </Routes>
      </div>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

export default App;
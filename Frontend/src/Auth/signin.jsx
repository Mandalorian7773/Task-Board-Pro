import React from 'react';
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './signin.css';

const SignIn = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const { login, loginWithGoogle } = useAuth();
  
    const handleSubmit = async (e) => {
      e.preventDefault();
      setLoading(true);
      setError('');
      
      try {
        const result = await login(email, password);
        
        if(result.success) {
          alert("Login successful!");
          navigate('/');
        } else {
          setError(result.message);
        }
      } catch (error) {
        console.error('Login error:', error);
        setError(error.message || 'Failed to login');
      } finally {
        setLoading(false);
      }
    };

    const handleGoogleLogin = async () => {
      setLoading(true);
      setError('');
      
      try {
        const result = await loginWithGoogle();
        
        if(result.success) {
          alert("Login successful!");
          navigate('/');
        } else {
          setError(result.message);
        }
      } catch (error) {
        console.error('Google login error:', error);
        setError(error.message || 'Failed to login with Google');
      } finally {
        setLoading(false);
      }
    };
  
    return (
      <div className="signin-page">
        <div className="container">
          <h1>Welcome Back</h1>
          {error && <div className="error-message">{error}</div>}
          <form onSubmit={handleSubmit}>
            <div>
              <label>Email:</label>
              <input 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)}
                required 
                placeholder="Enter your email"
              />
            </div>
            <div>
              <label>Password:</label>
              <input 
                type="password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)}
                required 
                placeholder="Enter your password"
              />
            </div>
            <div>
              <p>Don't have an account? <Link to="/signup">Register</Link></p>
            </div>
            <button type="submit" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
          <div className="divider">
            <span>OR</span>
          </div>
          <button 
            onClick={handleGoogleLogin} 
            className="google-button"
            disabled={loading}
          >
            <img 
              src="https://www.google.com/favicon.ico" 
              alt="Google" 
              className="google-icon"
            />
            Continue with Google
          </button>
        </div>
      </div>
    );
  };

export default SignIn;
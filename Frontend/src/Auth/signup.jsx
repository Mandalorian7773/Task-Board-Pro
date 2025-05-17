import React from 'react';
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './signup.css';

const SignUp = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const { signup, loginWithGoogle } = useAuth();
  
    const handleSubmit = async (e) => {
      e.preventDefault();
      setLoading(true);
      setError('');
      
      try {
        const result = await signup(email, password, name);
        
        if(result.success) {
          alert("Account created successfully!");
          navigate('/');
        } else {
          setError(result.message);
        }
      } catch (error) {
        console.error('Signup error:', error);
        setError(error.message || 'Failed to create account');
      } finally {
        setLoading(false);
      }
    };

    const handleGoogleSignup = async () => {
      setLoading(true);
      setError('');
      
      try {
        const result = await loginWithGoogle();
        
        if(result.success) {
          alert("Account created successfully!");
          navigate('/');
        } else {
          setError(result.message);
        }
      } catch (error) {
        console.error('Google signup error:', error);
        setError(error.message || 'Failed to sign up with Google');
      } finally {
        setLoading(false);
      }
    };
  
    return (
      <div className="signup-page">
        <div className="container">
          <h1>Welcome to TaskBoard</h1>
          {error && <div className="error-message">{error}</div>}
          <form onSubmit={handleSubmit}>
            <div>
              <label>Name:</label>
              <input 
                type="text" 
                value={name} 
                onChange={(e) => setName(e.target.value)}
                required 
                minLength={2}
                placeholder="Enter your name"
              />
            </div>
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
                minLength={6}
                placeholder="Enter your password (min 6 characters)"
              />
            </div>
            <div>
              <p>Already have an account? <Link to="/signin">Login</Link></p>
            </div>
            <button type="submit" disabled={loading}>
              {loading ? 'Creating Account...' : 'Sign Up'}
            </button>
          </form>
          <div className="divider">
            <span>OR</span>
          </div>
          <button 
            onClick={handleGoogleSignup} 
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

export default SignUp;  
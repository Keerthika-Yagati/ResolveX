import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signin, getUserInfo } from '../api';

function SignIn({ onLogin }) {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await signin(formData);
      
      if (result.code === 200 && result.jwt) {
        setTimeout(async () => {
          const userInfo = await getUserInfo();
          if (userInfo.code === 200) {
            const userData = {
              fullname: userInfo.fullname,
              role: userInfo.role,
              userId: userInfo.userId,
              username: userInfo.username || userInfo.email || formData.email,
              email: userInfo.email || formData.email,
              menulist: userInfo.menulist,
            };
            
            localStorage.setItem('userInfo', JSON.stringify({
              userId: userInfo.userId,
              fullname: userInfo.fullname,
              role: userInfo.role,
              username: userInfo.username || userInfo.email || formData.email,
              email: userInfo.email || formData.email
            }));
            
            onLogin(userData);
            navigate('/dashboard');
          } else {
            setError('Failed to load user information');
          }
        }, 100);
      } else {
        setError(result.message || 'Invalid credentials');
      }
    } catch (err) {
      console.error('Signin error:', err);
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <button onClick={() => navigate('/')} className="back-to-home">
          ← Back to Home
        </button>
        
        <div className="auth-card">
          <div className="auth-header">
            <div className="auth-logo">🎯 ResolveX</div>
            <h2>Welcome Back</h2>
            <p>Sign in to continue to ResolveX</p>
          </div>
          
          {error && <div className="error-message">{error}</div>}
          
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Email Address</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="Enter your email"
              />
            </div>

            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                placeholder="Enter your password"
              />
            </div>

            <button type="submit" className="btn-primary" disabled={loading} style={{ width: '100%' }}>
              {loading ? 'Signing In...' : 'Sign In →'}
            </button>
          </form>

          <div className="auth-footer">
            <p>Don't have an account? <Link to="/signup">Create Account</Link></p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SignIn;
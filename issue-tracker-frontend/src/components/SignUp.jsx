import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signup } from '../api';

function SignUp() {
  const [formData, setFormData] = useState({
    fullname: '',
    phone: '',
    email: '',
    password: '',
    role: 1,
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
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
    setSuccess('');
    setLoading(true);

    try {
      const result = await signup(formData);
      
      if (result.code === 200) {
        setSuccess('Account created successfully! Redirecting to login...');
        setTimeout(() => {
          navigate('/signin');
        }, 2000);
      } else {
        setError(result.message || 'Signup failed');
      }
    } catch (err) {
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
            <h2>Create Account</h2>
            <p>Join ResolveX to start tracking issues</p>
          </div>
          
          {error && <div className="error-message">{error}</div>}
          {success && <div className="success-message">{success}</div>}
          
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Full Name</label>
              <input
                type="text"
                name="fullname"
                value={formData.fullname}
                onChange={handleChange}
                required
                placeholder="Enter your full name"
              />
            </div>

            <div className="form-group">
              <label>Phone Number</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required
                placeholder="Enter your phone number"
              />
            </div>

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
                placeholder="Create a password"
              />
            </div>

            <div className="form-group">
              <label>Role</label>
              <select name="role" value={formData.role} onChange={handleChange}>
                <option value={1}>User (Report Issues)</option>
                <option value={2}>Developer (Fix Issues)</option>
                <option value={3}>Admin (Manage All)</option>
              </select>
            </div>

            <button type="submit" className="btn-primary" disabled={loading} style={{ width: '100%' }}>
              {loading ? 'Creating Account...' : 'Create Account →'}
            </button>
          </form>

          <div className="auth-footer">
            <p>Already have an account? <Link to="/signin">Sign In</Link></p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SignUp;
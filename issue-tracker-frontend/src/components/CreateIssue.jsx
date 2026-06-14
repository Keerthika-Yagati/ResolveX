import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createIssue } from '../api';

function CreateIssue({ user }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium',
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
      const result = await createIssue(formData);
      
      if (result.code === 200) {
        setSuccess('Issue created successfully!');
        setTimeout(() => {
          navigate('/my-issues');
        }, 1500);
      } else {
        setError(result.message || 'Failed to create issue');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard">
      <div className="content-section">
        <h2>Create New Issue</h2>
        
        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Title *</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              placeholder="Brief summary of the issue"
            />
          </div>

          <div className="form-group">
            <label>Description *</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              rows="5"
              placeholder="Detailed description of the issue"
            />
          </div>

          <div className="form-group">
            <label>Priority *</label>
            <select name="priority" value={formData.priority} onChange={handleChange}>
              <option value="low">Low - Minor issue</option>
              <option value="medium">Medium - Normal priority</option>
              <option value="high">High - Urgent issue</option>
            </select>
          </div>

          <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Creating...' : 'Create Issue'}
            </button>
            <button type="button" className="btn-secondary" onClick={() => navigate('/')}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateIssue;
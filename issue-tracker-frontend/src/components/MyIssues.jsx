import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMyIssues, updateIssueStatus, getAllUsers, getAllDevelopers } from '../api';

function MyIssues({ user }) {
  const [issues, setIssues] = useState([]);
  const [users, setUsers] = useState([]);
  const [developers, setDevelopers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [usersResult, devsResult] = await Promise.all([
        getAllUsers(1, 100),
        getAllDevelopers()
      ]);
      
      if (usersResult.code === 200) {
        setUsers(usersResult.users || []);
      }
      if (devsResult.code === 200) {
        setDevelopers(devsResult.developers || []);
      }
      
      await loadIssues();
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const loadIssues = async () => {
    try {
      const result = await getMyIssues();
      if (result.code === 200) {
        setIssues(result.issues || []);
      }
    } catch (error) {
      console.error('Error loading issues:', error);
    } finally {
      setLoading(false);
    }
  };

  const getUserName = (userId) => {
    const foundUser = users.find(u => u.id === userId);
    return foundUser ? foundUser.fullname : `User #${userId}`;
  };

  const getDeveloperName = (devId) => {
    const foundDev = developers.find(d => d.id === devId);
    return foundDev ? foundDev.fullname : `Developer #${devId}`;
  };

  const handleStatusUpdate = async (issueId, newStatus, e) => {
    e.stopPropagation();
    setUpdating(issueId);
    try {
      const result = await updateIssueStatus(issueId, newStatus);
      if (result.code === 200) {
        await loadIssues();
        alert(`Issue status updated to ${newStatus}!`);
      }
    } catch (error) {
      alert('Network error. Please try again.');
    } finally {
      setUpdating(null);
    }
  };

  if (loading) {
    return (
      <div className="dashboard">
        <div className="content-card">
          <p>Loading your issues...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>My Issues</h1>
        <p>Track and manage all issues you've reported</p>
      </div>

      <div className="content-card">
        <h2>📋 All My Issues ({issues.length})</h2>
        
        {issues.length === 0 ? (
          <div className="empty-state">
            <p>No issues found. Click "Create Issue" to get started!</p>
          </div>
        ) : (
          issues.map(issue => (
            <div 
              key={issue.id} 
              className="issue-card-modern" 
              data-priority={issue.priority}
              onClick={() => navigate(`/issue/${issue.id}`)}
            >
              <div className="issue-card-header">
                <span className="issue-title">{issue.title}</span>
                <div className="issue-badges">
                  <span className={`priority-badge priority-${issue.priority}`}>
                    {issue.priority.toUpperCase()}
                  </span>
                  <span className={`status-badge status-${issue.status}`}>
                    {issue.status.toUpperCase()}
                  </span>
                </div>
              </div>
              
              <div className="issue-description">{issue.description}</div>
              
              <div className="issue-meta-grid">
                <div className="meta-item">
                  <span className="meta-label">🆔 ID:</span>
                  <span className="meta-value">#{issue.id}</span>
                </div>
                <div className="meta-item">
                  <span className="meta-label">📅 Created:</span>
                  <span className="meta-value">{new Date(issue.createdDate).toLocaleDateString()}</span>
                </div>
                <div className="meta-item">
                  <span className="meta-label">👤 Created by:</span>
                  <span className="meta-value">{getUserName(issue.createdBy)}</span>
                </div>
                {issue.assignedTo && (
                  <div className="meta-item">
                    <span className="meta-label">👨‍💻 Assigned to:</span>
                    <span className="meta-value">{getDeveloperName(issue.assignedTo)}</span>
                  </div>
                )}
              </div>
              
              {issue.status !== 'resolved' && issue.status !== 'closed' && user?.role === 2 && issue.assignedTo === user?.userId && (
                <div className="issue-actions" onClick={(e) => e.stopPropagation()}>
                  {issue.status === 'assigned' && (
                    <button onClick={(e) => handleStatusUpdate(issue.id, 'in-progress', e)} className="btn-primary-sm">
                      {updating === issue.id ? 'Updating...' : 'Start Working'}
                    </button>
                  )}
                  {issue.status === 'in-progress' && (
                    <button onClick={(e) => handleStatusUpdate(issue.id, 'resolved', e)} className="btn-success-sm">
                      {updating === issue.id ? 'Updating...' : 'Mark Resolved'}
                    </button>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default MyIssues;
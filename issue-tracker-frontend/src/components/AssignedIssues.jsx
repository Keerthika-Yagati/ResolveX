import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAssignedToMe, updateIssueStatus, getAllUsers, getAllDevelopers } from '../api';

function AssignedIssues({ user }) {
  const [issues, setIssues] = useState([]);
  const [users, setUsers] = useState([]);
  const [developers, setDevelopers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updating, setUpdating] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // Load users and developers for name mapping
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
      const result = await getAssignedToMe();
      if (result.code === 200) {
        setIssues(result.issues || []);
      } else {
        setError(result.message || 'Failed to load assigned issues');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getUserName = (userId) => {
    const foundUser = users.find(u => u.id === userId);
    return foundUser ? foundUser.fullname : `User #${userId}`;
  };

  const handleStatusUpdate = async (issueId, newStatus, e) => {
    e.stopPropagation();
    setUpdating(issueId);
    try {
      const result = await updateIssueStatus(issueId, newStatus);
      if (result.code === 200) {
        await loadIssues();
        alert(`Issue status updated to ${newStatus}!`);
      } else {
        alert(result.message || 'Failed to update status');
      }
    } catch (err) {
      alert('Network error. Please try again.');
    } finally {
      setUpdating(null);
    }
  };

  const getPriorityColor = (priority) => {
    switch(priority) {
      case 'high': return '#dc3545';
      case 'medium': return '#ff9800';
      case 'low': return '#28a745';
      default: return '#6c757d';
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'open': return '#dc3545';
      case 'assigned': return '#ff9800';
      case 'in-progress': return '#2196f3';
      case 'resolved': return '#28a745';
      case 'closed': return '#6c757d';
      default: return '#6c757d';
    }
  };

  const getNextStatus = (currentStatus) => {
    switch(currentStatus) {
      case 'assigned': return 'in-progress';
      case 'in-progress': return 'resolved';
      default: return null;
    }
  };

  const getStatusMessage = (currentStatus) => {
    switch(currentStatus) {
      case 'assigned': return 'Start Working';
      case 'in-progress': return 'Mark as Resolved';
      default: return '';
    }
  };

  if (loading) {
    return (
      <div className="dashboard">
        <div className="content-card">
          <p>Loading assigned issues...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>My Tasks</h1>
        <p>Issues assigned to you for resolution</p>
      </div>

      <div className="content-card">
        <h2>📋 Assigned Issues ({issues.length})</h2>
        
        {error && <div className="error-message">{error}</div>}
        
        {issues.length === 0 ? (
          <div className="empty-state">
            <p>No issues assigned to you yet.</p>
            <p>When issues are assigned, they will appear here.</p>
          </div>
        ) : (
          issues.map(issue => {
            const nextStatus = getNextStatus(issue.status);
            return (
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
                
                <div className="issue-description">
                  {issue.description?.length > 120 
                    ? `${issue.description.substring(0, 120)}...` 
                    : issue.description}
                </div>
                
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
                    <span className="meta-label">👤 Reported by:</span>
                    <span className="meta-value">{getUserName(issue.createdBy)}</span>
                  </div>
                  {issue.assignedTo && (
                    <div className="meta-item">
                      <span className="meta-label">👨‍💻 Assigned to:</span>
                      <span className="meta-value">You</span>
                    </div>
                  )}
                </div>
                
                {nextStatus && (
                  <div className="issue-actions" onClick={(e) => e.stopPropagation()}>
                    <button 
                      onClick={(e) => handleStatusUpdate(issue.id, nextStatus, e)}
                      className="btn-primary-sm"
                      disabled={updating === issue.id}
                    >
                      {updating === issue.id ? 'Updating...' : getStatusMessage(issue.status)}
                    </button>
                  </div>
                )}
                
                {issue.status === 'resolved' && (
                  <div className="issue-resolved-badge">
                    ✅ This issue has been resolved
                  </div>
                )}
                
                {issue.status === 'closed' && (
                  <div className="issue-closed-badge">
                    🔒 This issue has been closed
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

export default AssignedIssues;
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllIssues, assignIssue, closeIssue, getAllDevelopers, getAllUsers } from '../api';

function AllIssues({ user }) {
  const [issues, setIssues] = useState([]);
  const [developers, setDevelopers] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [assigning, setAssigning] = useState(null);
  const [selectedDev, setSelectedDev] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      // Fetch all data in parallel
      const [issuesResult, devsResult, usersResult] = await Promise.all([
        getAllIssues(),
        getAllDevelopers(),
        getAllUsers(1, 100)
      ]);
      
      console.log('Issues Result:', issuesResult); // Debug log
      
      if (issuesResult.code === 200) {
        const issuesList = issuesResult.issues || [];
        setIssues(issuesList);
        console.log('Issues loaded:', issuesList.length); // Debug log
      } else {
        console.error('Failed to load issues:', issuesResult.message);
      }
      
      if (devsResult.code === 200) {
        setDevelopers(devsResult.developers || []);
      }
      
      if (usersResult.code === 200) {
        setUsers(usersResult.users || []);
      }
    } catch (err) {
      console.error('Failed to load data:', err);
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

  const handleAssign = async (issueId, e) => {
    e.stopPropagation();
    const developerId = selectedDev[issueId];
    if (!developerId) {
      alert('Please select a developer');
      return;
    }
    
    setAssigning(issueId);
    try {
      const result = await assignIssue(issueId, developerId);
      if (result.code === 200) {
        await loadData();
        alert('Issue assigned successfully!');
      } else {
        alert(result.message || 'Failed to assign issue');
      }
    } catch (err) {
      alert('Network error. Please try again.');
    } finally {
      setAssigning(null);
    }
  };

  const handleClose = async (issueId, e) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to close this issue?')) {
      try {
        const result = await closeIssue(issueId);
        if (result.code === 200) {
          await loadData();
          alert('Issue closed successfully!');
        } else {
          alert(result.message || 'Failed to close issue');
        }
      } catch (err) {
        alert('Network error. Please try again.');
      }
    }
  };

  if (loading) {
    return (
      <div className="dashboard">
        <div className="content-card">
          <p>Loading issues...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>All Issues</h1>
        <p>View and manage all issues in the system</p>
      </div>

      <div className="content-card">
        <h2>📋 All Issues ({issues.length})</h2>
        
        {issues.length === 0 ? (
          <div className="empty-state">
            <p>No issues found in the system.</p>
            <p>Click "Create Issue" to get started!</p>
          </div>
        ) : (
          issues.map(issue => (
            <div key={issue.id} className="issue-card-modern" onClick={() => navigate(`/issue/${issue.id}`)}>
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
                {issue.description?.length > 150 
                  ? `${issue.description.substring(0, 150)}...` 
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
              
              {(issue.status === 'open' || issue.status === 'assigned') && (
                <div className="issue-actions" onClick={(e) => e.stopPropagation()}>
                  <select 
                    onChange={(e) => setSelectedDev({...selectedDev, [issue.id]: e.target.value})}
                    defaultValue=""
                    className="dev-select"
                  >
                    <option value="">Select Developer</option>
                    {developers.map(dev => (
                      <option key={dev.id} value={dev.id}>{dev.fullname}</option>
                    ))}
                  </select>
                  <button 
                    onClick={(e) => handleAssign(issue.id, e)} 
                    className="btn-primary-sm" 
                    disabled={assigning === issue.id}
                  >
                    {assigning === issue.id ? 'Assigning...' : 'Assign'}
                  </button>
                  {issue.status !== 'resolved' && issue.status !== 'closed' && (
                    <button onClick={(e) => handleClose(issue.id, e)} className="btn-danger-sm">
                      Close
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

export default AllIssues;
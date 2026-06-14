import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMyIssues, getAssignedToMe, getAllIssues, getAllUsers, getAllDevelopers } from '../api';
import LandingPage from './LandingPage';

function Dashboard({ user }) {
  const [stats, setStats] = useState({
    total: 0,
    open: 0,
    assigned: 0,
    resolved: 0
  });
  const [recentIssues, setRecentIssues] = useState([]);
  const [users, setUsers] = useState([]);
  const [developers, setDevelopers] = useState([]);
  const navigate = useNavigate();

  const getUserName = (userId) => {
    const foundUser = users.find(u => u.id === userId);
    return foundUser ? foundUser.fullname : `User #${userId}`;
  };

  const getDeveloperName = (devId) => {
    const foundDev = developers.find(d => d.id === devId);
    return foundDev ? foundDev.fullname : `Developer #${devId}`;
  };

  const loadDashboardData = useCallback(async () => {
    if (!user) return;

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

      let issues = [];
      
      if (user.role === 1) {
        const result = await getMyIssues();
        if (result.code === 200) {
          issues = result.issues || [];
        }
      } else if (user.role === 2) {
        const result = await getAssignedToMe();
        if (result.code === 200) {
          issues = result.issues || [];
        }
      } else if (user.role === 3) {
        const result = await getAllIssues();
        if (result.code === 200) {
          issues = result.issues || [];
        }
      }
      
      const openCount = issues.filter(i => i.status === 'open').length;
      const assignedCount = issues.filter(i => i.status === 'assigned').length;
      const resolvedCount = issues.filter(i => i.status === 'resolved').length;
      
      setStats({
        total: issues.length,
        open: openCount,
        assigned: assignedCount,
        resolved: resolvedCount
      });
      
      // Get 3 most recent issues
      const sortedByDate = [...issues].sort((a, b) => 
        new Date(b.createdDate) - new Date(a.createdDate)
      );
      setRecentIssues(sortedByDate.slice(0, 3));
    } catch (error) {
      console.error('Error loading dashboard:', error);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      loadDashboardData();
      const interval = setInterval(loadDashboardData, 30000);
      return () => clearInterval(interval);
    }
  }, [user, loadDashboardData]);

  if (!user) {
    return <LandingPage user={user} />;
  }

  const getStatCards = () => {
    if (user.role === 1) {
      return [
        { title: 'Total Issues', value: stats.total, color: '#3b82f6', icon: '📊', onClick: () => navigate('/my-issues') },
        { title: 'Open', value: stats.open, color: '#ef4444', icon: '🟡', onClick: () => navigate('/my-issues') },
        { title: 'Resolved', value: stats.resolved, color: '#10b981', icon: '✅', onClick: () => navigate('/my-issues') },
      ];
    } else if (user.role === 2) {
      return [
        { title: 'My Tasks', value: stats.total, color: '#3b82f6', icon: '📋', onClick: () => navigate('/assigned-issues') },
        { title: 'In Progress', value: stats.open, color: '#f59e0b', icon: '🔄', onClick: () => navigate('/assigned-issues') },
        { title: 'Completed', value: stats.resolved, color: '#10b981', icon: '✅', onClick: () => navigate('/assigned-issues') },
      ];
    } else {
      return [
        { title: 'Total Issues', value: stats.total, color: '#3b82f6', icon: '📊', onClick: () => navigate('/all-issues') },
        { title: 'Open', value: stats.open, color: '#ef4444', icon: '🟡', onClick: () => navigate('/all-issues') },
        { title: 'Assigned', value: stats.assigned, color: '#f59e0b', icon: '📋', onClick: () => navigate('/all-issues') },
        { title: 'Resolved', value: stats.resolved, color: '#10b981', icon: '✅', onClick: () => navigate('/all-issues') },
      ];
    }
  };

  return (
    <div>
      <div className="dashboard-header">
        <h1>Welcome back, {user.fullname}! 🎉</h1>
        <p>Here's what's happening with your issues today.</p>
      </div>

      <div className="dashboard-stats">
        {getStatCards().map((card, index) => (
          <div key={index} className="stat-card" onClick={card.onClick} style={{ borderTop: `4px solid ${card.color}` }}>
            <div className="stat-icon">{card.icon}</div>
            <div>
              <h3>{card.title}</h3>
              <div className="stat-value">{card.value}</div>
            </div>
          </div>
        ))}
      </div>

      {recentIssues.length > 0 && (
        <div className="content-card">
          <h2>📋 Recent Issues</h2>
          {recentIssues.map(issue => (
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
                {issue.description?.substring(0, 100)}...
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
                {issue.assignedTo && (
                  <div className="meta-item">
                    <span className="meta-label">👨‍💻 Assigned to:</span>
                    <span className="meta-value">{getDeveloperName(issue.assignedTo)}</span>
                  </div>
                )}
                <div className="meta-item">
                  <span className="meta-label">👤 Created by:</span>
                  <span className="meta-value">{getUserName(issue.createdBy)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Dashboard;
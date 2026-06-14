import React, { useState, useEffect } from 'react';
import { getUserInfo } from '../api';

function Profile({ user }) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const result = await getUserInfo();
      if (result.code === 200) {
        setProfile(result);
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRoleName = (role) => {
    switch(role) {
      case 1: return 'User';
      case 2: return 'Developer';
      case 3: return 'Admin';
      default: return 'User';
    }
  };

  if (loading) {
    return (
      <div className="dashboard">
        <div className="content-card">
          <p>Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>My Profile</h1>
        <p>View and manage your account information</p>
      </div>

      <div className="profile-container">
        <div className="profile-header">
          <div className="profile-avatar-large">
            {user?.fullname?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div className="profile-name-section">
            <h2>{profile?.fullname || user?.fullname}</h2>
            <span className="profile-role-badge">{getRoleName(profile?.role || user?.role)}</span>
          </div>
        </div>

        <div className="profile-info-grid">
          <div className="info-card">
            <div className="info-label">📧 Email Address</div>
            <div className="info-value">{profile?.username || user?.email || 'Not provided'}</div>
          </div>
          <div className="info-card">
            <div className="info-label">🆔 User ID</div>
            <div className="info-value">{profile?.userId || user?.userId || 'Not provided'}</div>
          </div>
          <div className="info-card">
            <div className="info-label">👤 Full Name</div>
            <div className="info-value">{profile?.fullname || user?.fullname || 'Not provided'}</div>
          </div>
          <div className="info-card">
            <div className="info-label">🎭 Role</div>
            <div className="info-value">{getRoleName(profile?.role || user?.role)}</div>
          </div>
          <div className="info-card">
            <div className="info-label">📅 Member Since</div>
            <div className="info-value">{new Date().toLocaleDateString()}</div>
          </div>
          <div className="info-card">
            <div className="info-label">🔐 Account Status</div>
            <div className="info-value status-active">Active</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;
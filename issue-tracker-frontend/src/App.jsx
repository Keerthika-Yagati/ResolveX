import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import SignIn from './components/SignIn';
import SignUp from './components/SignUp';
import Dashboard from './components/Dashboard';
import CreateIssue from './components/CreateIssue';
import MyIssues from './components/MyIssues';
import AllIssues from './components/AllIssues';
import AssignedIssues from './components/AssignedIssues';
import IssueDetails from './components/IssueDetails';
import Notifications from './components/Notifications';
import Profile from './components/Profile';
import UserManager from './components/UserManager';
import LandingPage from './components/LandingPage';
import PrivateRoute from './components/PrivateRoute';
import { getUserInfo } from './api';
import './index.css';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      loadUserInfo();
    } else {
      setLoading(false);
    }
  }, []);

  const loadUserInfo = async () => {
    try {
      const result = await getUserInfo();
      if (result.code === 200) {
        const userData = {
          fullname: result.fullname,
          role: result.role,
          userId: result.userId,
          username: result.username || result.email,
          email: result.email,
          menulist: result.menulist,
        };
        setUser(userData);
        localStorage.setItem('userInfo', JSON.stringify({
          userId: result.userId,
          fullname: result.fullname,
          role: result.role,
          username: result.username || result.email,
          email: result.email
        }));
      } else {
        localStorage.removeItem('token');
        localStorage.removeItem('userInfo');
      }
    } catch (error) {
      console.error('Error loading user:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userInfo');
    setUser(null);
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loader"></div>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <Router>
      <div className="app">
        {/* Only show sidebar when user is logged in */}
        {user && <Navbar user={user} onLogout={handleLogout} />}
        <div className={user ? "main-content" : "full-width-content"}>
          <Routes>
            <Route path="/" element={<LandingPage user={user} />} />
            <Route path="/signin" element={<SignIn onLogin={setUser} />} />
            <Route path="/signup" element={<SignUp />} />
            
            <Route path="/dashboard" element={
              <PrivateRoute user={user}>
                <Dashboard user={user} />
              </PrivateRoute>
            } />
            
            <Route path="/create-issue" element={
              <PrivateRoute user={user}>
                <CreateIssue user={user} />
              </PrivateRoute>
            } />
            
            <Route path="/my-issues" element={
              <PrivateRoute user={user}>
                <MyIssues user={user} />
              </PrivateRoute>
            } />
            
            <Route path="/all-issues" element={
              <PrivateRoute user={user} requiredRole={3}>
                <AllIssues user={user} />
              </PrivateRoute>
            } />
            
            <Route path="/assigned-issues" element={
              <PrivateRoute user={user} requiredRole={2}>
                <AssignedIssues user={user} />
              </PrivateRoute>
            } />
            
            <Route path="/issue/:id" element={
              <PrivateRoute user={user}>
                <IssueDetails user={user} />
              </PrivateRoute>
            } />
            
            <Route path="/notifications" element={
              <PrivateRoute user={user}>
                <Notifications user={user} />
              </PrivateRoute>
            } />
            
            <Route path="/profile" element={
              <PrivateRoute user={user}>
                <Profile user={user} />
              </PrivateRoute>
            } />
            
            <Route path="/user-manager" element={
              <PrivateRoute user={user} requiredRole={3}>
                <UserManager user={user} />
              </PrivateRoute>
            } />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
import React from 'react';
import { useNavigate } from 'react-router-dom';

function LandingPage({ user }) {
  const navigate = useNavigate();

  const features = [
    { icon: '🎯', title: 'Smart Issue Tracking', description: 'Create, track, and manage issues efficiently with our powerful issue tracking system.' },
    { icon: '🤝', title: 'Team Collaboration', description: 'Assign issues to developers, add comments, and work together to resolve problems.' },
    { icon: '📊', title: 'Real-time Analytics', description: 'Get insights with real-time analytics and status tracking for all your issues.' },
    { icon: '🔔', title: 'Smart Notifications', description: 'Stay updated with instant notifications when issues are assigned or status changes.' },
    { icon: '📜', title: 'Complete History', description: 'Full history of all changes made to each issue for complete transparency.' },
    { icon: '🔒', title: 'Secure Access', description: 'Role-based access control ensures only authorized users can access sensitive data.' },
  ];

  // If user is already logged in, redirect to dashboard
  if (user) {
    navigate('/dashboard');
    return null;
  }

  return (
    <div className="landing-page">
      <div className="hero-section">
        <div className="hero-badge">🚀 Welcome to ResolveX</div>
        <h1>Your Complete Issue <span className="highlight">Resolution</span> Platform</h1>
        <p>The ultimate solution for tracking, managing, and resolving issues in your development workflow.</p>
        <div className="cta-buttons">
          <button onClick={() => navigate('/signup')} className="btn-primary">
            Get Started Free 
          </button>
          <button onClick={() => navigate('/signin')} className="btn-outline">
            Sign In
          </button>
        </div>
      </div>

      <div className="features-section">
        <h2>Powerful Features for Modern Teams</h2>
        <div className="features-grid">
          {features.map((feature, index) => (
            <div key={index} className="feature-card">
              <div className="feature-icon">{feature.icon}</div>
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="stats-section">
        <div>
          <div className="stat-number">1000+</div>
          <div className="stat-label">Active Users</div>
        </div>
        <div>
          <div className="stat-number">10K+</div>
          <div className="stat-label">Issues Resolved</div>
        </div>
        <div>
          <div className="stat-number">98%</div>
          <div className="stat-label">Satisfaction Rate</div>
        </div>
        <div>
          <div className="stat-number">24/7</div>
          <div className="stat-label">Support</div>
        </div>
      </div>

      <div className="cta-section">
        <h2>Ready to streamline your issue management?</h2>
        <p>Join thousands of teams who use ResolveX to deliver better software faster.</p>
        <button onClick={() => navigate('/signup')} className="btn-primary">
          Create Free Account 
        </button>
      </div>
    </div>
  );
}

export default LandingPage;
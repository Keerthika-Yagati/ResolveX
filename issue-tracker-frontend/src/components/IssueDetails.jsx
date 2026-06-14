import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getIssueById, getIssueComments, addComment, getIssueHistory } from '../api';

function IssueDetails({ user }) {
    const { id } = useParams();
    const navigate = useNavigate();
    const [issue, setIssue] = useState(null);
    const [comments, setComments] = useState([]);
    const [history, setHistory] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('comments');
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        loadIssueDetails();
        // Debug: Log user data when component mounts
        console.log('IssueDetails - User prop:', user);
        console.log('IssueDetails - localStorage userInfo:', localStorage.getItem('userInfo'));
    }, [id]);

    const loadIssueDetails = async () => {
        setLoading(true);
        try {
            const [issueRes, commentsRes, historyRes] = await Promise.all([
                getIssueById(id),
                getIssueComments(id),
                getIssueHistory(id)
            ]);
            
            if (issueRes.code === 200) {
                setIssue(issueRes.issue);
            }
            if (commentsRes.code === 200) {
                setComments(commentsRes.comments || []);
            }
            if (historyRes.code === 200) {
                setHistory(historyRes.history || []);
            }
        } catch (error) {
            console.error('Error loading issue:', error);
            alert('Failed to load issue details');
        } finally {
            setLoading(false);
        }
    };

    const handleAddComment = async (e) => {
        e.preventDefault();
        if (!newComment.trim()) return;
        
        setSubmitting(true);
        
        // Try to get user info from multiple sources
        let userId = null;
        let userEmail = null;
        let userFullname = null;
        
        // Source 1: user prop from App.js
        if (user) {
            userId = user.userId;
            userEmail = user.email || user.username;
            userFullname = user.fullname;
            console.log('Source 1 (user prop):', { userId, userEmail, userFullname });
        }
        
        // Source 2: localStorage userInfo
        const storedUserInfo = localStorage.getItem('userInfo');
        if (storedUserInfo) {
            const parsedInfo = JSON.parse(storedUserInfo);
            if (!userId) userId = parsedInfo.userId;
            if (!userEmail) userEmail = parsedInfo.email || parsedInfo.username;
            if (!userFullname) userFullname = parsedInfo.fullname;
            console.log('Source 2 (localStorage):', parsedInfo);
        }
        
        // Source 3: Try to get from token or make a new API call
        if (!userId) {
            console.log('No userId found, trying to fetch fresh user info...');
            try {
                const { getUserInfo } = await import('../api');
                const freshUserInfo = await getUserInfo();
                if (freshUserInfo.code === 200) {
                    userId = freshUserInfo.userId;
                    userEmail = freshUserInfo.email || freshUserInfo.username;
                    userFullname = freshUserInfo.fullname;
                    console.log('Source 3 (fresh API call):', { userId, userEmail, userFullname });
                }
            } catch (err) {
                console.error('Failed to fetch fresh user info:', err);
            }
        }
        
        // Final validation
        console.log('Final data being sent:', {
            issueId: parseInt(id),
            comment: newComment,
            userId: userId,
            userEmail: userEmail,
            userFullname: userFullname
        });
        
        if (!userId) {
            alert('User information not found. Please logout and login again.');
            setSubmitting(false);
            return;
        }
        
        try {
            const result = await addComment({
                issueId: parseInt(id),
                comment: newComment,
                userId: Number(userId),  // Ensure it's a number
                userEmail: userEmail || 'user@example.com',
                userFullname: userFullname || 'User'
            });
            
            console.log('Comment API response:', result);
            
            if (result.code === 200) {
                setNewComment('');
                await loadIssueDetails();
                alert('Comment added successfully!');
            } else {
                alert(result.message || 'Failed to add comment');
            }
        } catch (error) {
            console.error('Error adding comment:', error);
            alert('Network error. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    // Rest of your component remains the same...
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

    if (loading) {
        return (
            <div className="dashboard">
                <div className="content-section">
                    <p>Loading issue details...</p>
                </div>
            </div>
        );
    }

    if (!issue) {
        return (
            <div className="dashboard">
                <div className="content-section">
                    <p>Issue not found</p>
                    <button onClick={() => navigate('/')} className="btn-primary">Go Back</button>
                </div>
            </div>
        );
    }

    return (
        <div className="dashboard">
            <div className="content-section">
                <button onClick={() => navigate(-1)} className="btn-secondary" style={{ marginBottom: '1rem' }}>
                    ← Back to Issues
                </button>
                
                <div style={{ marginBottom: '2rem' }}>
                    <h2>Issue #{issue.id}: {issue.title}</h2>
                    <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem', flexWrap: 'wrap' }}>
                        <span style={{ 
                            padding: '0.25rem 0.75rem', 
                            borderRadius: '20px', 
                            backgroundColor: getPriorityColor(issue.priority),
                            color: 'white'
                        }}>
                            Priority: {issue.priority.toUpperCase()}
                        </span>
                        <span style={{ 
                            padding: '0.25rem 0.75rem', 
                            borderRadius: '20px', 
                            backgroundColor: getStatusColor(issue.status),
                            color: 'white'
                        }}>
                            Status: {issue.status.toUpperCase()}
                        </span>
                        <span>📅 Created: {new Date(issue.createdDate).toLocaleString()}</span>
                        <span>👤 Created By: User #{issue.createdBy}</span>
                        {issue.assignedTo && <span>👨‍💻 Assigned To: Developer #{issue.assignedTo}</span>}
                    </div>
                </div>

                <div style={{ marginBottom: '2rem', padding: '1rem', background: '#f9f9f9', borderRadius: '10px' }}>
                    <h3>Description</h3>
                    <p style={{ marginTop: '0.5rem', lineHeight: '1.6' }}>{issue.description}</p>
                </div>

                <div style={{ marginBottom: '1rem', borderBottom: '2px solid #e0e0e0', display: 'flex', gap: '0.5rem' }}>
                    <button
                        onClick={() => setActiveTab('comments')}
                        style={{
                            padding: '0.75rem 1.5rem',
                            border: 'none',
                            background: activeTab === 'comments' ? '#667eea' : 'transparent',
                            color: activeTab === 'comments' ? 'white' : '#333',
                            cursor: 'pointer',
                            borderRadius: '8px 8px 0 0',
                            fontWeight: 'bold'
                        }}
                    >
                        💬 Comments ({comments.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('history')}
                        style={{
                            padding: '0.75rem 1.5rem',
                            border: 'none',
                            background: activeTab === 'history' ? '#667eea' : 'transparent',
                            color: activeTab === 'history' ? 'white' : '#333',
                            cursor: 'pointer',
                            borderRadius: '8px 8px 0 0',
                            fontWeight: 'bold'
                        }}
                    >
                        📜 History ({history.length})
                    </button>
                </div>

                {activeTab === 'comments' && (
                    <div>
                        {user && (
                            <form onSubmit={handleAddComment} style={{ marginBottom: '2rem', padding: '1rem', background: '#f9f9f9', borderRadius: '10px' }}>
                                <h3>Add a Comment</h3>
                                <div className="form-group">
                                    <textarea
                                        value={newComment}
                                        onChange={(e) => setNewComment(e.target.value)}
                                        rows="3"
                                        placeholder="Write your comment here..."
                                        required
                                        style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #ddd' }}
                                    />
                                </div>
                                <button type="submit" className="btn-primary" disabled={submitting}>
                                    {submitting ? 'Posting...' : 'Post Comment'}
                                </button>
                            </form>
                        )}

                        <div>
                            <h3>All Comments</h3>
                            {comments.length === 0 ? (
                                <p style={{ textAlign: 'center', padding: '2rem', color: '#999' }}>
                                    No comments yet. Be the first to comment!
                                </p>
                            ) : (
                                comments.map(comment => (
                                    <div key={comment._id} style={{ 
                                        background: '#fff', 
                                        border: '1px solid #e0e0e0',
                                        borderRadius: '10px', 
                                        padding: '1rem', 
                                        marginBottom: '1rem',
                                        boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                                    }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                            <strong style={{ color: '#667eea' }}>👤 {comment.userFullname || comment.userEmail}</strong>
                                            <small style={{ color: '#999' }}>{new Date(comment.createdAt).toLocaleString()}</small>
                                        </div>
                                        <p style={{ margin: '0.5rem 0', lineHeight: '1.5' }}>{comment.comment}</p>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                )}

                {activeTab === 'history' && (
                    <div>
                        {history.length === 0 ? (
                            <p style={{ textAlign: 'center', padding: '2rem', color: '#999' }}>
                                No history available for this issue.
                            </p>
                        ) : (
                            history.map((item, index) => (
                                <div key={index} style={{ 
                                    background: '#fff', 
                                    borderLeft: `3px solid ${item.action === 'CREATED' ? '#28a745' : item.action === 'ASSIGNED' ? '#ff9800' : '#667eea'}`,
                                    borderRadius: '10px', 
                                    padding: '1rem', 
                                    marginBottom: '1rem',
                                    boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                                }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                        <strong style={{ color: '#764ba2' }}>
                                            {item.action === 'CREATED' && '📝 Issue Created'}
                                            {item.action === 'ASSIGNED' && '👨‍💻 Issue Assigned'}
                                            {item.action === 'STATUS_CHANGED' && '🔄 Status Changed'}
                                            {item.action === 'CLOSED' && '✅ Issue Closed'}
                                        </strong>
                                        <small style={{ color: '#999' }}>{new Date(item.changedAt).toLocaleString()}</small>
                                    </div>
                                    {item.oldStatus && item.newStatus && (
                                        <p style={{ margin: '0.25rem 0' }}>
                                            Status changed from <strong>{item.oldStatus}</strong> to <strong>{item.newStatus}</strong>
                                        </p>
                                    )}
                                    {item.assignedTo && (
                                        <p style={{ margin: '0.25rem 0' }}>
                                            Assigned to Developer #{item.assignedTo}
                                        </p>
                                    )}
                                    <small style={{ color: '#666' }}>By: {item.changedBy}</small>
                                </div>
                            ))
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

export default IssueDetails;
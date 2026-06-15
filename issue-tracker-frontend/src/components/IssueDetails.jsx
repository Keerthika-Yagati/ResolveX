import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getIssueById, getIssueComments, addComment, getIssueHistory, deleteComment, editComment } from '../api';

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
    const [editingCommentId, setEditingCommentId] = useState(null);
    const [editingCommentText, setEditingCommentText] = useState('');

    useEffect(() => {
        loadIssueDetails();
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
        
        let userId = null;
        let userEmail = null;
        let userFullname = null;
        
        if (user) {
            userId = user.userId;
            userEmail = user.email || user.username;
            userFullname = user.fullname;
        }
        
        const storedUserInfo = localStorage.getItem('userInfo');
        if (storedUserInfo) {
            const parsedInfo = JSON.parse(storedUserInfo);
            if (!userId) userId = parsedInfo.userId;
            if (!userEmail) userEmail = parsedInfo.email || parsedInfo.username;
            if (!userFullname) userFullname = parsedInfo.fullname;
        }
        
        if (!userId) {
            alert('User information not found. Please logout and login again.');
            setSubmitting(false);
            return;
        }
        
        try {
            const result = await addComment({
                issueId: parseInt(id),
                comment: newComment,
                userId: Number(userId),
                userEmail: userEmail || 'user@example.com',
                userFullname: userFullname || 'User'
            });
            
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

    const handleDeleteComment = async (commentId, e) => {
        e.stopPropagation();
        if (window.confirm('Are you sure you want to delete this comment?')) {
            try {
                const result = await deleteComment(commentId);
                if (result.code === 200) {
                    await loadIssueDetails();
                    alert('Comment deleted successfully!');
                } else {
                    alert(result.message || 'Failed to delete comment');
                }
            } catch (error) {
                alert('Network error. Please try again.');
            }
        }
    };

    const handleStartEdit = (comment, e) => {
        e.stopPropagation();
        setEditingCommentId(comment._id);
        setEditingCommentText(comment.comment);
    };

    const handleCancelEdit = (e) => {
        e.stopPropagation();
        setEditingCommentId(null);
        setEditingCommentText('');
    };

    const handleSaveEdit = async (commentId, e) => {
        e.stopPropagation();
        if (!editingCommentText.trim()) {
            alert('Comment cannot be empty');
            return;
        }
        
        try {
            const result = await editComment(commentId, editingCommentText);
            if (result.code === 200) {
                await loadIssueDetails();
                setEditingCommentId(null);
                setEditingCommentText('');
                alert('Comment updated successfully!');
            } else {
                alert(result.message || 'Failed to update comment');
            }
        } catch (error) {
            alert('Network error. Please try again.');
        }
    };

    const canModifyComment = (comment) => {
        if (!user) return false;
        return user.role === 3 || comment.userId === user.userId;
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

    if (loading) {
        return (
            <div className="dashboard">
                <div className="content-card">
                    <p>Loading issue details...</p>
                </div>
            </div>
        );
    }

    if (!issue) {
        return (
            <div className="dashboard">
                <div className="content-card">
                    <p>Issue not found</p>
                    <button onClick={() => navigate('/')} className="btn-primary">Go Back</button>
                </div>
            </div>
        );
    }

    return (
        <div className="dashboard">
            <div className="content-card">
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
                        <span>👤 Created By: {issue.createdBy === user?.userId ? 'You' : `User #${issue.createdBy}`}</span>
                        {issue.assignedTo && <span>👨‍💻 Assigned To: {issue.assignedTo === user?.userId ? 'You' : `Developer #${issue.assignedTo}`}</span>}
                    </div>
                </div>

                <div style={{ marginBottom: '2rem', padding: '1rem', background: '#f8fafc', borderRadius: '10px' }}>
                    <h3>Description</h3>
                    <p style={{ marginTop: '0.5rem', lineHeight: '1.6' }}>{issue.description}</p>
                </div>

                <div style={{ marginBottom: '1rem', borderBottom: '2px solid #e5e7eb', display: 'flex', gap: '0.5rem' }}>
                    <button
                        onClick={() => setActiveTab('comments')}
                        style={{
                            padding: '0.75rem 1.5rem',
                            border: 'none',
                            background: activeTab === 'comments' ? '#3b82f6' : 'transparent',
                            color: activeTab === 'comments' ? 'white' : '#1e293b',
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
                            background: activeTab === 'history' ? '#3b82f6' : 'transparent',
                            color: activeTab === 'history' ? 'white' : '#1e293b',
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
                            <form onSubmit={handleAddComment} style={{ marginBottom: '2rem', padding: '1rem', background: '#f8fafc', borderRadius: '10px' }}>
                                <h3>Add a Comment</h3>
                                <div className="form-group">
                                    <textarea
                                        value={newComment}
                                        onChange={(e) => setNewComment(e.target.value)}
                                        rows="3"
                                        placeholder="Write your comment here..."
                                        required
                                        style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}
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
                                <p style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>
                                    No comments yet. Be the first to comment!
                                </p>
                            ) : (
                                comments.map(comment => {
                                    const canModify = canModifyComment(comment);
                                    const isEditing = editingCommentId === comment._id;
                                    
                                    return (
                                        <div key={comment._id} style={{ 
                                            background: '#fff', 
                                            border: '1px solid #e2e8f0',
                                            borderRadius: '10px', 
                                            padding: '1rem', 
                                            marginBottom: '1rem',
                                            boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                                        }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                                                <strong style={{ color: '#3b82f6' }}>👤 {comment.userFullname || comment.userEmail}</strong>
                                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                    <small style={{ color: '#94a3b8' }}>{new Date(comment.createdAt).toLocaleString()}</small>
                                                    {canModify && !isEditing && (
                                                        <>
                                                            <button 
                                                                onClick={(e) => handleStartEdit(comment, e)}
                                                                style={{ background: 'none', border: 'none', color: '#f59e0b', cursor: 'pointer', fontSize: '0.75rem' }}
                                                            >
                                                                ✏️ Edit
                                                            </button>
                                                            <button 
                                                                onClick={(e) => handleDeleteComment(comment._id, e)}
                                                                style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '0.75rem' }}
                                                            >
                                                                🗑️ Delete
                                                            </button>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                            
                                            {isEditing ? (
                                                <div>
                                                    <textarea
                                                        value={editingCommentText}
                                                        onChange={(e) => setEditingCommentText(e.target.value)}
                                                        rows="3"
                                                        style={{ width: '100%', padding: '0.5rem', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '0.5rem' }}
                                                    />
                                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                        <button onClick={(e) => handleSaveEdit(comment._id, e)} className="btn-primary-sm">Save</button>
                                                        <button onClick={handleCancelEdit} className="btn-secondary-sm">Cancel</button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <p style={{ margin: '0.5rem 0', lineHeight: '1.5', color: '#1e293b' }}>{comment.comment}</p>
                                            )}
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>
                )}

                {activeTab === 'history' && (
                    <div>
                        {history.length === 0 ? (
                            <p style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>
                                No history available for this issue.
                            </p>
                        ) : (
                            history.map((item, index) => (
                                <div key={index} style={{ 
                                    background: '#f8fafc', 
                                    borderLeft: `3px solid ${item.action === 'CREATED' ? '#10b981' : item.action === 'ASSIGNED' ? '#f59e0b' : '#3b82f6'}`,
                                    borderRadius: '10px', 
                                    padding: '1rem', 
                                    marginBottom: '1rem'
                                }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                        <strong style={{ color: '#1e293b' }}>
                                            {item.action === 'CREATED' && '📝 Issue Created'}
                                            {item.action === 'ASSIGNED' && '👨‍💻 Issue Assigned'}
                                            {item.action === 'STATUS_CHANGED' && '🔄 Status Changed'}
                                            {item.action === 'CLOSED' && '✅ Issue Closed'}
                                        </strong>
                                        <small style={{ color: '#94a3b8' }}>{new Date(item.changedAt).toLocaleString()}</small>
                                    </div>
                                    {item.oldStatus && item.newStatus && (
                                        <p style={{ margin: '0.25rem 0', fontSize: '0.9rem' }}>
                                            Status changed from <strong>{item.oldStatus}</strong> to <strong>{item.newStatus}</strong>
                                        </p>
                                    )}
                                    {item.assignedTo && (
                                        <p style={{ margin: '0.25rem 0', fontSize: '0.9rem' }}>
                                            Assigned to Developer #{item.assignedTo}
                                        </p>
                                    )}
                                    <small style={{ color: '#64748b' }}>By: {item.changedBy}</small>
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
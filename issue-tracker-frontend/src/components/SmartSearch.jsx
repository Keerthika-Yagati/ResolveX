import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function SmartSearch() {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showResults, setShowResults] = useState(false);
    const navigate = useNavigate();

    const handleSearch = async () => {
        if (!query.trim()) {
            alert('Please describe your issue or problem');
            return;
        }

        setLoading(true);
        setShowResults(true);

        try {
            const token = localStorage.getItem('token');
            console.log('Searching for:', query);
            
            const response = await fetch(
                `http://localhost:8000/mongoservice/comment/vectorsearch/${encodeURIComponent(query)}`,
                {
                    headers: {
                        'Token': token,
                        'Content-Type': 'application/json'
                    }
                }
            );
            const data = await response.json();
            console.log('Search results:', data);

            if (data.code === 200) {
                // Extract results properly
                let searchResults = [];
                if (data.results && Array.isArray(data.results)) {
                    searchResults = data.results;
                } else if (data.similarComments && Array.isArray(data.similarComments)) {
                    searchResults = data.similarComments;
                } else if (Array.isArray(data)) {
                    searchResults = data;
                }
                
                // Filter out results without similarity scores and empty comments
                const validResults = searchResults.filter(item => {
                    // Get similarity score (handles both direct and nested formats)
                    let similarity = item.similarity || item.score;
                    if (!similarity && item._doc) {
                        similarity = item._doc.similarity;
                    }
                    
                    // Get comment text
                    let commentText = item.comment || item._doc?.comment;
                    
                    // Only keep results with:
                    // 1. A valid similarity score (> 0)
                    // 2. Non-empty comment
                    // 3. Similarity is not null or undefined
                    const hasValidScore = similarity !== null && similarity !== undefined && similarity > 0;
                    const hasValidComment = commentText && commentText.trim().length > 0;
                    
                    return hasValidScore && hasValidComment;
                });
                
                // Sort by similarity score (highest first)
                validResults.sort((a, b) => {
                    let scoreA = a.similarity || a._doc?.similarity || 0;
                    let scoreB = b.similarity || b._doc?.similarity || 0;
                    return scoreB - scoreA;
                });
                
                setResults(validResults);
                console.log('Filtered results:', validResults);
                
                if (validResults.length === 0) {
                    console.log('No valid results found. All results were filtered out.');
                }
            } else {
                console.error('Search failed:', data.message);
                setResults([]);
            }
        } catch (error) {
            console.error('Search error:', error);
            alert('Network error. Please try again.');
            setResults([]);
        } finally {
            setLoading(false);
        }
    };

    // Helper function to extract comment text from various response formats
    const getCommentText = (item) => {
        return item.comment || item._doc?.comment || '';
    };

    // Helper function to get similarity score
    const getSimilarityScore = (item) => {
        let score = item.similarity || item.score;
        if (!score && item._doc) {
            score = item._doc.similarity;
        }
        if (score) return Math.round(score * 100);
        return 0;
    };

    // Helper function to get user name
    const getUserName = (item) => {
        return item.userFullname || item.user_fullname || item._doc?.userFullname || item.userEmail || 'Unknown User';
    };

    // Helper function to get issue ID
    const getIssueId = (item) => {
        return item.issueId || item.issue_id || item._doc?.issueId || 0;
    };

    // Helper function to get date
    const getDate = (item) => {
        const date = item.createdAt || item.created_at || item._doc?.createdAt;
        if (date) return new Date(date).toLocaleDateString();
        return 'Recent';
    };

    return (
        <div className="smart-search-container">
            <div className="smart-search-header">
                <h3>🔍 AI-Powered Smart Search</h3>
                <p>Describe your problem in natural language to find similar issues</p>
            </div>

            <div className="smart-search-box">
                <textarea
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Example: User cannot login to the application or Password reset not working..."
                    rows="3"
                    className="smart-search-input"
                    onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSearch()}
                />
                <button 
                    onClick={handleSearch} 
                    className="smart-search-btn"
                    disabled={loading}
                >
                    {loading ? 'Searching...' : '🔍 Find Similar Issues'}
                </button>
            </div>

            {showResults && (
                <div className="smart-search-results">
                    <h4>Similar Issues Found ({results.length})</h4>
                    
                    {results.length === 0 && !loading && (
                        <div className="no-results">
                            <p>No similar issues found.</p>
                            <p>Try different keywords or create a new issue.</p>
                            <p className="no-results-hint">💡 Hint: Try searching for "login problem", "authentication error", or "database connection"</p>
                        </div>
                    )}

                    {results.map((item, index) => {
                        const commentText = getCommentText(item);
                        const similarity = getSimilarityScore(item);
                        const userName = getUserName(item);
                        const issueId = getIssueId(item);
                        const date = getDate(item);
                        
                        return (
                            <div 
                                key={item._id || index} 
                                className="smart-result-card"
                                onClick={() => navigate(`/issue/${issueId}`)}
                            >
                                <div className="result-header">
                                    <span className={`similarity-badge ${similarity >= 70 ? 'high-match' : similarity >= 50 ? 'medium-match' : 'low-match'}`}>
                                        {similarity}% match
                                    </span>
                                    <span className="result-issue-id">Issue #{issueId}</span>
                                </div>
                                <div className="result-comment">
                                    <strong>💬 Comment:</strong> "{commentText.substring(0, 200)}"
                                </div>
                                <div className="result-user">
                                    <small>👤 By: {userName}</small>
                                </div>
                                <div className="result-date">
                                    <small>📅 {date}</small>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

export default SmartSearch;
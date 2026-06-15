const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// Helper to get token from localStorage
const getToken = () => localStorage.getItem('token');

// Helper for API calls with token
const apiRequest = async (endpoint, options = {}) => {
  const token = getToken();
  
  const config = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Token': token }),
      ...options.headers,
    },
  };

  try {
    const response = await fetch(`${API_URL}${endpoint}`, config);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('API Error:', error);
    return { code: 500, message: error.message };
  }
};

// ========== AUTH SERVICES ==========
export const signup = async (userData) => {
  return apiRequest('/authservice/signup', {
    method: 'POST',
    body: JSON.stringify(userData),
  });
};

export const signin = async (credentials) => {
  const result = await apiRequest('/authservice/signin', {
    method: 'POST',
    body: JSON.stringify(credentials),
  });
  
  if (result.code === 200 && result.jwt) {
    localStorage.setItem('token', result.jwt);
  }
  return result;
};

export const getUserInfo = async () => {
  const result = await apiRequest('/authservice/uinfo', {
    method: 'GET',
  });
  
  if (result.code === 200) {
    localStorage.setItem('userInfo', JSON.stringify({
      userId: result.userId,
      fullname: result.fullname,
      role: result.role,
      username: result.username || result.email,
      email: result.email
    }));
  }
  
  return result;
};

export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('userInfo');
};

export const getAllDevelopers = async () => {
  return apiRequest('/authservice/getalldevelopers', {
    method: 'GET',
  });
};

// ========== ISSUE SERVICES ==========
export const createIssue = async (issueData) => {
  return apiRequest('/issueservice/create', {
    method: 'POST',
    body: JSON.stringify(issueData),
  });
};

export const getMyIssues = async () => {
  return apiRequest('/issueservice/myissues', {
    method: 'GET',
  });
};

export const getAllIssues = async () => {
  return apiRequest('/issueservice/allissues', {
    method: 'GET',
  });
};

export const getAssignedToMe = async () => {
  return apiRequest('/issueservice/assignedtome', {
    method: 'GET',
  });
};

export const assignIssue = async (issueId, developerId) => {
  return apiRequest(`/issueservice/assign/${issueId}`, {
    method: 'PUT',
    body: JSON.stringify({ developerId }),
  });
};

export const updateIssueStatus = async (issueId, status) => {
  return apiRequest(`/issueservice/updatestatus/${issueId}`, {
    method: 'PUT',
    body: JSON.stringify({ status }),
  });
};

export const closeIssue = async (issueId) => {
  return apiRequest(`/issueservice/close/${issueId}`, {
    method: 'PUT',
  });
};

export const getIssueById = async (issueId) => {
  return apiRequest(`/issueservice/getissue/${issueId}`, {
    method: 'GET',
  });
};

// ========== USER SERVICES ==========
export const getAllUsers = async (page = 1, size = 10) => {
  return apiRequest(`/authservice/getallusers/${page}/${size}`, {
    method: 'GET',
  });
};

export const updateUser = async (userId, userData) => {
  return apiRequest(`/authservice/updateuser/${userId}`, {
    method: 'PUT',
    body: JSON.stringify(userData),
  });
};

export const deleteUser = async (userId) => {
  return apiRequest(`/authservice/deleteuser/${userId}`, {
    method: 'DELETE',
  });
};

// ========== COMMENT SERVICES ==========
export const addComment = async (commentData) => {
  return apiRequest('/mongoservice/comment/add', {
    method: 'POST',
    body: JSON.stringify(commentData),
  });
};

export const getIssueComments = async (issueId) => {
  return apiRequest(`/mongoservice/comment/issue/${issueId}`, {
    method: 'GET',
  });
};

export const deleteComment = async (commentId) => {
  return apiRequest(`/mongoservice/comment/${commentId}`, {
    method: 'DELETE',
  });
};

// NEW: Edit comment
export const editComment = async (commentId, newComment) => {
  return apiRequest(`/mongoservice/comment/${commentId}`, {
    method: 'PUT',
    body: JSON.stringify({ comment: newComment }),
  });
};

// ========== NOTIFICATION SERVICES ==========
export const getUserNotifications = async (userId) => {
  return apiRequest(`/mongoservice/notification/user/${userId}`, {
    method: 'GET',
  });
};

export const getUnreadNotificationsCount = async (userId) => {
  return apiRequest(`/mongoservice/notification/user/${userId}/unread`, {
    method: 'GET',
  });
};

export const markNotificationRead = async (notificationId) => {
  return apiRequest(`/mongoservice/notification/read/${notificationId}`, {
    method: 'PUT',
  });
};

export const markAllNotificationsRead = async (userId) => {
  return apiRequest(`/mongoservice/notification/user/${userId}/read-all`, {
    method: 'PUT',
  });
};

export const deleteNotification = async (notificationId) => {
  return apiRequest(`/mongoservice/notification/${notificationId}`, {
    method: 'DELETE',
  });
};

// ========== HISTORY SERVICES ==========
export const getIssueHistory = async (issueId) => {
  return apiRequest(`/mongoservice/history/issue/${issueId}`, {
    method: 'GET',
  });
};

export const getAllHistory = async () => {
  return apiRequest('/mongoservice/history/all', {
    method: 'GET',
  });
};

// ========== ANALYTICS SERVICES ==========
export const getStatusSummary = async () => {
  return apiRequest('/mongoservice/analytics/status-summary', {
    method: 'GET',
  });
};

export const getPrioritySummary = async () => {
  return apiRequest('/mongoservice/analytics/priority-summary', {
    method: 'GET',
  });
};

export const getUserActivity = async () => {
  return apiRequest('/mongoservice/analytics/user-activity', {
    method: 'GET',
  });
};

export const getActivityTimeline = async (days = 7) => {
  return apiRequest(`/mongoservice/analytics/activity-timeline?days=${days}`, {
    method: 'GET',
  });
};

// ========== HELPER FUNCTIONS ==========
export const isAuthenticated = () => {
  const token = localStorage.getItem('token');
  return !!token;
};

export const getCurrentUser = () => {
  const userInfo = localStorage.getItem('userInfo');
  if (userInfo) {
    return JSON.parse(userInfo);
  }
  return null;
};

export const setAuthToken = (token) => {
  if (token) {
    localStorage.setItem('token', token);
  } else {
    localStorage.removeItem('token');
  }
};

export const clearAuthData = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('userInfo');
};

export default apiRequest;
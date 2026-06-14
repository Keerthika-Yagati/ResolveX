import Comment from "../models/Comment.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import axios from "axios";

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;
const NODE_URL = process.env.NODE_URL || "http://localhost:8002";

// Helper function to create notification
async function createNotification(userId, title, message, type, issueId, token) {
    if (!userId) return;
    
    try {
        const notificationData = {
            userId: userId,
            title: title,
            message: message,
            type: type,
            relatedIssueId: issueId,
            read: false
        };
        
        await axios.post(`${NODE_URL}/notification/create`, notificationData, {
            headers: { 'Token': token }
        });
        console.log(`Notification sent to user ${userId}: ${title}`);
    } catch (error) {
        console.error('Failed to send notification:', error.message);
    }
}

export async function addComment(data, token) {
    try {
        console.log("=== ADD COMMENT DEBUG ===");
        console.log("Received data:", data);
        
        // Verify token
        let payload = null;
        try {
            payload = jwt.verify(token, JWT_SECRET);
            console.log("Token payload:", payload);
        } catch (err) {
            console.error("Token verification failed:", err.message);
            return { code: 401, message: "Invalid or expired token" };
        }
        
        // Extract user info
        let userId = data.userId || payload.userId || payload.crid || payload.id;
        let userEmail = data.userEmail || payload.username || payload.email;
        let userFullname = data.userFullname || payload.fullname || "User";
        
        // Get issue details to know who to notify
        let issueDetails = null;
        try {
            const issueResponse = await axios.get(`http://localhost:8001/issue/getissue/${data.issueId}`, {
                headers: { 'Token': token }
            });
            issueDetails = issueResponse.data;
            console.log("Issue details:", issueDetails);
        } catch (err) {
            console.error("Failed to fetch issue details:", err.message);
        }
        
        // Create and save comment
        const commentData = {
            issueId: Number(data.issueId),
            userId: Number(userId),
            userEmail: String(userEmail),
            userFullname: String(userFullname),
            comment: String(data.comment)
        };
        
        const comment = new Comment(commentData);
        const savedComment = await comment.save();
        
        // ========== SEND NOTIFICATIONS ==========
        if (issueDetails && issueDetails.issue) {
            const issue = issueDetails.issue;
            const commenterId = Number(userId);
            const issueCreatorId = issue.createdBy;
            const assignedDevId = issue.assignedTo;
            
            // 1. Notify Issue Creator (if they are not the commenter)
            if (issueCreatorId && issueCreatorId !== commenterId) {
                await createNotification(
                    issueCreatorId,
                    "💬 New Comment on Your Issue",
                    `${userFullname} commented on your issue "${issue.title}"`,
                    "COMMENT_ADDED",
                    data.issueId,
                    token
                );
            }
            
            // 2. Notify Assigned Developer (if different from commenter and creator)
            if (assignedDevId && assignedDevId !== commenterId && assignedDevId !== issueCreatorId) {
                await createNotification(
                    assignedDevId,
                    "💬 New Comment on Assigned Issue",
                    `${userFullname} commented on issue "${issue.title}" assigned to you`,
                    "COMMENT_ADDED",
                    data.issueId,
                    token
                );
            }
            
            // 3. Notify Admins (role = 3) - optional
            // This would require fetching admin users from Spring Boot
            try {
                const adminsResponse = await axios.get('http://localhost:8001/user/getallusers/1/100', {
                    headers: { 'Token': token }
                });
                if (adminsResponse.data && adminsResponse.data.users) {
                    const admins = adminsResponse.data.users.filter(u => u.role === 3);
                    for (const admin of admins) {
                        if (admin.id !== commenterId && admin.id !== issueCreatorId && admin.id !== assignedDevId) {
                            await createNotification(
                                admin.id,
                                "💬 New Comment on Issue",
                                `${userFullname} commented on issue #${data.issueId}: "${issue.title}"`,
                                "COMMENT_ADDED",
                                data.issueId,
                                token
                            );
                        }
                    }
                }
            } catch (err) {
                console.error("Failed to notify admins:", err.message);
            }
        }
        
        console.log("Comment saved successfully with notifications sent");
        
        return { 
            code: 200, 
            message: "Comment added successfully", 
            comment: savedComment 
        };
    } catch (error) {
        console.error("Add comment error details:", error);
        return { code: 500, message: error.message };
    }
}

export async function getIssueComments(issueId, token) {
    try {
        jwt.verify(token, JWT_SECRET);
        
        const comments = await Comment.find({ issueId: parseInt(issueId) })
            .sort({ createdAt: -1 });
        
        return { 
            code: 200, 
            comments: comments,
            count: comments.length 
        };
    } catch (error) {
        console.error("Get comments error:", error);
        return { code: 500, message: error.message };
    }
}

export async function deleteComment(commentId, token) {
    try {
        const payload = jwt.verify(token, JWT_SECRET);
        
        const comment = await Comment.findById(commentId);
        
        if (!comment) {
            return { code: 404, message: "Comment not found" };
        }
        
        const userRole = payload.role;
        const isAdmin = userRole === 3;
        const isAuthor = comment.userId === (payload.userId || payload.crid);
        
        if (!isAdmin && !isAuthor) {
            return { code: 403, message: "Unauthorized to delete this comment" };
        }
        
        await Comment.findByIdAndDelete(commentId);
        
        return { code: 200, message: "Comment deleted successfully" };
    } catch (error) {
        console.error("Delete comment error:", error);
        return { code: 500, message: error.message };
    }
}
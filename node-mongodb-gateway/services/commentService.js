import Comment from "../models/Comment.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { generateVector, findSimilarItems } from "./vectorService.js";

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;

export async function addComment(data, token) {
    try {
        const payload = jwt.verify(token, JWT_SECRET);
        
        const userId = data.userId || payload.userId || payload.crid;
        const userEmail = data.userEmail || payload.username;
        const userFullname = data.userFullname || "User";
        
        // Generate vector embedding for the comment
        const vector = await generateVector(data.comment);
        
        const comment = new Comment({
            issueId: Number(data.issueId),
            userId: Number(userId),
            userEmail: String(userEmail),
            userFullname: String(userFullname),
            comment: String(data.comment),
            vector: vector  // ← Store the vector
        });
        
        const savedComment = await comment.save();
        
        return { 
            code: 200, 
            message: "Comment added successfully", 
            comment: savedComment 
        };
    } catch (error) {
        console.error("Add comment error:", error);
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

// NEW: Vector search for similar comments
export async function vectorSearch(query, token, limit = 5) {
    try {
        jwt.verify(token, JWT_SECRET);
        
        // Get all comments (in production, you'd want to filter by issue)
        const allComments = await Comment.find({});
        
        // Find similar comments using vector search
        const similarComments = await findSimilarItems(query, allComments, limit);
        
        return { 
            code: 200, 
            results: similarComments,
            count: similarComments.length 
        };
    } catch (error) {
        console.error("Vector search error:", error);
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
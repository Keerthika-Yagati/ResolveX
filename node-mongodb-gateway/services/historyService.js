import History from "../models/History.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;

export async function addHistory(data, token) {
    try {
        const payload = jwt.verify(token, JWT_SECRET);
        
        const history = new History({
            ...data,
            changedBy: payload.username,
            changedByRole: payload.role
        });
        
        await history.save();
        
        return { code: 200, message: "History recorded successfully" };
    } catch (error) {
        console.error("Add history error:", error);
        return { code: 500, message: error.message };
    }
}

export async function getIssueHistory(issueId, token) {
    try {
        jwt.verify(token, JWT_SECRET);
        
        const history = await History.find({ issueId: parseInt(issueId) })
            .sort({ changedAt: -1 });
        
        return { 
            code: 200, 
            history,
            count: history.length
        };
    } catch (error) {
        console.error("Get history error:", error);
        return { code: 500, message: error.message };
    }
}

export async function getAllHistory(token) {
    try {
        jwt.verify(token, JWT_SECRET);
        
        const history = await History.find()
            .sort({ changedAt: -1 })
            .limit(100);
        
        return { 
            code: 200, 
            history,
            count: history.length
        };
    } catch (error) {
        console.error("Get all history error:", error);
        return { code: 500, message: error.message };
    }
}
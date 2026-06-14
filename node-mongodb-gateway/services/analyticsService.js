import History from "../models/History.js";
import Notification from "../models/Notification.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;

export async function getStatusSummary(token) {
    try {
        jwt.verify(token, JWT_SECRET);
        
        const summary = await History.aggregate([
            {
                $match: { newStatus: { $exists: true, $ne: null } }
            },
            {
                $group: {
                    _id: "$newStatus",
                    count: { $sum: 1 }
                }
            },
            {
                $project: {
                    status: "$_id",
                    count: 1,
                    _id: 0
                }
            },
            { $sort: { count: -1 } }
        ]);
        
        // Default statuses if no data
        const defaultStatuses = [
            { status: "open", count: 0 },
            { status: "assigned", count: 0 },
            { status: "in-progress", count: 0 },
            { status: "resolved", count: 0 },
            { status: "closed", count: 0 }
        ];
        
        // Merge with actual data
        const result = defaultStatuses.map(defaultStatus => {
            const found = summary.find(s => s.status === defaultStatus.status);
            return found || defaultStatus;
        });
        
        return { code: 200, data: result };
    } catch (error) {
        console.error("Status summary error:", error);
        return { code: 500, message: error.message, data: [] };
    }
}

export async function getPrioritySummary(token) {
    try {
        jwt.verify(token, JWT_SECRET);
        
        // This would need priority data in history or separate collection
        // For now, return default structure
        return { 
            code: 200, 
            data: [
                { priority: "low", count: 0 },
                { priority: "medium", count: 0 },
                { priority: "high", count: 0 }
            ]
        };
    } catch (error) {
        console.error("Priority summary error:", error);
        return { code: 500, message: error.message };
    }
}

export async function getUserActivity(token) {
    try {
        jwt.verify(token, JWT_SECRET);
        
        const activity = await History.aggregate([
            {
                $group: {
                    _id: "$changedBy",
                    totalChanges: { $sum: 1 },
                    issuesWorked: { $addToSet: "$issueId" }
                }
            },
            {
                $project: {
                    user: "$_id",
                    totalChanges: 1,
                    uniqueIssues: { $size: "$issuesWorked" },
                    _id: 0
                }
            },
            { $sort: { totalChanges: -1 } },
            { $limit: 10 }
        ]);
        
        return { code: 200, data: activity };
    } catch (error) {
        console.error("User activity error:", error);
        return { code: 500, message: error.message };
    }
}

export async function getActivityTimeline(days, token) {
    try {
        jwt.verify(token, JWT_SECRET);
        
        const daysAgo = new Date();
        daysAgo.setDate(daysAgo.getDate() - parseInt(days));
        
        const timeline = await History.aggregate([
            {
                $match: {
                    changedAt: { $gte: daysAgo }
                }
            },
            {
                $group: {
                    _id: {
                        date: { $dateToString: { format: "%Y-%m-%d", date: "$changedAt" } },
                        action: "$action"
                    },
                    count: { $sum: 1 }
                }
            },
            {
                $group: {
                    _id: "$_id.date",
                    actions: {
                        $push: {
                            action: "$_id.action",
                            count: "$count"
                        }
                    }
                }
            },
            { $sort: { _id: 1 } }
        ]);
        
        return { code: 200, data: timeline };
    } catch (error) {
        console.error("Activity timeline error:", error);
        return { code: 500, message: error.message };
    }
}
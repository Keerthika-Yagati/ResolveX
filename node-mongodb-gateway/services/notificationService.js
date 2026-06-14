import Notification from "../models/Notification.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;

export async function createNotification(data, token) {
    try {
        jwt.verify(token, JWT_SECRET);
        
        const notification = new Notification(data);
        await notification.save();
        
        return { code: 200, message: "Notification created", notification };
    } catch (error) {
        console.error("Create notification error:", error);
        return { code: 500, message: error.message };
    }
}

export async function getUserNotifications(userId, token) {
    try {
        jwt.verify(token, JWT_SECRET);
        
        const notifications = await Notification.find({ userId: parseInt(userId) })
            .sort({ createdAt: -1 })
            .limit(50);
        
        const unreadCount = await Notification.countDocuments({ 
            userId: parseInt(userId), 
            read: false 
        });
        
        return { 
            code: 200, 
            notifications, 
            unreadCount,
            count: notifications.length
        };
    } catch (error) {
        console.error("Get notifications error:", error);
        return { code: 500, message: error.message };
    }
}

export async function markAsRead(notificationId, token) {
    try {
        jwt.verify(token, JWT_SECRET);
        
        const notification = await Notification.findByIdAndUpdate(
            notificationId, 
            { read: true },
            { new: true }
        );
        
        if (!notification) {
            return { code: 404, message: "Notification not found" };
        }
        
        return { code: 200, message: "Marked as read", notification };
    } catch (error) {
        console.error("Mark as read error:", error);
        return { code: 500, message: error.message };
    }
}

export async function markAllAsRead(userId, token) {
    try {
        jwt.verify(token, JWT_SECRET);
        
        const result = await Notification.updateMany(
            { userId: parseInt(userId), read: false },
            { read: true }
        );
        
        return { 
            code: 200, 
            message: "All notifications marked as read",
            updatedCount: result.modifiedCount
        };
    } catch (error) {
        console.error("Mark all as read error:", error);
        return { code: 500, message: error.message };
    }
}

export async function deleteNotification(notificationId, token) {
    try {
        jwt.verify(token, JWT_SECRET);
        
        const notification = await Notification.findByIdAndDelete(notificationId);
        
        if (!notification) {
            return { code: 404, message: "Notification not found" };
        }
        
        return { code: 200, message: "Notification deleted successfully" };
    } catch (error) {
        console.error("Delete notification error:", error);
        return { code: 500, message: error.message };
    }
}
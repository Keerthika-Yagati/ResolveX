import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { connectDB } from "./config/db.js";

// Import all controllers
import commentController from "./controllers/commentController.js";
import historyController from "./controllers/historyController.js";
import notificationController from "./controllers/notificationController.js";
import analyticsController from "./controllers/analyticsController.js";  // ADD THIS

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8002;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Connect to MongoDB
connectDB();

// Routes
app.use("/comment", commentController);
app.use("/history", historyController);
app.use("/notification", notificationController);
app.use("/analytics", analyticsController);  // ADD THIS

// Health check endpoint
app.get("/health", (req, res) => {
    res.json({ 
        status: "ok", 
        service: "Node.js MongoDB Backend",
        timestamp: new Date().toISOString()
    });
});

// Root endpoint
app.get("/", (req, res) => {
    res.json({ 
        message: "Issue Tracker - Node.js MongoDB Backend",
        endpoints: {
            comments: "/comment/*",
            history: "/history/*",
            notifications: "/notification/*",
            analytics: "/analytics/*"  // ADD THIS
        }
    });
});

// 404 handler for undefined routes
app.use((req, res) => {
    res.status(404).json({ code: 404, message: "Route not found" });
});

// Error handler
app.use((err, req, res, next) => {
    console.error("Server error:", err);
    res.status(500).json({ code: 500, message: "Internal server error" });
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Node.js MongoDB server running on port ${PORT}`);
    console.log(`📝 Health check: http://localhost:${PORT}/health`);
});
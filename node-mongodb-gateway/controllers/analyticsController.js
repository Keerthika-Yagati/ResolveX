import express from "express";
import * as analyticsService from "../services/analyticsService.js";

const router = express.Router();

router.get("/status-summary", async (req, res) => {
    const response = await analyticsService.getStatusSummary(req.headers.token);
    res.status(response.code).json(response);
});

router.get("/priority-summary", async (req, res) => {
    const response = await analyticsService.getPrioritySummary(req.headers.token);
    res.status(response.code).json(response);
});

router.get("/user-activity", async (req, res) => {
    const response = await analyticsService.getUserActivity(req.headers.token);
    res.status(response.code).json(response);
});

router.get("/activity-timeline", async (req, res) => {
    const days = req.query.days || 7;
    const response = await analyticsService.getActivityTimeline(days, req.headers.token);
    res.status(response.code).json(response);
});

export default router;
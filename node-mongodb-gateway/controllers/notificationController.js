import express from "express";
import * as notificationService from "../services/notificationService.js";

const router = express.Router();

router.post("/create", async (req, res) => {
    const response = await notificationService.createNotification(req.body, req.headers.token);
    res.status(response.code).json(response);
});

router.get("/user/:USER_ID", async (req, res) => {
    const response = await notificationService.getUserNotifications(req.params.USER_ID, req.headers.token);
    res.status(response.code).json(response);
});

router.put("/read/:NOTIFICATION_ID", async (req, res) => {
    const response = await notificationService.markAsRead(req.params.NOTIFICATION_ID, req.headers.token);
    res.status(response.code).json(response);
});

router.put("/user/:USER_ID/read-all", async (req, res) => {
    const response = await notificationService.markAllAsRead(req.params.USER_ID, req.headers.token);
    res.status(response.code).json(response);
});

router.delete("/:NOTIFICATION_ID", async (req, res) => {
    const response = await notificationService.deleteNotification(req.params.NOTIFICATION_ID, req.headers.token);
    res.status(response.code).json(response);
});

export default router;


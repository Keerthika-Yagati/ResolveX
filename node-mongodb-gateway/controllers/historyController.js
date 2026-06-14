import express from "express";
import * as historyService from "../services/historyService.js";

const router = express.Router();

router.post("/add", async (req, res) => {
    const response = await historyService.addHistory(req.body, req.headers.token);
    res.status(response.code).json(response);
});

router.get("/issue/:ISSUE_ID", async (req, res) => {
    const response = await historyService.getIssueHistory(req.params.ISSUE_ID, req.headers.token);
    res.status(response.code).json(response);
});

router.get("/all", async (req, res) => {
    const response = await historyService.getAllHistory(req.headers.token);
    res.status(response.code).json(response);
});

export default router;
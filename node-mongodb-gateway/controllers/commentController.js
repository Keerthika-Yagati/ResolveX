import express from "express";
import * as commentService from "../services/commentService.js";

const router = express.Router();

router.post("/add", async (req, res) => {
    const response = await commentService.addComment(req.body, req.headers.token);
    res.status(response.code).json(response);
});

router.get("/issue/:ISSUE_ID", async (req, res) => {
    const response = await commentService.getIssueComments(req.params.ISSUE_ID, req.headers.token);
    res.status(response.code).json(response);
});

// NEW: Vector search endpoint
router.get("/vectorsearch/:QUERY", async (req, res) => {
    const { QUERY } = req.params;
    const response = await commentService.vectorSearch(QUERY, req.headers.token);
    res.json(response);
});

router.delete("/:COMMENT_ID", async (req, res) => {
    const response = await commentService.deleteComment(req.params.COMMENT_ID, req.headers.token);
    res.status(response.code).json(response);
});

export default router;
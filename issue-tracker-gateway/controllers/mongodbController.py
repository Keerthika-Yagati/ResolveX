from fastapi import APIRouter, Header, HTTPException
import httpx
import os
from dotenv import load_dotenv

router = APIRouter(prefix="/mongoservice")
load_dotenv()

NODE_URL = os.getenv("NODE_URL", "http://localhost:8002")

# ============ COMMENT ROUTES → Node.js ============

@router.post("/comment/add")
async def add_comment(data: dict, Token: str = Header(...)):
    """Add a comment to an issue - stored in MongoDB"""
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(
                f"{NODE_URL}/comment/add",
                json=data,
                headers={"Token": Token}
            )
            return response.json()
    except Exception as e:
        return {"code": 500, "message": f"Error adding comment: {str(e)}"}

@router.get("/comment/issue/{ISSUE_ID}")
async def get_issue_comments(ISSUE_ID: int, Token: str = Header(...)):
    """Get all comments for an issue from MongoDB"""
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.get(
                f"{NODE_URL}/comment/issue/{ISSUE_ID}",
                headers={"Token": Token}
            )
            return response.json()
    except Exception as e:
        return {"code": 500, "message": f"Error getting comments: {str(e)}"}

@router.delete("/comment/{COMMENT_ID}")
async def delete_comment(COMMENT_ID: str, Token: str = Header(...)):
    """Delete a comment from MongoDB"""
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.delete(
                f"{NODE_URL}/comment/{COMMENT_ID}",
                headers={"Token": Token}
            )
            return response.json()
    except Exception as e:
        return {"code": 500, "message": f"Error deleting comment: {str(e)}"}

# ============ HISTORY ROUTES → Node.js ============

@router.post("/history/add")
async def add_history(data: dict, Token: str = Header(...)):
    """Add issue status change history to MongoDB"""
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(
                f"{NODE_URL}/history/add",
                json=data,
                headers={"Token": Token}
            )
            return response.json()
    except Exception as e:
        return {"code": 500, "message": f"Error adding history: {str(e)}"}

@router.get("/history/issue/{ISSUE_ID}")
async def get_issue_history(ISSUE_ID: int, Token: str = Header(...)):
    """Get full history of an issue from MongoDB"""
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.get(
                f"{NODE_URL}/history/issue/{ISSUE_ID}",
                headers={"Token": Token}
            )
            return response.json()
    except Exception as e:
        return {"code": 500, "message": f"Error getting history: {str(e)}"}

@router.get("/history/all")
async def get_all_history(Token: str = Header(...)):
    """Get all issue history from MongoDB"""
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.get(
                f"{NODE_URL}/history/all",
                headers={"Token": Token}
            )
            return response.json()
    except Exception as e:
        return {"code": 500, "message": f"Error getting history: {str(e)}"}

# ============ NOTIFICATION ROUTES → Node.js ============

@router.post("/notification/create")
async def create_notification(data: dict, Token: str = Header(...)):
    """Create a notification in MongoDB"""
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(
                f"{NODE_URL}/notification/create",
                json=data,
                headers={"Token": Token}
            )
            return response.json()
    except Exception as e:
        return {"code": 500, "message": f"Error creating notification: {str(e)}"}

@router.get("/notification/user/{USER_ID}")
async def get_user_notifications(USER_ID: int, Token: str = Header(...)):
    """Get all notifications for a user from MongoDB"""
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.get(
                f"{NODE_URL}/notification/user/{USER_ID}",
                headers={"Token": Token}
            )
            return response.json()
    except Exception as e:
        return {"code": 500, "message": f"Error getting notifications: {str(e)}"}

@router.get("/notification/user/{USER_ID}/unread")
async def get_unread_notifications_count(USER_ID: int, Token: str = Header(...)):
    """Get unread notification count for a user"""
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.get(
                f"{NODE_URL}/notification/user/{USER_ID}/unread",
                headers={"Token": Token}
            )
            return response.json()
    except Exception as e:
        return {"code": 500, "message": f"Error getting unread count: {str(e)}"}

@router.put("/notification/read/{NOTIFICATION_ID}")
async def mark_notification_read(NOTIFICATION_ID: str, Token: str = Header(...)):
    """Mark a notification as read in MongoDB"""
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.put(
                f"{NODE_URL}/notification/read/{NOTIFICATION_ID}",
                headers={"Token": Token}
            )
            return response.json()
    except Exception as e:
        return {"code": 500, "message": f"Error marking notification read: {str(e)}"}

@router.put("/notification/user/{USER_ID}/read-all")
async def mark_all_notifications_read(USER_ID: int, Token: str = Header(...)):
    """Mark all notifications as read for a user"""
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.put(
                f"{NODE_URL}/notification/user/{USER_ID}/read-all",
                headers={"Token": Token}
            )
            return response.json()
    except Exception as e:
        return {"code": 500, "message": f"Error marking all read: {str(e)}"}

@router.delete("/notification/{NOTIFICATION_ID}")
async def delete_notification(NOTIFICATION_ID: str, Token: str = Header(...)):
    """Delete a notification from MongoDB"""
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.delete(
                f"{NODE_URL}/notification/{NOTIFICATION_ID}",
                headers={"Token": Token}
            )
            return response.json()
    except Exception as e:
        return {"code": 500, "message": f"Error deleting notification: {str(e)}"}

# ============ ANALYTICS ROUTES → Node.js ============

@router.get("/analytics/status-summary")
async def get_status_summary(Token: str = Header(...)):
    """Get issue count grouped by status from MongoDB"""
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.get(
                f"{NODE_URL}/analytics/status-summary",
                headers={"Token": Token}
            )
            return response.json()
    except Exception as e:
        return {"code": 500, "message": f"Error getting status summary: {str(e)}"}

@router.get("/analytics/priority-summary")
async def get_priority_summary(Token: str = Header(...)):
    """Get issue count grouped by priority from MongoDB"""
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.get(
                f"{NODE_URL}/analytics/priority-summary",
                headers={"Token": Token}
            )
            return response.json()
    except Exception as e:
        return {"code": 500, "message": f"Error getting priority summary: {str(e)}"}
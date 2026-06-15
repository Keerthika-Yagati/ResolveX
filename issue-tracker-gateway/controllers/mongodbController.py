from fastapi import APIRouter, Header, HTTPException
import httpx
import os
from dotenv import load_dotenv

router = APIRouter(prefix="/mongoservice")
load_dotenv()

NODE_URL = os.getenv("NODE_URL", "http://localhost:8002")

# ========== COMMENT ROUTES → Node.js ==========

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

@router.get("/comment/vectorsearch/{QUERY}")
async def vector_search(QUERY: str, Token: str = Header(...)):
    """Vector search for similar comments"""
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.get(
                f"{NODE_URL}/comment/vectorsearch/{QUERY}",
                headers={"Token": Token}
            )
            return response.json()
    except Exception as e:
        return {"code": 500, "message": f"Error in vector search: {str(e)}"}

# ✅ PUT route for editing comments - MAKE SURE THIS EXISTS
@router.put("/comment/{COMMENT_ID}")
async def edit_comment(COMMENT_ID: str, data: dict, Token: str = Header(...)):
    """Edit a comment in MongoDB"""
    try:
        print(f"EDIT COMMENT - ID: {COMMENT_ID}, Data: {data}")  # Debug log
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.put(
                f"{NODE_URL}/comment/{COMMENT_ID}",
                json=data,
                headers={"Token": Token}
            )
            print(f"Response from Node.js: {response.status_code}")  # Debug log
            return response.json()
    except Exception as e:
        print(f"Error in edit_comment: {str(e)}")  # Debug log
        return {"code": 500, "message": f"Error editing comment: {str(e)}"}

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

# ========== HISTORY ROUTES ==========
@router.post("/history/add")
async def add_history(data: dict, Token: str = Header(...)):
    async with httpx.AsyncClient(timeout=30.0) as client:
        response = await client.post(
            f"{NODE_URL}/history/add",
            json=data,
            headers={"Token": Token}
        )
    return response.json()

@router.get("/history/issue/{ISSUE_ID}")
async def get_issue_history(ISSUE_ID: int, Token: str = Header(...)):
    async with httpx.AsyncClient(timeout=30.0) as client:
        response = await client.get(
            f"{NODE_URL}/history/issue/{ISSUE_ID}",
            headers={"Token": Token}
        )
    return response.json()

@router.get("/history/all")
async def get_all_history(Token: str = Header(...)):
    async with httpx.AsyncClient(timeout=30.0) as client:
        response = await client.get(
            f"{NODE_URL}/history/all",
            headers={"Token": Token}
        )
    return response.json()

# ========== NOTIFICATION ROUTES ==========
@router.post("/notification/create")
async def create_notification(data: dict, Token: str = Header(...)):
    async with httpx.AsyncClient(timeout=30.0) as client:
        response = await client.post(
            f"{NODE_URL}/notification/create",
            json=data,
            headers={"Token": Token}
        )
    return response.json()

@router.get("/notification/user/{USER_ID}")
async def get_user_notifications(USER_ID: int, Token: str = Header(...)):
    async with httpx.AsyncClient(timeout=30.0) as client:
        response = await client.get(
            f"{NODE_URL}/notification/user/{USER_ID}",
            headers={"Token": Token}
        )
    return response.json()

@router.put("/notification/read/{NOTIFICATION_ID}")
async def mark_notification_read(NOTIFICATION_ID: str, Token: str = Header(...)):
    async with httpx.AsyncClient(timeout=30.0) as client:
        response = await client.put(
            f"{NODE_URL}/notification/read/{NOTIFICATION_ID}",
            headers={"Token": Token}
        )
    return response.json()

@router.delete("/notification/{NOTIFICATION_ID}")
async def delete_notification(NOTIFICATION_ID: str, Token: str = Header(...)):
    async with httpx.AsyncClient(timeout=30.0) as client:
        response = await client.delete(
            f"{NODE_URL}/notification/{NOTIFICATION_ID}",
            headers={"Token": Token}
        )
    return response.json()

# ========== ANALYTICS ROUTES ==========
@router.get("/analytics/status-summary")
async def get_status_summary(Token: str = Header(...)):
    async with httpx.AsyncClient(timeout=30.0) as client:
        response = await client.get(
            f"{NODE_URL}/analytics/status-summary",
            headers={"Token": Token}
        )
    return response.json()

@router.get("/analytics/priority-summary")
async def get_priority_summary(Token: str = Header(...)):
    async with httpx.AsyncClient(timeout=30.0) as client:
        response = await client.get(
            f"{NODE_URL}/analytics/priority-summary",
            headers={"Token": Token}
        )
    return response.json()
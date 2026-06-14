from fastapi import APIRouter, Header
from models.schemas import CreateIssueSchema, AssignIssueSchema, UpdateStatusSchema
import httpx

router = APIRouter(prefix="/issueservice")
SPRING_URL = "http://localhost:8001"

@router.post("/create")
async def create_issue(I: CreateIssueSchema, Token: str = Header(...)):
    async with httpx.AsyncClient() as client:
        response = await client.post(f"{SPRING_URL}/issue/create", json=I.model_dump(), headers={"Token": Token})
    return response.json()

@router.get("/myissues")
async def get_my_issues(Token: str = Header(...)):
    async with httpx.AsyncClient() as client:
        response = await client.get(f"{SPRING_URL}/issue/myissues", headers={"Token": Token})
    return response.json()

@router.get("/allissues")
async def get_all_issues(Token: str = Header(...)):
    async with httpx.AsyncClient() as client:
        response = await client.get(f"{SPRING_URL}/issue/allissues", headers={"Token": Token})
    return response.json()

@router.put("/assign/{ID}")
async def assign_issue(ID: int, A: AssignIssueSchema, Token: str = Header(...)):
    async with httpx.AsyncClient() as client:
        response = await client.put(f"{SPRING_URL}/issue/assign/{ID}", json=A.model_dump(), headers={"Token": Token})
    return response.json()

@router.get("/assignedtome")
async def get_assigned_to_me(Token: str = Header(...)):
    async with httpx.AsyncClient() as client:
        response = await client.get(f"{SPRING_URL}/issue/assignedtome", headers={"Token": Token})
    return response.json()

@router.put("/updatestatus/{ID}")
async def update_status(ID: int, S: UpdateStatusSchema, Token: str = Header(...)):
    async with httpx.AsyncClient() as client:
        response = await client.put(f"{SPRING_URL}/issue/updatestatus/{ID}", json=S.model_dump(), headers={"Token": Token})
    return response.json()

@router.put("/close/{ID}")
async def close_issue(ID: int, Token: str = Header(...)):
    async with httpx.AsyncClient() as client:
        response = await client.put(f"{SPRING_URL}/issue/close/{ID}", headers={"Token": Token})
    return response.json()

@router.get("/getissue/{ID}")
async def get_issue(ID: int, Token: str = Header(...)):
    async with httpx.AsyncClient() as client:
        response = await client.get(f"{SPRING_URL}/issue/getissue/{ID}", headers={"Token": Token})
    return response.json()
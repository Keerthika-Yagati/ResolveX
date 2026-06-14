from fastapi import APIRouter, Header
from models.schemas import SignupSchema, SigninSchema, UpdateUserSchema
import httpx

router = APIRouter(prefix="/authservice")
SPRING_URL = "http://localhost:8001"

@router.post("/signup")
async def signup(U: SignupSchema):
    async with httpx.AsyncClient() as client:
        response = await client.post(f"{SPRING_URL}/user/signup", json=U.model_dump())
    return response.json()

@router.post("/signin")
async def signin(U: SigninSchema):
    async with httpx.AsyncClient() as client:
        response = await client.post(f"{SPRING_URL}/user/signin", json=U.model_dump())
    return response.json()

@router.get("/uinfo")
async def uinfo(Token: str = Header(...)):
    async with httpx.AsyncClient() as client:
        response = await client.get(f"{SPRING_URL}/user/uinfo", headers={"Token": Token})
    return response.json()

@router.get("/getallusers/{PAGE}/{SIZE}")
async def get_all_users(PAGE: int, SIZE: int, Token: str = Header(...)):
    async with httpx.AsyncClient() as client:
        response = await client.get(f"{SPRING_URL}/user/getallusers/{PAGE}/{SIZE}", headers={"Token": Token})
    return response.json()

@router.get("/getalldevelopers")
async def get_all_developers(Token: str = Header(...)):
    async with httpx.AsyncClient() as client:
        response = await client.get(
            f"{SPRING_URL}/user/getalldevelopers", 
            headers={"Token": Token}
        )
    return response.json()

@router.get("/getallusers/{PAGE}/{SIZE}")
async def get_all_users(PAGE: int, SIZE: int, Token: str = Header(...)):
    async with httpx.AsyncClient() as client:
        response = await client.get(
            f"{SPRING_URL}/user/getallusers/{PAGE}/{SIZE}", 
            headers={"Token": Token}
        )
    return response.json()
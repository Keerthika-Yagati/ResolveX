from pydantic import BaseModel
from typing import Optional

# ── AUTH SCHEMAS ──
class SignupSchema(BaseModel):
    fullname: str
    phone: str
    email: str
    password: str
    role: int  # 1=User, 2=Developer, 3=Admin

class SigninSchema(BaseModel):
    email: str
    password: str

class UpdateUserSchema(BaseModel):
    fullname: str
    phone: str
    password: str

# ── ISSUE SCHEMAS ──
class CreateIssueSchema(BaseModel):
    title: str
    description: str
    priority: str        # "low", "medium", "high"

class AssignIssueSchema(BaseModel):
    developerId: int

class UpdateStatusSchema(BaseModel):
    status: str          # "in-progress", "resolved"

# ── COMMENT SCHEMAS ──
class AddCommentSchema(BaseModel):
    issueId: int
    comment: str
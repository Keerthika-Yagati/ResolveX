from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from controllers import AuthenticationRouter, IssueRouter, MongoDBRouter

app = FastAPI(
    title="API Gateway - Issue Tracker",
    description="Routes requests to Spring Boot (PostgreSQL) and Node.js (MongoDB)",
    version="1.0.0"
)

# UPDATE CORS - Add all possible frontend ports
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:5173", 
        "http://localhost:5174",
        "http://localhost:5175",
        "http://localhost:5176",
        "http://localhost:5177",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:5174",
        "http://127.0.0.1:5175",
        "http://127.0.0.1:5176",
        "http://127.0.0.1:5177",
        "*"  # Allow all origins (for development only)
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register all routers
app.include_router(AuthenticationRouter)   # → Spring Boot (Port 8001)
app.include_router(IssueRouter)            # → Spring Boot (Port 8001)
app.include_router(MongoDBRouter)          # → Node.js (Port 8002)

@app.get("/")
def home():
    return {
        "message": "API Gateway Running",
        "routes": {
            "/authservice/*": "Spring Boot (PostgreSQL)",
            "/issueservice/*": "Spring Boot (PostgreSQL)",
            "/mongoservice/*": "Node.js (MongoDB)"
        }
    }

@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "services": {
            "gateway": "running",
            "spring_boot": "http://localhost:8001",
            "node_backend": "http://localhost:8002"
        }
    }
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || "qwertyuiopasdfghjklzxcvbnmQWERTYUIOPASDFGHJKLZXCVBNM0987654321";

export async function verifyToken(token) {
    try {
        const payload = jwt.verify(token, JWT_SECRET);
        return { valid: true, payload };
    } catch (error) {
        return { valid: false, error: error.message };
    }
}

export async function authMiddleware(req, res, next) {
    const token = req.headers.token || req.headers.authorization;
    
    if (!token) {
        return res.status(401).json({ code: 401, message: "No token provided" });
    }
    
    try {
        const payload = jwt.verify(token, JWT_SECRET);
        req.user = payload;
        next();
    } catch (error) {
        return res.status(401).json({ code: 401, message: "Invalid or expired token" });
    }
}

// Optional: Role-based middleware
export function requireRole(roles) {
    return async (req, res, next) => {
        const token = req.headers.token || req.headers.authorization;
        
        if (!token) {
            return res.status(401).json({ code: 401, message: "No token provided" });
        }
        
        try {
            const payload = jwt.verify(token, JWT_SECRET);
            const userRole = payload.role;
            
            if (!roles.includes(userRole)) {
                return res.status(403).json({ code: 403, message: "Access denied. Insufficient permissions" });
            }
            
            req.user = payload;
            next();
        } catch (error) {
            return res.status(401).json({ code: 401, message: "Invalid or expired token" });
        }
    };
}

// Helper to extract user from token
export async function getUserFromToken(token) {
    try {
        const payload = jwt.verify(token, JWT_SECRET);
        return payload;
    } catch (error) {
        return null;
    }
}

export default authMiddleware;
import type { NextFunction , Response , Request } from "express";
import { JwtUtils, type IAccessPayload } from "../utils/auth-utils";
import ApiResponse from "../advices/ApiResponse";
import ApiError from "../advices/ApiError";

// Extend Request interface to include user
declare global {
    namespace Express {
        interface Request {
            user?: IAccessPayload;
        }
    }
}

export const AuthMiddleware = (req : Request, res: Response, next: NextFunction): void => {
    try {
        const authHeader = req.headers.authorization;
        const cookieToken = req.cookies.access_token;

        let token: string | null = null;

        // Extract token from Bearer header
        if (authHeader && authHeader.startsWith('Bearer ')) {
            token = authHeader.substring(7); // Remove 'Bearer ' prefix
        }
        // If no Bearer token, try cookie token
        else if (cookieToken) {
            token = cookieToken;
        }

        // If no token found in either location
        if (!token) {
            res.status(401).json(
                new ApiResponse(null, new ApiError(401, 'Access token not found in header or cookies'))
            );
            return;
        }

        // Verify the token
        const user = JwtUtils.verifyAccessToken(token);
        
        if (!user) {
            res.status(401).json(
                new ApiResponse(null, new ApiError(401, 'Invalid or expired access token'))
            );
            return;
        }

        // Attach user to request object
        req.user = user;
        next();

    } catch (error) {
        console.error('Auth middleware error:', error);
        res.status(500).json(
            new ApiResponse(null, new ApiError(500, 'Internal server error during authentication'))
        );
    }
}
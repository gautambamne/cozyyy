import type { Request, Response, NextFunction } from 'express';
import ApiResponse from '../advices/ApiResponse';
import ApiError from '../advices/ApiError';

// roles is an array of allowed roles, e.g. ['VENDOR']
// User can have multiple roles - checks if user has ANY of the required roles
export const requireRole = (requiredRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = req.user as any;
      if (!user) {
        return res.status(401).json(new ApiResponse(null, new ApiError(401, 'Unauthorized')));
      }

      const userRoles = user.roles as string[] | undefined;
      if (!userRoles || !Array.isArray(userRoles) || userRoles.length === 0) {
        return res.status(403).json(new ApiResponse(null, new ApiError(403, 'Forbidden: No roles assigned')));
      }

      // Check if user has at least one of the required roles
      const hasRequiredRole = userRoles.some(userRole => requiredRoles.includes(userRole));
      if (!hasRequiredRole) {
        return res.status(403).json(new ApiResponse(null, new ApiError(403, 'Forbidden: Insufficient permissions')));
      }

      next();
    } catch (err) {
      console.error('Role middleware error', err);
      return res.status(500).json(new ApiResponse(null, new ApiError(500, 'Internal server error')));
    }
  };
};

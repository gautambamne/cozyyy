import type { Response, NextFunction, Request } from "express";
import ApiError from "../advices/ApiError";
import ApiResponse from "../advices/ApiResponse";

export const errorMiddleware = (err: Error, req: Request, res: Response, next: NextFunction) => {

    if (err instanceof ApiError) {
        res.status(err.statusCode).json(new ApiResponse(null, new ApiError(err.statusCode, err.message, err.errors)));
    } else {
        console.error(err);
        res.status(500).json(new ApiResponse(null, new ApiError(500, 'Internal Server Error')));
    }
};
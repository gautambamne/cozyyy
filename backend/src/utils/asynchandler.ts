import type { Request, Response, NextFunction } from "express";

type AsyncHandler = (req: Request, res: Response, next: NextFunction) => Promise<Response | void>;

const asyncHandler = (fn: AsyncHandler) => {
    return (req: Request, res: Response, next: NextFunction) => {
        Promise.resolve(fn(req,res,next))
        .catch(error=> next(error)); // passes error to Express error middleware
    }

}

export default asyncHandler;
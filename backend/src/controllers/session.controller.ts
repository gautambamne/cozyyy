import ApiError from "../advices/ApiError";
import ApiResponse from "../advices/ApiResponse";
import { prisma } from "../db/database";
import { sessionRepository } from "../repositories/session.repositories";
import asyncHandler from "../utils/asynchandler";

export const getAllSessionController = asyncHandler(async(req, res)=>{
    if(!req.user){
        throw new ApiError(401, "User not authenticated")
    }
    const{id} = req.user

    const allSession = await sessionRepository.getSessionsByUserId(id)
    return res.status(200).json(new ApiResponse({
        session: allSession,
        message: "All session Retrived"
    }))
});


export const deleteSessionById = asyncHandler(async(req, res)=>{
    if(!req.user){
        throw new ApiError(401, "User not authenticated")
    }

    const {session_id} = req.params;

    if(!session_id){
       throw new ApiError(400, "Session_id can not be empty")
    }

    const deletedSession = await sessionRepository.deleteSessionById(session_id)

    if(!deletedSession){
        throw new ApiError(400, "Requested session doesnot exist")
    }

    return res.status(200).json(new ApiResponse({
        message: "Session deleted successfully "
    }))
});

export const deleteAllSessionExceptCurrent = asyncHandler(async(req, res)=>{
    if(!req.user){
        throw new ApiError(401, "User not autheticated")
    }

    const refresh_token = req.cookies.refresh_token;

    await prisma.session.deleteMany({
        where:{
            sessionToken:{
                not: refresh_token
            }
        }
    });

    return res.json(new ApiResponse({
        message: "Session deleted successfully"
    }))
});





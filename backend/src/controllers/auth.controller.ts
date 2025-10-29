import ApiError from "../advices/ApiError";
import ApiResponse from "../advices/ApiResponse";
import type { User } from "../generated";
import { UserRepository } from "../repositories/auth.repositories";
import { sessionRepository } from "../repositories/session.repositories";
import {
  CheckVerificationCodeSchema,
  ForgotPasswordSchema,
  LoginSchema,
  RegistrationSchema,
  ResendVerificationCodeSchema,
  ResetPasswordSchema,
  VerifySchema,
} from "../schema/auth.schema";
import asyncHandler from "../utils/asynchandler";
import {
  JwtUtils,
  passwordUtils,
  verificationUtils,
} from "../utils/auth-utils";
import { zodErrorFormatter } from "../utils/error-formater";


export const sanitizeUser = (user: User)=>{
   const{ password: _,
    verificationCode: __,
    verificationExpiry: ___,
    ...userWithoutSenesitive
  } = user;
  return userWithoutSenesitive;
}

const handleAuthSuccess = async(user: User, message:string, req: any, res: any)=>{
    const access_token = JwtUtils.generateAccessToken({
    id: user.id,
    name: user.name,
    email: user.email,
    isVerified: user.isVerified,

  });

  const refresh_token = JwtUtils.generateRefreshToken({ id: user.id });

  await sessionRepository.createSession({
     sessionToken: refresh_token,
      expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      user: {
        connect: { id: user.id },
      },
  })

  const userWithoutSenesitive = sanitizeUser(user);

  res
    .status(200)
    .cookie("access_token", access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
    })
    .cookie("refresh_token", refresh_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
    })
    .json(
      new ApiResponse({
        user: userWithoutSenesitive,
        access_token: access_token,
        message: message,
      })
    );
}

export const RegisterController = asyncHandler(async (req, res) => {
  const result = RegistrationSchema.safeParse(req.body);
  if (!result.success) {
    throw new ApiError(400,"validation Error",zodErrorFormatter(result.error)
    );
  }

  const { name, email, password } = result.data;

  const savedUser = await UserRepository.getUserByEmail(email);
  if (savedUser?.isVerified) {
    throw new ApiError(409, `User already exist with this email: ${email}`);
  }
  let userToBeReturned: User;
  let verificationCode = verificationUtils();
  let hashedPassword = await passwordUtils.generateHashPassword(password);
  let statusCode: number;

  if (!savedUser) {
    userToBeReturned = await UserRepository.createUser({
        name,
        email,
        password: hashedPassword,
        verificationCode,
        verificationExpiry: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes from now
    });
    statusCode = 201;
  } else {
    userToBeReturned = await UserRepository.updateUserById(savedUser.id,{
        name,
        password: hashedPassword,
        verificationCode,
        verificationExpiry: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes from now
    })
    statusCode = 200;
  }

  const {
    password: _,
    // verification_code: __,
    verificationExpiry: ___,
    ...userWithoutSensitive
  } = userToBeReturned;

  return res.status(statusCode).json(
    new ApiResponse({
      user: userWithoutSensitive,
      message: "Account Successfullty Registered",
    })
  );
});

export const VerifyUser = asyncHandler(async (req, res) => {
  const result = VerifySchema.safeParse(req.body);
  if (!result.success) {
    throw new ApiError(400, "validation Error", zodErrorFormatter(result.error));
  }

  const { email, code } = result.data;

  const existingUser = await UserRepository.getUserByEmail(email);

  if (!existingUser) {
    throw new ApiError(404, "User not exist with this email");
  }

  if (existingUser.verificationCode != code) {
    throw new ApiError(400, "Invalid verification code");
  }

  if (
    !existingUser.verificationExpiry ||
    existingUser.verificationExpiry.getTime() < Date.now()
  ) {
    throw new ApiError(400, "Verification code expired");
  }

  const userToBeReturned = await UserRepository.updateUserById(existingUser.id, {
    isVerified: true,
    verificationCode: null,
    verificationExpiry: null,
  });

  // Sanitize user data before returning
  const userWithoutSensitive = sanitizeUser(userToBeReturned);

  res.status(200).json(
    new ApiResponse({
      message: "Email verified successfully"
    })
  );
});

export const LoginController = asyncHandler(async (req, res) => {
  const result = LoginSchema.safeParse(req.body);
  if (!result.success) {
    throw new ApiError( 400, "validation Error", zodErrorFormatter(result.error));
  }

  const { email, password } = result.data;

  const savedUser = await UserRepository.getUserByEmail(email);
  if (!savedUser) {
    throw new ApiError(401, "Invalid credentials");
  }
  if (!savedUser.isVerified) {
    throw new ApiError(403, "Please verify your email to login");
  }
  const isPasswordValid = await passwordUtils.comparePassword( password, savedUser.password );
  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid credentials");
  }
  await handleAuthSuccess(savedUser, "Login Successfully" ,req, res)

});


export const ForgotPasswordController = asyncHandler(async(req, res)=>{
  const result = ForgotPasswordSchema.safeParse(req.body);
  if (!result.success) {
    throw new ApiError(400, "validation Error", zodErrorFormatter(result.error));
  }

  const {email} = result.data;

  const existingUser = await UserRepository.getUserByEmail(email);
  if(!existingUser || !existingUser.isVerified){
    throw new ApiError(404, "User not exist with this email");
  }

  const verificationCode = verificationUtils();

  await UserRepository.updateUserById(existingUser.id,{
      verificationCode,
      verificationExpiry: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes from now
  });

  // TODO: Mail Functionality
  res.status(200).json(
  new ApiResponse({
    message: `Verification code sent to your email`
  }));
});


export const ResesndVerificationCodeController = asyncHandler(async(req, res)=>{
  const result = ResendVerificationCodeSchema.safeParse(req.body);
  if (!result.success) {
    throw new ApiError(400, "validation Error", zodErrorFormatter(result.error));
  }

  const {email} = result.data;
  

  const existingUser = await UserRepository.getUserByEmail(email);
  if(!existingUser){
    throw new ApiError(404, "User not exist with this email");
  }
  if(existingUser.isVerified){
    throw new ApiError(400, "User already verified");
  }

  const verificationCode = verificationUtils();

  await UserRepository.updateUserById(existingUser.id,{
      verificationCode,
      verificationExpiry: new Date(Date.now() + 10 * 60 * 1000) // 10 minutes 
  });

  // TODO: Mail Functionality

  return res.status(200).json(
  new ApiResponse({
    message: "Verification code resent to your email"
    })
  )
});


export const CheckVerificationCodeController = asyncHandler(async(req, res)=>{
  const result = CheckVerificationCodeSchema.safeParse(req.body);
  if (!result.success) {
    throw new ApiError(400, "validation Error", zodErrorFormatter(result.error));
  }

  const {email, code} = result.data;

  const existingUser = await UserRepository.getUserByEmail(email);

  if(!existingUser){
    throw new ApiError(404, "User not exist with this email");
  }
  if(existingUser.verificationCode != code){
    throw new ApiError(400, "Invalid verification code");
  }
  if(!existingUser.verificationExpiry || existingUser.verificationExpiry.getTime() < Date.now()){
    throw new ApiError(400, "Verification code expired");
  }
  
  res.status(200).json(
  new ApiResponse({
    message: "Verification code is valid"
  }));
});


export const ResetPasswordController = asyncHandler(async(req, res)=>{
  const result = ResetPasswordSchema.safeParse(req.body);

  if (!result.success) {
    throw new ApiError(400, "validation Error", zodErrorFormatter(result.error));
  }

  const {email, code, newPassword} = result.data;

  const existingUser = await UserRepository.getUserByEmail(email);
  
  if(!existingUser){
    throw new ApiError(404, "User not exist with this email");
  }
  if(existingUser.verificationCode != code){
    throw new ApiError(400, "Invalid verification code");
  }
  if(!existingUser.verificationExpiry || existingUser.verificationExpiry.getTime() < Date.now()){
    throw new ApiError(400, "Verification code expired");
  }

  const hashedPassword = await passwordUtils.generateHashPassword(newPassword);

  await UserRepository.updateUserById(existingUser.id,{
      password: hashedPassword,
      verificationCode: null,
      verificationExpiry: null,
  })

  return res.status(200).json(
  new ApiResponse({
    message: "Password reset successful"
    })
  );  
});


export const RefreshTokenController = asyncHandler(async(req, res)=>{
  const refresh_token = req.cookies?.refresh_token;

  if(!refresh_token){
    throw new ApiError(401, "Refresh token not found");
  }

  const decoded = JwtUtils.verifyRefreshToken(refresh_token);
  
  const session = await sessionRepository.getSessionByToken(refresh_token);

  if(!session || session.expires.getTime() < Date.now()){
    throw new ApiError(401, "Invalid or expired refresh token");
  }

  const user = await UserRepository.getUserById(decoded.id);

  if(!user){
    throw new ApiError(404, "User not found");
  }

  const access_token = JwtUtils.generateAccessToken({
    id: user.id,
    name: user.name,
    email: user.email,
    isVerified: user.isVerified,
  });

  res.status(200)
  .cookie("access_token", access_token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
  }).json(
  new ApiResponse({
    access_token,
    message: "Access token refreshed successfully"
    })
  )
});


export const LogoutController = asyncHandler(async (req, res) => {
  const result = req.cookies?.refresh_token;

  if (result) {
    const session = await sessionRepository.getSessionByToken(result);
    if (session) {
      await sessionRepository.deleteSessionById(session.id);
    }
  }
  res.status(200)
  .clearCookie( "access_token", {path: '/'})
  .clearCookie("refresh_token", {path: '/'})
  .json(
  new ApiResponse({
    message: "Logout successful"
  }));
});




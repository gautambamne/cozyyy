import bcrypt from 'bcrypt';
import jwt, { type JwtPayload } from 'jsonwebtoken';
import type { User } from '../generated';

export interface IAccessPayload {
    id: User['id'];
    name: User['name'];
    email: User['email'];
    isVerified: User['isVerified'];
}

export interface IRefreshPayload {
    id: User['id'];
}

export const JwtUtils = {
    generateAccessToken: (data: IAccessPayload): string => {
        try {
            if (!process.env.ACCESS_TOKEN_SECRET) {
                throw new Error("ACCESS_TOKEN_SECRET is not defined");
            }

            const access_token = jwt.sign(
                { data },
                process.env.ACCESS_TOKEN_SECRET,
                { expiresIn: process.env.ACCESS_TOKEN_EXPIRY || '10m' } as any
            );
            return access_token;

        } catch (error) {
            console.error('jwt generation error', error);
            throw new Error('jwt generation failed');
        }
    },

    generateRefreshToken: (data: IRefreshPayload): string => {
        try {
            if (!process.env.REFRESH_TOKEN_SECRET) {
                throw new Error("REFRESH_TOKEN_SECRET is not defined");
            }

            const refresh_token = jwt.sign(
                { data },
                process.env.REFRESH_TOKEN_SECRET,
                { expiresIn: process.env.REFRESH_TOKEN_EXPIRY || '30d' } as any
            );
            return refresh_token;

        } catch (error) {
            console.error('jwt generation error', error);
            throw new Error('jwt generation failed');
        }
    },

    verifyRefreshToken: (refresh_token: string): IRefreshPayload => {
        try {
            if (!process.env.REFRESH_TOKEN_SECRET) {
                throw new Error("REFRESH_TOKEN_SECRET is not defined");
            }

            const decoded = jwt.verify(refresh_token, process.env.REFRESH_TOKEN_SECRET) as JwtPayload;
            if (!decoded.data || !decoded.data.id) {
                throw new Error("Invalid refresh token payload");
            }
            return decoded.data as IRefreshPayload;

        } catch (error) {
            console.error('Refresh token verification failed:', error);
            throw new Error('Invalid or expired refresh token');
        }
    },
    verifyAccessToken: (access_token: string): IAccessPayload => {
        try {
            if (!process.env.ACCESS_TOKEN_SECRET) {
                throw new Error("ACCESS_TOKEN_SECRET is not defined");
            }

            const decoded = jwt.verify(access_token, process.env.ACCESS_TOKEN_SECRET) as JwtPayload;
            if (!decoded.data || !decoded.data.id) {
                throw new Error("Invalid access token payload");
            }
            return decoded.data as IAccessPayload;

        } catch (error) {
            console.error('access token verification failed:', error);
            throw new Error('Invalid or expired access token');
        }
    },
};

export const passwordUtils = {
    generateHashPassword: async (password: string): Promise<string> => {
        return await bcrypt.hash(password, 12);
    },

    comparePassword: async (password: string, hashedPassword: string): Promise<boolean> => {
        return await bcrypt.compare(password, hashedPassword);
    },
};

export const verificationUtils = (): string => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};
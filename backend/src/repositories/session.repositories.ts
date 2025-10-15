import { prisma } from "../db/database";
import type { Prisma, Session } from "../generated";

export const sessionRepository = {
    createSession: async(data: Prisma.SessionCreateInput): Promise<Session> => {
        return await prisma.session.create({ data });
    },
    getSessionById: async(id: string): Promise<Session | null> => {
        return await prisma.session.findUnique({ where: { id } });
    },
    getSessionByToken: async(token: string): Promise<Session | null> => {
        return await prisma.session.findUnique({ where: { sessionToken: token } });
    },
    getSessionsByUserId: async(userId: string): Promise<Session[]> => {
        return await prisma.session.findMany({ where: { userId } });
    },
    updateSessionById: async(id: string, data: Prisma.SessionUpdateInput): Promise<Session> => {
        return await prisma.session.update({ where: { id }, data });
    },
    deleteSessionById: async(id: string): Promise<boolean> => {
        try {
            await prisma.session.delete({ where: { id } });
            return true;
        } catch (error) {
            return false;
        }
    },
    deleteSessionByToken: async(token: string): Promise<boolean> => {
        try {
            await prisma.session.delete({ where: { sessionToken: token } });
            return true;
        } catch (error) {
            return false;
        }
    }
};
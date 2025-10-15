import {prisma} from "../db/database"
import type { Prisma, User } from "../generated"

export const UserRepository = {
    createUser: async(data: Prisma.UserCreateInput): Promise<User> => {
        const user = await prisma.user.create({data});
        return user;
    },
    getUserById: async(id: string): Promise<User|null>=>{
        const user = await prisma.user.findUnique({where: {id}})
        return user
    },
    getUserByEmail: async(email: string): Promise<User|null>=>{
        const user = await prisma.user.findUnique({where: {email}})
        return user
    },
    updateUserById: async(id: string, data:Prisma.UserUpdateInput): Promise<User>=>{
        const user = await prisma.user.update({where: {id}, data})
        return user
    },
    deleteUserById: async(id: string): Promise<User>=>{
        const user = await prisma.user.delete({where:{id}})
        return user;
    }
}
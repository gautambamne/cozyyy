import { PrismaClient } from "../generated";
const prisma = new PrismaClient();

const database = () => {
    return new Promise<void>((resolve, reject)=>{
        prisma.$connect()
        .then(()=>{
            console.log("Database connected");
            resolve();
        }).catch((error)=>{
            prisma.$disconnect();
            console.error("Database connection error: ", error);
            console.log(error);
            reject(error);
        });

    })
} 

export { prisma, database };
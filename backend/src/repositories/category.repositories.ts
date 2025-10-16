import { prisma } from "../db/database"
import type { Prisma, Category } from "../generated"

export const CategoryRepository = {
    createCategory: async (data: Prisma.CategoryCreateInput): Promise<Category> => {
        const category = await prisma.category.create({ data });
        return category;
    },

    getCategoryById: async (id: string): Promise<Category | null> => {
        const category = await prisma.category.findUnique({ where: { id } });
        return category;
    },

    getCategoryBySlug: async (slug: string): Promise<Category | null> => {
        const category = await prisma.category.findUnique({ where: { slug } });
        return category;
    },

    getCategories: async (options: {
        page?: number;
        limit?: number;
        search?: string;
        isActive?: boolean;
    } = {}): Promise<{ categories: Category[]; total: number }> => {
        const { page = 1, limit = 10, search, isActive } = options;

        const where: Prisma.CategoryWhereInput = {};

        if (search) {
            where.name = {
                contains: search,
                mode: 'insensitive'
            };
        }

        if (isActive !== undefined) {
            where.isActive = isActive;
        }

        const [categories, total] = await Promise.all([
            prisma.category.findMany({
                where,
                skip: (page - 1) * limit,
                take: limit,
                orderBy: { name: 'asc' }
            }),
            prisma.category.count({ where })
        ]);

        return { categories, total };
    },

    updateCategoryById: async (id: string, data: Prisma.CategoryUpdateInput): Promise<Category> => {
        const category = await prisma.category.update({
            where: { id },
            data
        });
        return category;
    },

    deleteCategoryById: async (id: string): Promise<Category> => {
        const category = await prisma.category.delete({ where: { id } });
        return category;
    },

    getAllActiveCategories: async (): Promise<Category[]> => {
        const categories = await prisma.category.findMany({
            where: { isActive: true },
            orderBy: { name: 'asc' }
        });
        return categories;
    }
}

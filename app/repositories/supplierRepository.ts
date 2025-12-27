import prisma from "@/lib/db";

export const SupplierRepository = {
    async getAll() {
        return await prisma.supplier.findMany({
            orderBy: { name: 'asc' }
        });
    },

    async create(name: string, phone?: string) {
        return await prisma.supplier.create({
            data: {
                name,
                phone,
            }
        });
    },
};

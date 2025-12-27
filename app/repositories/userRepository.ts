import prisma from "@/lib/db";

export const UserRepository = {
  async findByPhone(phone: string) {
    return await prisma.user.findUnique({
      where: { phone },
    });
  },
};

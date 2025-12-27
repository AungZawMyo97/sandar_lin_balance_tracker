import {
  PrismaClient,
  Prisma,
  Role,
  Status,
} from "@/app/generated/prisma/client";
import * as bcrypt from "bcryptjs";
import { PrismaPg } from "@prisma/adapter-pg";
import "dotenv/config";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({
  adapter,
});

export async function main() {
  const password = await bcrypt.hash("admin123!@#", 10);
  const userData: Prisma.UserCreateInput[] = [
    {
      phone: "0958415053",
      password: password,
      firstName: "Super",
      lastName: "Admin",
      role: Role.ADMIN,
      status: Status.ACTIVE,
      randToken: "init-token",
    },
  ];

  for (const u of userData) {
    await prisma.user.create({ data: u });
  }
}

main();

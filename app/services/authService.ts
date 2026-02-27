import { UserRepository } from "@/app/repositories/userRepository";
import * as bcrypt from "bcryptjs";

export const AuthService = {
  async login(phone: string, plainPassword: string) {
    const user = await UserRepository.findByPhone(phone);
    if (!user) return null;

    const isMatch = await bcrypt.compare(plainPassword, user.password);
    if (!isMatch) return null;

    return user;
  },
};

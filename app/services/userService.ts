import { UserRepository } from "@/app/repositories/userRepository";

export const UserService = {
  async getUserByPhone(phone: string) {
    return await UserRepository.findByPhone(phone);
  },
};

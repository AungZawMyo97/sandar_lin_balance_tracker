import { SupplierRepository } from "@/app/repositories/supplierRepository";

export const SupplierService = {
  async getAll() {
    return await SupplierRepository.getAll();
  },

  async create(name: string, phone?: string) {
    return await SupplierRepository.create(name, phone);
  },
};

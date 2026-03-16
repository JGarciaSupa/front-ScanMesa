export type Role = "admin" | "waiter" | "kitchen";

export interface StaffMember {
  id: number;
  name: string;
  email: string;
  role: Role;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

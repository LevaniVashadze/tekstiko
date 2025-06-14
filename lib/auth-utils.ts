import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export function hashPassword(password: string): string {
  const saltRounds = 10;
  return bcrypt.hashSync(password, saltRounds);
}

export async function createAdminUser(
  email: string,
  password: string,
  name?: string
) {
  try {
    const hashedPassword = hashPassword(password);

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name: name || "Admin",
      },
    });

    console.log("Admin user created successfully:", user.email);
    return user;
  } catch (error: any) {
    if (error.code === "P2002") {
      console.log("User with this email already exists");
      return null;
    }
    console.error("Error creating admin user:", error);
    throw error;
  }
}

export function verifyPassword(
  password: string,
  hashedPassword: string
): boolean {
  return bcrypt.compareSync(password, hashedPassword);
}

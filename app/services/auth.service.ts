import { prisma } from "@/app/lib/prisma";
import bcrypt from "bcryptjs";

export class AuthService {
  async register(data: { name: string; email: string; password: string }) {
    const existUser = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existUser) {
      throw new Error("Email já está em uso");
    }

    const hashdPassword = await bcrypt.hash(data.password, 10);

    const user = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        password: hashdPassword,
      },
    });

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt,
    };
  }

  async login(email: string, password: string) {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new Error("Email ou senha inválidos");
    }

    return {
      id: user.id,
      name: user.name,
      email: user.email,
    };
  }

  async validateCpf(cpf: string) {
    const user = await prisma.user.findUnique({ where: { cpf } });
    if (!user) throw new Error("CPF não encontrado");
    if (user.isActive) throw new Error("CPF já ativo. Faça o login");

    return { name: user.name };
  }

  async completeRegistration(data: {
    cpf: string;
    email: string;
    password: string;
  }) {
    const hashedPassword = await bcrypt.hash(data.password, 10);

    return await prisma.user.update({
      where: { cpf: data.cpf },
      data: {
        email: data.email,
        password: hashedPassword,
        isActive: true,
      },
    });
  }
}

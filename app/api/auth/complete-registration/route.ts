import { NextResponse } from "next/server";
import { AuthService } from "@/app/services/auth.service";

const authService = new AuthService();

export async function POST(req: Request) {
  try {
    const { cpf, email, password } = await req.json();
    await authService.completeRegistration({ cpf, email, password });
    return NextResponse.json({ message: "Cadastro completo com sucesso" });
  } catch (error) {
    return NextResponse.json(
      { message: "Erro ao completar cadastro" },
      { status: 500 },
    );
  }
}

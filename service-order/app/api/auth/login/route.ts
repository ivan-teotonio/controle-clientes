import { NextRequest, NextResponse } from "next/server";
import { AuthService } from "@/app/services/auth.service";
import { generateAccessToken, generateRefreshToken } from "@/app/lib/jwt";

const authService = new AuthService();

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { message: "email e password são obrigatórios" },
        { status: 400 },
      );
    }

    const user = await authService.login(email, password);
    const accessToken = generateAccessToken({ id: user.id });
    const refreshToken = generateRefreshToken({
      id: user.id,
      email: user.email,
    });

    const response = NextResponse.json({ user, accessToken });

    response.cookies.set("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (error) {
    console.error("ERRO LOGIN:", error);
    if (
      error instanceof Error &&
      error.message === "Email ou senha inválidos"
    ) {
      return NextResponse.json({ message: error.message }, { status: 401 });
    }
    return NextResponse.json(
      { message: "Erro interno do servidor" },
      { status: 500 },
    );
  }
}

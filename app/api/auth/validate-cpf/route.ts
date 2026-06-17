import { NextResponse } from "next/server";
import { AuthService } from "@/app/services/auth.service";

const authService = new AuthService();

export async function POST(req: Request) {
  try {
    const { cpf } = await req.json();
    const user = await authService.validaCpf(cpf);
    return NextResponse.json(user);
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 400 });
  }
}

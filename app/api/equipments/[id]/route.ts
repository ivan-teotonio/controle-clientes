import { NextRequest, NextResponse } from "next/server";
import { EquipmentService } from "@/app/services/equipment.service";
import { verifyToken } from "@/app/lib/jwt";

const equipmentService = new EquipmentService();

function getUserId(req: NextRequest) {
  const token = req.headers.get("authorization")?.split(" ")[1];
  if (!token) return null;
  const payload = verifyToken(token);
  return payload?.id ?? null;
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    if (!getUserId(req)) {
      return NextResponse.json({ message: "Não autorizado" }, { status: 401 });
    }
    const { id } = await params;
    const equipment = await equipmentService.findById(Number(id));
    return NextResponse.json(equipment);
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "Equipamento não encontrado"
    ) {
      return NextResponse.json({ message: error.message }, { status: 404 });
    }
    return NextResponse.json(
      { message: "Erro interno do servidor" },
      { status: 500 },
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    if (!getUserId(req)) {
      return NextResponse.json({ message: "Não autorizado" }, { status: 401 });
    }
    const { id } = await params;
    const data = await req.json();

    // ADICIONE ESTA LINHA PARA VER O QUE O FRONT ESTÁ ENVIANDO
    console.log("Dados recebidos no PATCH:", { id, data });

    const equipment = await equipmentService.update(Number(id), data);
    return NextResponse.json(equipment);
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "Equipamento não encontrado"
    ) {
      return NextResponse.json({ message: error.message }, { status: 404 });
    }
    return NextResponse.json(
      { message: "Erro interno do servidor" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    if (!getUserId(req)) {
      return NextResponse.json({ message: "Não autorizado" }, { status: 401 });
    }
    const { id } = await params;
    await equipmentService.delete(Number(id));
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "Equipamento não encontrado"
    ) {
      return NextResponse.json({ message: error.message }, { status: 404 });
    }
    return NextResponse.json(
      { message: "Erro interno do servidor" },
      { status: 500 },
    );
  }
}

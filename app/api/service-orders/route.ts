import { NextRequest, NextResponse } from "next/server";
import { ServiceOrderService } from "@/app/services/service-order.service";
import { verifyToken } from "@/app/lib/jwt";
import {
  ServiceOrderStatus,
  ServiceOrderPriority,
} from "@/app/services/service-order.service";
import { enviarParaFila } from "@/app/lib/sqs";

const serviceOrderService = new ServiceOrderService();

function getUserId(req: NextRequest) {
  const token = req.headers.get("authorization")?.split(" ")[1];
  if (!token) return null;
  const payload = verifyToken(token);
  return payload?.id ?? null;
}

export async function GET(req: NextRequest) {
  try {
    if (!getUserId(req)) {
      return NextResponse.json({ message: "Não autorizado" }, { status: 401 });
    }
    const page = Number(req.nextUrl.searchParams.get("page")) || 1;
    const limit = Number(req.nextUrl.searchParams.get("limit")) || 10;
    const status = req.nextUrl.searchParams.get(
      "status",
    ) as ServiceOrderStatus | null;
    const clientId = req.nextUrl.searchParams.get("clientId");
    const technicianId = req.nextUrl.searchParams.get("technicianId");

    const result = await serviceOrderService.findAll(page, limit, {
      ...(status && { status }),
      ...(clientId && { clientId: Number(clientId) }),
      ...(technicianId && { technicianId: Number(technicianId) }),
    });

    return NextResponse.json(result);
  } catch {
    return NextResponse.json(
      { message: "Erro interno do servidor" },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const userId = getUserId(req);
    if (!userId) {
      return NextResponse.json({ message: "Não autorizado" }, { status: 401 });
    }

    const {
      title,
      description,
      priority,
      clientId,
      technicianId,
      equipmentId,
    } = await req.json();

    if (!title || !description || !priority || !clientId) {
      return NextResponse.json(
        { message: "title, description, priority e clientId são obrigatórios" },
        { status: 400 },
      );
    }

    const order = await serviceOrderService.create({
      title,
      description,
      priority: priority as ServiceOrderPriority,
      clientId,
      openedById: userId,
      technicianId,
      equipmentId,
    });

    // --- NOVA FUNCIONALIDADE: Disparo Assíncrono ---
    await enviarParaFila({
      evento: "OS_CRIADA",
      osId: order.id,
      cliente: clientId,
      dataCriacao: new Date().toISOString(),
    });

    return NextResponse.json(order, { status: 201 });
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ message: error.message }, { status: 400 });
    }
    return NextResponse.json(
      { message: "Erro interno do servidor" },
      { status: 500 },
    );
  }
}

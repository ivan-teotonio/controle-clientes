import { prisma } from "@/app/lib/prisma";

export class EquipmentService {
  async create(data: {
    name: string;
    model: string;
    serialNumber: string;
    clientId: number;
  }) {
    const client = await prisma.client.findFirst({
      where: { id: data.clientId, deletedAt: null },
    });
    if (!client) throw new Error("Cliente não encontrado");
    return await prisma.equipment.create({ data });
  }

  async findAll(page = 1, limit = 10, clientId?: number) {
    const offset = (page - 1) * limit;
    const where = { deletedAt: null, ...(clientId && { clientId }) };

    const [data, total] = await Promise.all([
      prisma.equipment.findMany({
        where,
        skip: offset,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: { client: { select: { name: true } } },
      }),
      prisma.equipment.count({ where }),
    ]);

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findById(id: number) {
    const equipment = await prisma.equipment.findFirst({
      where: { id, deletedAt: null },
      include: { client: { select: { name: true } } },
    });
    if (!equipment) throw new Error("Equipamento não encontrado");
    return equipment;
  }

  async update(
    id: number,
    data: Partial<{
      name: string;
      model: string;
      serialNumber: string;
      clientId: number;
    }>,
  ) {
    await this.findById(id);
    return await prisma.equipment.update({ where: { id }, data });
  }

  async delete(id: number) {
    await this.findById(id);
    await prisma.equipment.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}

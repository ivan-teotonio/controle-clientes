"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Sidebar from "@/app/components/Sidebar";

interface ServiceOrder {
  id: number;
  title: string;
  status: string;
  priority: string;
  client: { name: string };
  technician: { name: string } | null;
  createdAt: string;
}

interface Stats {
  total: number;
  abertas: number;
  emAndamento: number;
  concluidas: number;
}

const statusColors: Record<string, string> = {
  ABERTA: "bg-blue-100 text-blue-700",
  EM_ANDAMENTO: "bg-yellow-100 text-yellow-700",
  CONCLUIDA: "bg-green-100 text-green-700",
  CANCELADA: "bg-red-100 text-red-700",
};

const statusLabels: Record<string, string> = {
  ABERTA: "Aberta",
  EM_ANDAMENTO: "Em andamento",
  CONCLUIDA: "Concluída",
  CANCELADA: "Cancelada",
};

const priorityColors: Record<string, string> = {
  ALTA: "bg-red-100 text-red-700",
  MEDIA: "bg-yellow-100 text-yellow-700",
  BAIXA: "bg-green-100 text-green-700",
};

export default function DashboardPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<ServiceOrder[]>([]);
  const [stats, setStats] = useState<Stats>({
    total: 0,
    abertas: 0,
    emAndamento: 0,
    concluidas: 0,
  });
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      router.push("/login");
      return;
    }
    fetchOrders(token);
  }, []);

  async function fetchOrders(token: string, status?: string) {
    setLoading(true);
    try {
      const url = status
        ? `/api/service-orders?status=${status}&limit=20`
        : `/api/service-orders?limit=20`;

      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.status === 401) {
        router.push("/login");
        return;
      }

      const data = await res.json();
      setOrders(data.data);

      const allRes = await fetch("/api/service-orders?limit=100", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const allData = await allRes.json();
      const all: ServiceOrder[] = allData.data;

      setStats({
        total: allData.total,
        abertas: all.filter((o) => o.status === "ABERTA").length,
        emAndamento: all.filter((o) => o.status === "EM_ANDAMENTO").length,
        concluidas: all.filter((o) => o.status === "CONCLUIDA").length,
      });
    } finally {
      setLoading(false);
    }
  }

  function handleFilter(status: string) {
    const token = localStorage.getItem("accessToken")!;
    setFilter(status);
    fetchOrders(token, status || undefined);
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar />

      <div className="flex-1 bg-gray-50 p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-lg font-medium text-gray-900">
              Ordens de Serviço
            </h1>
            <p className="text-sm text-gray-500">Gerencie todos os chamados</p>
          </div>
          <Link
            href="/service-orders/new"
            className="flex items-center gap-2 bg-[#1B3A5C] text-white text-sm px-4 py-2 rounded-lg hover:opacity-90 transition-opacity"
          >
            + Nova OS
          </Link>
        </div>

        <div className="grid grid-cols-4 gap-3 mb-6">
          {[
            {
              label: "Total de OS",
              value: stats.total,
              color: "text-gray-900",
            },
            { label: "Abertas", value: stats.abertas, color: "text-blue-600" },
            {
              label: "Em andamento",
              value: stats.emAndamento,
              color: "text-yellow-600",
            },
            {
              label: "Concluídas",
              value: stats.concluidas,
              color: "text-green-600",
            },
          ].map((stat) => (
            <div
              key={stat.label}
              className="bg-white border border-gray-200 rounded-lg p-4"
            >
              <p className="text-xs text-gray-500 mb-1">{stat.label}</p>
              <p className={`text-2xl font-medium ${stat.color}`}>
                {stat.value}
              </p>
            </div>
          ))}
        </div>

        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="flex gap-2 p-4 border-b border-gray-100">
            {[
              { label: "Todas", value: "" },
              { label: "Abertas", value: "ABERTA" },
              { label: "Em andamento", value: "EM_ANDAMENTO" },
              { label: "Concluídas", value: "CONCLUIDA" },
            ].map((f) => (
              <button
                key={f.value}
                onClick={() => handleFilter(f.value)}
                className={`px-3 py-1.5 text-xs rounded-md border transition-colors ${
                  filter === f.value
                    ? "bg-[#1B3A5C] text-white border-[#1B3A5C]"
                    : "bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="p-8 text-center text-gray-400 text-sm">
              Carregando...
            </div>
          ) : orders.length === 0 ? (
            <div className="p-8 text-center text-gray-400 text-sm">
              Nenhuma OS encontrada
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left px-4 py-3 text-xs text-gray-500 font-medium">
                    #
                  </th>
                  <th className="text-left px-4 py-3 text-xs text-gray-500 font-medium">
                    Título
                  </th>
                  <th className="text-left px-4 py-3 text-xs text-gray-500 font-medium">
                    Cliente
                  </th>
                  <th className="text-left px-4 py-3 text-xs text-gray-500 font-medium">
                    Técnico
                  </th>
                  <th className="text-left px-4 py-3 text-xs text-gray-500 font-medium">
                    Prioridade
                  </th>
                  <th className="text-left px-4 py-3 text-xs text-gray-500 font-medium">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr
                    key={order.id}
                    className="border-b border-gray-50 hover:bg-gray-50 transition-colors cursor-pointe"
                    onClick={() => router.push(`/service-orders/${order.id}`)}
                  >
                    <td className="px-4 py-3 text-gray-400">#{order.id}</td>
                    <td className="px-4 py-3 text-gray-900">{order.title}</td>
                    <td className="px-4 py-3 text-gray-600">
                      {order.client.name}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {order.technician?.name ?? "—"}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`text-xs px-2 py-1 rounded-md font-medium ${priorityColors[order.priority]}`}
                      >
                        {order.priority.charAt(0) +
                          order.priority.slice(1).toLowerCase()}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`text-xs px-2 py-1 rounded-md font-medium ${statusColors[order.status]}`}
                      >
                        {statusLabels[order.status]}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

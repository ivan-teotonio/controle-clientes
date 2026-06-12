"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Sidebar from "@/app/components/Sidebar";

interface ServiceOrder {
  id: number;
  title: string;
  description: string;
  status: string;
  priority: string;
  openedAt: string;
  concludedAt: string | null;
  client: { name: string };
  technician: { name: string } | null;
  equipment: { name: string } | null;
  openedBy: { name: string };
  history: {
    id: number;
    previousStatus: string | null;
    newStatus: string;
    observation: string | null;
    createdAt: string;
    changedBy: { name: string };
  }[];
}

interface Technician {
  id: number;
  name: string;
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

export default function ServiceOrderDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [order, setOrder] = useState<ServiceOrder | null>(null);
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [loading, setLoading] = useState(true);

  // modais
  const [showAssign, setShowAssign] = useState(false);
  const [showStatus, setShowStatus] = useState(false);
  const [showObservation, setShowObservation] = useState(false);

  // forms
  const [selectedTechnician, setSelectedTechnician] = useState("");
  const [newStatus, setNewStatus] = useState("");
  const [observation, setObservation] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      router.push("/login");
      return;
    }
    fetchOrder(token);
    fetchTechnicians(token);
  }, [id]);

  async function fetchOrder(token: string) {
    setLoading(true);
    try {
      const res = await fetch(`/api/service-orders/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.status === 401) {
        router.push("/login");
        return;
      }
      if (res.status === 404) {
        router.push("/dashboard");
        return;
      }
      const data = await res.json();
      setOrder(data);
    } finally {
      setLoading(false);
    }
  }

  async function fetchTechnicians(token: string) {
    const res = await fetch("/api/technicians?limit=100", {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    setTechnicians(data.data);
  }

  async function handleAssignTechnician() {
    const token = localStorage.getItem("accessToken")!;
    setSaving(true);
    setError("");
    try {
      const res = await fetch(`/api/service-orders/${id}/assign-technician`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ technicianId: Number(selectedTechnician) }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message);
        return;
      }
      setShowAssign(false);
      setSelectedTechnician("");
      fetchOrder(token);
    } finally {
      setSaving(false);
    }
  }

  async function handleUpdateStatus() {
    const token = localStorage.getItem("accessToken")!;
    setSaving(true);
    setError("");
    try {
      const res = await fetch(`/api/service-orders/${id}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus, observation }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message);
        return;
      }
      setShowStatus(false);
      setNewStatus("");
      setObservation("");
      fetchOrder(token);
    } finally {
      setSaving(false);
    }
  }

  async function handleAddObservation() {
    const token = localStorage.getItem("accessToken")!;
    setSaving(true);
    setError("");
    try {
      const res = await fetch(`/api/service-orders/${id}/observation`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ observation }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message);
        return;
      }
      setShowObservation(false);
      setObservation("");
      fetchOrder(token);
    } finally {
      setSaving(false);
    }
  }

  function getNextStatuses(current: string): string[] {
    const transitions: Record<string, string[]> = {
      ABERTA: ["EM_ANDAMENTO", "CANCELADA"],
      EM_ANDAMENTO: ["CONCLUIDA", "CANCELADA"],
      CONCLUIDA: [],
      CANCELADA: [],
    };
    return transitions[current] ?? [];
  }

  function formatDate(date: string) {
    return new Date(date).toLocaleString("pt-BR");
  }

  if (loading) {
    return (
      <div className="flex min-h-screen">
        <Sidebar />
        <div className="flex-1 bg-gray-50 p-6 flex items-center justify-center">
          <p className="text-gray-400 text-sm">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!order) return null;

  const nextStatuses = getNextStatuses(order.status);
  const isFinished =
    order.status === "CONCLUIDA" || order.status === "CANCELADA";

  return (
    <div className="flex min-h-screen">
      <Sidebar />

      <div className="flex-1 bg-gray-50 p-6">
        {/* breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
          <span
            onClick={() => router.push("/dashboard")}
            className="cursor-pointer hover:text-gray-700"
          >
            Ordens de Serviço
          </span>
          <span>›</span>
          <span className="text-gray-900">OS #{order.id}</span>
        </div>

        {/* header */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-lg font-medium text-gray-900">
                {order.title}
              </h1>
              <span
                className={`text-xs px-2 py-1 rounded-md font-medium ${statusColors[order.status]}`}
              >
                {statusLabels[order.status]}
              </span>
              <span
                className={`text-xs px-2 py-1 rounded-md font-medium ${priorityColors[order.priority]}`}
              >
                {order.priority.charAt(0) +
                  order.priority.slice(1).toLowerCase()}
              </span>
            </div>
            <p className="text-sm text-gray-500">
              Aberta em {formatDate(order.openedAt)}
            </p>
          </div>

          {/* ações */}
          {!isFinished && (
            <div className="flex gap-2">
              {order.status === "ABERTA" && (
                <button
                  onClick={() => setShowAssign(true)}
                  className="px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:opacity-90"
                >
                  Atribuir técnico
                </button>
              )}
              {nextStatuses.length > 0 && (
                <button
                  onClick={() => setShowStatus(true)}
                  className="px-3 py-2 text-sm bg-[#1B3A5C] text-white rounded-lg hover:opacity-90"
                >
                  Atualizar status
                </button>
              )}
              <button
                onClick={() => setShowObservation(true)}
                className="px-3 py-2 text-sm border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50"
              >
                Adicionar observação
              </button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-3 gap-4">
          {/* detalhes */}
          <div className="col-span-2 space-y-4">
            <div className="p-3 bg-white border border-gray-200 rounded-lg p-5">
              <p className="text-xs text-gray-500 font-medium mb-3 uppercase tracking-wide">
                Descrição
              </p>
              <p className="text-sm text-gray-700 leading-relaxed">
                {order.description}
              </p>
            </div>

            {/* histórico */}
            <div className="bg-white border border-gray-200 rounded-lg p-3">
              <p className="text-xs text-gray-500 font-medium mb-4 uppercase tracking-wide">
                Histórico
              </p>
              <div className="space-y-4">
                {order.history.map((h) => (
                  <div key={h.id} className="flex gap-3">
                    <div className="w-2 h-2 rounded-full bg-[#1B3A5C] mt-1.5 shrink-0"></div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        {h.previousStatus ? (
                          <span className="text-xs text-gray-500">
                            <span
                              className={`px-1.5 py-0.5 rounded text-xs font-medium ${statusColors[h.previousStatus]}`}
                            >
                              {statusLabels[h.previousStatus]}
                            </span>
                            {" → "}
                            <span
                              className={`px-1.5 py-0.5 rounded text-xs font-medium ${statusColors[h.newStatus]}`}
                            >
                              {statusLabels[h.newStatus]}
                            </span>
                          </span>
                        ) : (
                          <span
                            className={`px-1.5 py-0.5 rounded text-xs font-medium ${statusColors[h.newStatus]}`}
                          >
                            {statusLabels[h.newStatus]}
                          </span>
                        )}
                        <span className="text-xs text-gray-400">
                          por {h.changedBy.name}
                        </span>
                      </div>
                      {h.observation && (
                        <p className="text-sm text-gray-600">{h.observation}</p>
                      )}
                      <p className="text-xs text-gray-400 mt-1">
                        {formatDate(h.createdAt)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* sidebar da OS */}
          <div className="space-y-4">
            <div className="p-3 bg-white border border-gray-200 rounded-lg p-5 space-y-4">
              <div>
                <p className="text-xs text-gray-400 mb-1">Cliente</p>
                <p className="text-sm text-gray-900 font-medium">
                  {order.client.name}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-1">Técnico</p>
                <p className="text-sm text-gray-900 font-medium">
                  {order.technician?.name ?? "Não atribuído"}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-1">Equipamento</p>
                <p className="text-sm text-gray-900 font-medium">
                  {order.equipment?.name ?? "—"}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-1">Aberta por</p>
                <p className="text-sm text-gray-900 font-medium">
                  {order.openedBy.name}
                </p>
              </div>
              {order.concludedAt && (
                <div>
                  <p className="text-xs text-gray-400 mb-1">Concluída em</p>
                  <p className="text-sm text-gray-900 font-medium">
                    {formatDate(order.concludedAt)}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* modal atribuir técnico */}
      {showAssign && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-lg">
            <h2 className="text-base font-medium text-gray-900 mb-4">
              Atribuir técnico
            </h2>
            {error && (
              <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}
            <select
              value={selectedTechnician}
              onChange={(e) => setSelectedTechnician(e.target.value)}
              className="w-full h-10 px-3 text-sm border border-gray-200 rounded-lg outline-none focus:border-[#1B3A5C] bg-white mb-4"
            >
              <option value="">Selecione o técnico...</option>
              {technicians.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => {
                  setShowAssign(false);
                  setError("");
                }}
                className="px-4 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleAssignTechnician}
                disabled={saving || !selectedTechnician}
                className="px-4 py-2 text-sm bg-[#1B3A5C] text-white rounded-lg hover:opacity-90 disabled:opacity-50"
              >
                {saving ? "Salvando..." : "Atribuir"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* modal atualizar status */}
      {showStatus && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-lg">
            <h2 className="text-base font-medium text-gray-900 mb-4">
              Atualizar status
            </h2>
            {error && (
              <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}
            <div className="space-y-3">
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                className="w-full h-10 px-3 text-sm border border-gray-200 rounded-lg outline-none focus:border-[#1B3A5C] bg-white"
              >
                <option value="">Selecione o novo status...</option>
                {nextStatuses.map((s) => (
                  <option key={s} value={s}>
                    {statusLabels[s]}
                  </option>
                ))}
              </select>
              <textarea
                value={observation}
                onChange={(e) => setObservation(e.target.value)}
                placeholder="Observação (opcional)..."
                rows={3}
                className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg outline-none focus:border-[#1B3A5C] resize-none"
              />
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={() => {
                  setShowStatus(false);
                  setError("");
                }}
                className="px-4 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleUpdateStatus}
                disabled={saving || !newStatus}
                className="px-4 py-2 text-sm bg-[#1B3A5C] text-white rounded-lg hover:opacity-90 disabled:opacity-50"
              >
                {saving ? "Salvando..." : "Atualizar"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* modal observação */}
      {showObservation && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-lg">
            <h2 className="text-base font-medium text-gray-900 mb-4">
              Adicionar observação
            </h2>
            {error && (
              <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}
            <textarea
              value={observation}
              onChange={(e) => setObservation(e.target.value)}
              placeholder="Digite a observação..."
              rows={4}
              className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg outline-none focus:border-[#1B3A5C] resize-none mb-4"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => {
                  setShowObservation(false);
                  setError("");
                }}
                className="px-4 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleAddObservation}
                disabled={saving || !observation}
                className="px-4 py-2 text-sm bg-[#1B3A5C] text-white rounded-lg hover:opacity-90 disabled:opacity-50"
              >
                {saving ? "Salvando..." : "Salvar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

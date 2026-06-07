"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/app/components/Sidebar";

interface Client {
  id: number;
  name: string;
}
interface Technician {
  id: number;
  name: string;
}
interface Equipment {
  id: number;
  name: string;
  client: { name: string };
}

export default function NewServiceOrderPage() {
  const router = useRouter();
  const [clients, setClients] = useState<Client[]>([]);
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [equipments, setEquipments] = useState<Equipment[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    title: "",
    description: "",
    priority: "MEDIA",
    clientId: "",
    technicianId: "",
    equipmentId: "",
  });

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      router.push("/login");
      return;
    }
    fetchData(token);
  }, []);

  async function fetchData(token: string) {
    const [clientsRes, techniciansRes, equipmentsRes] = await Promise.all([
      fetch("/api/clients?limit=100", {
        headers: { Authorization: `Bearer ${token}` },
      }),
      fetch("/api/technicians?limit=100", {
        headers: { Authorization: `Bearer ${token}` },
      }),
      fetch("/api/equipments?limit=100", {
        headers: { Authorization: `Bearer ${token}` },
      }),
    ]);

    const [clientsData, techniciansData, equipmentsData] = await Promise.all([
      clientsRes.json(),
      techniciansRes.json(),
      equipmentsRes.json(),
    ]);

    setClients(clientsData.data);
    setTechnicians(techniciansData.data);
    setEquipments(equipmentsData.data);
  }

  async function handleSave() {
    const token = localStorage.getItem("accessToken")!;
    setSaving(true);
    setError("");

    try {
      const body: Record<string, unknown> = {
        title: form.title,
        description: form.description,
        priority: form.priority,
        clientId: Number(form.clientId),
      };
      if (form.technicianId) body.technicianId = Number(form.technicianId);
      if (form.equipmentId) body.equipmentId = Number(form.equipmentId);

      const res = await fetch("/api/service-orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.message);
        return;
      }

      router.push("/dashboard");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 bg-gray-50 p-6">
        <div className="mb-6">
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
            <span
              onClick={() => router.push("/dashboard")}
              className="cursor-pointer hover:text-gray-700"
            >
              Ordens de Serviço
            </span>
            <span>›</span>
            <span className="text-gray-900">Nova OS</span>
          </div>
          <h1 className="text-lg font-medium text-gray-900">
            Nova ordem de serviço
          </h1>
          <p className="text-sm text-gray-500">Preencha os dados do chamado</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        <div className="space-y-4 max-w-2xl">
          {/* dados do chamado */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h2 className="text-sm font-medium text-gray-900 mb-4 pb-3 border-b border-gray-100">
              Dados do chamado
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1.5">
                  Título
                </label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="Ex: Compressor sem pressão"
                  className="w-full h-10 px-3 text-sm border border-gray-200 rounded-lg outline-none focus:border-[#1B3A5C] transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-600 mb-1.5">
                  Descrição
                </label>
                <textarea
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                  placeholder="Descreva o problema com detalhes..."
                  rows={3}
                  className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg outline-none focus:border-[#1B3A5C] transition-colors resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-600 mb-1.5">
                    Prioridade
                  </label>
                  <select
                    value={form.priority}
                    onChange={(e) =>
                      setForm({ ...form, priority: e.target.value })
                    }
                    className="w-full h-10 px-3 text-sm border border-gray-200 rounded-lg outline-none focus:border-[#1B3A5C] bg-white"
                  >
                    <option value="BAIXA">Baixa</option>
                    <option value="MEDIA">Média</option>
                    <option value="ALTA">Alta</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm text-gray-600 mb-1.5">
                    Cliente
                  </label>
                  <select
                    value={form.clientId}
                    onChange={(e) =>
                      setForm({ ...form, clientId: e.target.value })
                    }
                    className="w-full h-10 px-3 text-sm border border-gray-200 rounded-lg outline-none focus:border-[#1B3A5C] bg-white"
                  >
                    <option value="">Selecione o cliente...</option>
                    {clients.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* atribuição */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h2 className="text-sm font-medium text-gray-900 mb-1 pb-3 border-b border-gray-100">
              Atribuição{" "}
              <span className="text-gray-400 font-normal">(opcional)</span>
            </h2>
            <p className="text-xs text-gray-400 mb-4">
              Pode ser atribuído depois
            </p>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1.5">
                  Técnico
                </label>
                <select
                  value={form.technicianId}
                  onChange={(e) =>
                    setForm({ ...form, technicianId: e.target.value })
                  }
                  className="w-full h-10 px-3 text-sm border border-gray-200 rounded-lg outline-none focus:border-[#1B3A5C] bg-white"
                >
                  <option value="">Selecione o técnico...</option>
                  {technicians.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm text-gray-600 mb-1.5">
                  Equipamento
                </label>
                <select
                  value={form.equipmentId}
                  onChange={(e) =>
                    setForm({ ...form, equipmentId: e.target.value })
                  }
                  className="w-full h-10 px-3 text-sm border border-gray-200 rounded-lg outline-none focus:border-[#1B3A5C] bg-white"
                >
                  <option value="">Selecione o equipamento...</option>
                  {equipments.map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.name} — {e.client.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <button
              onClick={() => router.push("/dashboard")}
              className="px-4 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              disabled={
                saving || !form.title || !form.description || !form.clientId
              }
              className="px-4 py-2 text-sm bg-[#1B3A5C] text-white rounded-lg hover:opacity-90 disabled:opacity-50"
            >
              {saving ? "Abrindo..." : "Abrir OS"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/app/components/Sidebar";

interface Equipment {
  id: number;
  name: string;
  model: string;
  serialNumber: string;
  client: { name: string };
}

interface Client {
  id: number;
  name: string;
}

export default function EquipmentsPage() {
  const router = useRouter();
  const [equipments, setEquipments] = useState<Equipment[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    name: "",
    model: "",
    serialNumber: "",
    clientId: "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      router.push("/login");
      return;
    }
    fetchEquipments(token);
    fetchClients(token);
  }, []);

  async function fetchEquipments(token: string) {
    setLoading(true);
    try {
      const res = await fetch("/api/equipments?limit=20", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.status === 401) {
        router.push("/login");
        return;
      }
      const data = await res.json();
      setEquipments(data.data);
    } finally {
      setLoading(false);
    }
  }

  async function fetchClients(token: string) {
    const res = await fetch("/api/clients?limit=100", {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    setClients(data.data);
  }

  async function handleSave() {
    const token = localStorage.getItem("accessToken")!;
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/equipments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ ...form, clientId: Number(form.clientId) }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message);
        return;
      }
      setShowForm(false);
      setForm({ name: "", model: "", serialNumber: "", clientId: "" });
      fetchEquipments(token);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("Deseja remover este equipamento?")) return;
    const token = localStorage.getItem("accessToken")!;
    await fetch(`/api/equipments/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    fetchEquipments(token);
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar />

      <div className="flex-1 bg-gray-50 p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-lg font-medium text-gray-900">Equipamentos</h1>
            <p className="text-sm text-gray-500">
              Gerencie os equipamentos dos clientes
            </p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="bg-[#1B3A5C] text-white text-sm px-4 py-2 rounded-lg hover:opacity-90 transition-opacity"
          >
            + Novo equipamento
          </button>
        </div>

        {showForm && (
          <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-lg">
              <h2 className="text-base font-medium text-gray-900 mb-4">
                Novo equipamento
              </h2>

              {error && (
                <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              <div className="space-y-3">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">
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
                {[
                  {
                    label: "Nome",
                    key: "name",
                    placeholder: "Compressor AR-200",
                  },
                  { label: "Modelo", key: "model", placeholder: "AR-200 Pro" },
                  {
                    label: "Número de série",
                    key: "serialNumber",
                    placeholder: "SN-001-2024",
                  },
                ].map((field) => (
                  <div key={field.key}>
                    <label className="block text-sm text-gray-600 mb-1">
                      {field.label}
                    </label>
                    <input
                      type="text"
                      value={form[field.key as keyof typeof form]}
                      onChange={(e) =>
                        setForm({ ...form, [field.key]: e.target.value })
                      }
                      placeholder={field.placeholder}
                      className="w-full h-10 px-3 text-sm border border-gray-200 rounded-lg outline-none focus:border-[#1B3A5C] transition-colors"
                    />
                  </div>
                ))}
              </div>

              <div className="flex justify-end gap-2 mt-5">
                <button
                  onClick={() => {
                    setShowForm(false);
                    setError("");
                  }}
                  className="px-4 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="px-4 py-2 text-sm bg-[#1B3A5C] text-white rounded-lg hover:opacity-90 disabled:opacity-50"
                >
                  {saving ? "Salvando..." : "Salvar"}
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-gray-400 text-sm">
              Carregando...
            </div>
          ) : equipments.length === 0 ? (
            <div className="p-8 text-center text-gray-400 text-sm">
              Nenhum equipamento encontrado
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left px-4 py-3 text-xs text-gray-500 font-medium">
                    Nome
                  </th>
                  <th className="text-left px-4 py-3 text-xs text-gray-500 font-medium">
                    Modelo
                  </th>
                  <th className="text-left px-4 py-3 text-xs text-gray-500 font-medium">
                    Nº de série
                  </th>
                  <th className="text-left px-4 py-3 text-xs text-gray-500 font-medium">
                    Cliente
                  </th>
                  <th className="text-left px-4 py-3 text-xs text-gray-500 font-medium">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody>
                {equipments.map((equipment) => (
                  <tr
                    key={equipment.id}
                    className="border-b border-gray-50 hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-4 py-3 text-gray-900 font-medium">
                      {equipment.name}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {equipment.model}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {equipment.serialNumber}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {equipment.client.name}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleDelete(equipment.id)}
                        className="text-xs text-red-500 hover:text-red-700 transition-colors"
                      >
                        Remover
                      </button>
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

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/app/components/Sidebar";

interface Technician {
  id: number;
  name: string;
  email: string;
  phone: string;
  specialty: string;
}

export default function TechniciansPage() {
  const router = useRouter();
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    specialty: "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      router.push("/login");
      return;
    }
    fetchTechnicians(token);
  }, []);

  async function fetchTechnicians(token: string, search = "") {
    setLoading(true);
    try {
      const res = await fetch(`/api/technicians?search=${search}&limit=20`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.status === 401) {
        router.push("/login");
        return;
      }
      const data = await res.json();
      setTechnicians(data.data);
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    const token = localStorage.getItem("accessToken")!;
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/technicians", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message);
        return;
      }
      setShowForm(false);
      setForm({ name: "", email: "", phone: "", specialty: "" });
      fetchTechnicians(token);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("Deseja remover este técnico?")) return;
    const token = localStorage.getItem("accessToken")!;
    await fetch(`/api/technicians/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    fetchTechnicians(token);
  }

  function handleSearch(e: React.ChangeEvent<HTMLInputElement>) {
    const token = localStorage.getItem("accessToken")!;
    setSearch(e.target.value);
    fetchTechnicians(token, e.target.value);
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar />

      <div className="flex-1 bg-gray-50 p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-lg font-medium text-gray-900">Técnicos</h1>
            <p className="text-sm text-gray-500">
              Gerencie os técnicos do sistema
            </p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="bg-[#1B3A5C] text-white text-sm px-4 py-2 rounded-lg hover:opacity-90 transition-opacity"
          >
            + Novo técnico
          </button>
        </div>

        <div className="mb-4">
          <input
            type="text"
            value={search}
            onChange={handleSearch}
            placeholder="Buscar por nome ou especialidade..."
            className="w-full max-w-sm h-10 px-3 text-sm border border-gray-200 rounded-lg bg-white outline-none focus:border-[#1B3A5C] transition-colors"
          />
        </div>

        {showForm && (
          <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-lg">
              <h2 className="text-base font-medium text-gray-900 mb-4">
                Novo técnico
              </h2>

              {error && (
                <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              <div className="space-y-3">
                {[
                  { label: "Nome", key: "name", placeholder: "João Silva" },
                  {
                    label: "E-mail",
                    key: "email",
                    placeholder: "joao@osmanager.com",
                  },
                  {
                    label: "Telefone",
                    key: "phone",
                    placeholder: "(81) 99999-0000",
                  },
                  {
                    label: "Especialidade",
                    key: "specialty",
                    placeholder: "Elétrica, Hidráulica...",
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
          ) : technicians.length === 0 ? (
            <div className="p-8 text-center text-gray-400 text-sm">
              Nenhum técnico encontrado
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left px-4 py-3 text-xs text-gray-500 font-medium">
                    Nome
                  </th>
                  <th className="text-left px-4 py-3 text-xs text-gray-500 font-medium">
                    E-mail
                  </th>
                  <th className="text-left px-4 py-3 text-xs text-gray-500 font-medium">
                    Telefone
                  </th>
                  <th className="text-left px-4 py-3 text-xs text-gray-500 font-medium">
                    Especialidade
                  </th>
                  <th className="text-left px-4 py-3 text-xs text-gray-500 font-medium">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody>
                {technicians.map((technician) => (
                  <tr
                    key={technician.id}
                    className="border-b border-gray-50 hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-4 py-3 text-gray-900 font-medium">
                      {technician.name}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {technician.email}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {technician.phone}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {technician.specialty}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleDelete(technician.id)}
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

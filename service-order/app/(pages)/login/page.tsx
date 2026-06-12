"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Erro ao fazer login");
        return;
      }

      // salva o token no localStorage
      localStorage.setItem("accessToken", data.accessToken);
      localStorage.setItem("user", JSON.stringify(data.user));

      // redireciona para o dashboard
      router.push("/dashboard");
    } catch {
      setError("Erro ao conectar com o servidor");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="flex w-full max-w-3xl rounded-xl overflow-hidden shadow-sm border border-gray-200">
        {/* lado esquerdo — azul */}
        <div className="hidden md:flex flex-col justify-between w-2/5 bg-[#1B3A5C] p-8">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-4 h-4 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M11.42 15.17 17.25 21A2.652 2.652 0 0 0 21 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 1 1-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 0 0 4.486-6.336l-3.276 3.277a3.004 3.004 0 0 1-2.25-2.25l3.276-3.276a4.5 4.5 0 0 0-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085m-1.745 1.437L5.909 7.5H4.5L2.25 3.75l1.5-1.5L7.5 4.5v1.409l4.26 4.26m-1.745 1.437 1.745-1.437m6.615 8.206L15.75 15.75M4.867 19.125h.008v.008h-.008v-.008Z"
                />
              </svg>
            </div>
            <span className="text-white font-medium text-sm">OS Manager</span>
          </div>

          <div className="space-y-4">
            <div>
              <h1 className="text-white text-lg font-medium mb-1">
                Gerencie seus chamados
              </h1>
              <p className="text-white/60 text-xs leading-relaxed">
                Controle ordens de serviço, técnicos e clientes em um só lugar.
              </p>
            </div>

            <div className="space-y-2">
              {[
                { icon: "👥", text: "Controle de técnicos" },
                { icon: "📋", text: "Gestão de chamados" },
                { icon: "🏢", text: "Cadastro de clientes" },
              ].map((item) => (
                <div
                  key={item.text}
                  className="flex items-center gap-2 bg-white/10 rounded-md px-3 py-2"
                >
                  <span className="text-xs">{item.icon}</span>
                  <span className="text-white/80 text-xs">{item.text}</span>
                </div>
              ))}
            </div>
          </div>

          <p className="text-white/30 text-xs">OS Manager © 2024</p>
        </div>

        {/* lado direito — formulário */}
        <div className="flex-1 flex items-center justify-center bg-white p-8">
          <div className="w-full max-w-sm">
            <div className="mb-6">
              <h2 className="text-lg font-medium text-gray-900 mb-1">
                Bem-vindo
              </h2>
              <p className="text-sm text-gray-500">
                Digite seus dados para entrar
              </p>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1.5">
                  E-mail
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seuemail@osmanager.com"
                  required
                  className="w-full h-10 px-3 text-sm border border-gray-200 rounded-lg bg-white text-gray-900 outline-none focus:border-[#1B3A5C] transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-600 mb-1.5">
                  Senha
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full h-10 px-3 text-sm border border-gray-200 rounded-lg bg-white text-gray-900 outline-none focus:border-[#1B3A5C] transition-colors"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full h-10 bg-[#1B3A5C] text-white text-sm font-medium rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {loading ? "Entrando..." : "Entrar"}
              </button>
            </form>

            <p className="text-xs text-gray-400 text-center mt-6">
              OS Manager © 2024
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState(1); //1 valida cpf, 2 completa dados
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [cpf, setCpf] = useState("");
  const [userName, setUserName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const formatCpf = (value: string) => {
    return value
      .replace(/\D/g, "")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1.$2");
  };

  async function handleValidateCpf() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/validate-cpf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cpf }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "CPF não autorizado");
        return;
      }
      setUserName(data.userName); //retorno da api
      setStep(2); //avança para o próximo passo
    } catch {
      setError("Erro ao validar CPF. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  async function handleCompleteRegistration() {
    setLoading(true);
    try {
      const res = await fetch("/api/auth/complete-registration", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cpf, email, password }),
      });

      if (res.ok) {
        alert("Cadastro concluído com sucesso!");
        router.push("/login");
      } else {
        setError("Erro ao salvar dados no servidor.");
      }
    } catch {
      setError("Erro de conexão.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      {/* Container principal centralizado e com estilos idênticos ao login */}
      <div className="flex w-full max-w-3xl rounded-xl overflow-hidden shadow-sm border border-gray-200 bg-white">
        {/* Formulário de Cadastro (lado direito) */}
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="w-full max-w-sm">
            <h2 className="text-lg font-medium text-gray-900 mb-6">
              {step === 1 ? "Validação de CPF" : "Complete seu cadastro"}
            </h2>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
                {error}
              </div>
            )}

            <div className="space-y-4">
              {step === 1 ? (
                <>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1.5">
                      CPF
                    </label>
                    <input
                      type="text"
                      placeholder="000.000.000-00"
                      value={cpf}
                      onChange={(e) => setCpf(formatCpf(e.target.value))}
                      className="w-full h-10 px-3 text-sm border border-gray-200 rounded-lg outline-none focus:border-[#1B3A5C]"
                    />
                    <button
                      onClick={handleValidateCpf}
                      disabled={loading}
                      className="w-full h-10 bg-[#1B3A5C] text-white rounded-lg"
                    >
                      {loading ? "Validando..." : "Validar CPF"}
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1.5">
                      Nome
                    </label>
                    <input
                      type="text"
                      value={userName}
                      disabled
                      className="w-full h-10 px-3 text-sm bg-gray-50 border rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1.5">
                      E-mail
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full h-10 px-3 tex-sm border border-gray-200 rounded-lg"
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
                      className="w-full h-10 px-3 text-sm border border-gray-200 rounded-lg"
                    />
                  </div>
                  <button
                    onClick={handleCompleteRegistration}
                    className="w-full h-10 bg-[#1B3A5C] text-white rounded-lg"
                  >
                    Completar Cadastro
                  </button>
                </>
              )}

              <button
                onClick={() => (step === 2 ? setStep(1) : router.back())}
                className="w-full h-10 border border-gray-200 text-gray-600 text-sm rounded-lg"
              >
                {step === 2 ? "Voltar" : "Cancelar"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

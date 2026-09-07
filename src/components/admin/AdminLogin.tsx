'use client';

import React, { useState } from 'react';
import { useStore } from '@/store/useStore';
import {
  Lock,
  User,
  KeyRound,
  Eye,
  EyeOff,
  ArrowLeft,
  AlertCircle,
  Users,
} from 'lucide-react';
import Link from 'next/link';

export const AdminLogin: React.FC = () => {
  const { adminLogin, adminUsers } = useStore();
  const [username, setUsername] = useState('gerente');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const success = adminLogin(password, username);
    if (!success) {
      setError(true);
    } else {
      setError(false);
    }
  };

  const handleSelectUser = (userUsername: string, userPass: string) => {
    setUsername(userUsername);
    setPassword(userPass);
    setError(false);
  };

  return (
    <div className="min-h-screen bg-stone-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden select-none">
      {/* Luzes de fundo decorativas */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4">
        {/* Logo & Título */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-amber-500 via-orange-500 to-amber-600 flex items-center justify-center mx-auto mb-4 shadow-xl shadow-orange-500/20 text-3xl rotate-[-3deg]">
            🥟
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white font-display">
            Acesso Restrito da Equipe
          </h2>
          <p className="mt-1 text-xs sm:text-sm text-stone-400">
            Painel Administrativo da Cozinha, Estoque & Atendimento
          </p>
        </div>

        {/* Card do Formulário */}
        <div className="bg-stone-900/90 border border-stone-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-md space-y-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Usuário */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-400 mb-1.5">
                Usuário / Login
              </label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-500" />
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value);
                    if (error) setError(false);
                  }}
                  placeholder="Ex: gerente / cozinha / caixa"
                  className="w-full pl-11 pr-4 py-3 rounded-2xl bg-stone-950 border border-stone-800 text-stone-100 text-sm outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all font-mono"
                />
              </div>
            </div>

            {/* Senha */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-400 mb-1.5">
                Senha de Acesso
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (error) setError(false);
                  }}
                  placeholder="••••••••••••"
                  className="w-full pl-11 pr-12 py-3 rounded-2xl bg-stone-950 border border-stone-800 text-stone-100 text-sm outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-500 hover:text-stone-300"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Erro de Senha */}
            {error && (
              <div className="p-3 rounded-xl bg-red-950/60 border border-red-800 text-red-300 text-xs flex items-center gap-2 animate-fade-in">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                <span>Login ou senha incorretos. Clique em uma das contas de demonstração abaixo.</span>
              </div>
            )}

            {/* Botão de Entrar */}
            <button
              type="submit"
              id="admin-login-button"
              className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-stone-950 font-black rounded-2xl shadow-lg shadow-orange-500/20 transition-all transform active:scale-98 text-sm flex items-center justify-center gap-2"
            >
              <KeyRound className="w-4 h-4" />
              <span>Entrar no Painel</span>
            </button>
          </form>

          {/* Contas de Demonstração / Atalhos Rápidos */}
          <div className="pt-4 border-t border-stone-800/80 space-y-2.5">
            <span className="text-[11px] text-stone-400 font-bold uppercase tracking-wider block">
              Contas da Equipe (Clique para Testar):
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {adminUsers.map((u) => (
                <button
                  key={u.id}
                  type="button"
                  onClick={() => handleSelectUser(u.username, u.password)}
                  className={`p-2.5 rounded-xl border text-left text-xs transition-all ${
                    username === u.username
                      ? 'border-amber-500 bg-amber-500/10 text-amber-300'
                      : 'border-stone-800 bg-stone-950/80 hover:bg-stone-800 text-stone-400'
                  }`}
                >
                  <span className="font-bold block text-stone-200">{u.name}</span>
                  <span className="text-[10px] font-mono opacity-70">@{u.username}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Voltar para a Tela do Cliente */}
          <div className="text-center pt-2">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs text-stone-500 hover:text-stone-300 font-semibold transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Voltar ao Cardápio do Cliente</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

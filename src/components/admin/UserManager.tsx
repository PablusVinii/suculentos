'use client';

import React, { useState } from 'react';
import { useStore } from '@/store/useStore';
import { AdminRole, AdminUser } from '@/types';
import { formatTime } from '@/utils/format';
import {
  Users,
  KeyRound,
  UserPlus,
  Shield,
  Edit2,
  Trash2,
  Check,
  X,
  Eye,
  EyeOff,
  Sparkles,
  Lock,
  UserCheck,
  RotateCcw,
  AlertCircle,
} from 'lucide-react';

export const UserManager: React.FC = () => {
  const {
    adminUser,
    adminUsers,
    addAdminUser,
    updateAdminUser,
    deleteAdminUser,
    resetAdminUsersToDefault,
  } = useStore();

  // Estados de modais
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
  const [changingPasswordUser, setChangingPasswordUser] = useState<AdminUser | null>(null);

  // Form Novo Usuário
  const [newName, setNewName] = useState('');
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newRole, setNewRole] = useState<AdminRole>('Cozinha / Pasteleiro');
  const [showNewPassword, setShowNewPassword] = useState(false);

  // Form Alterar Senha
  const [targetPassword, setTargetPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showTargetPassword, setShowTargetPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');

  // Form Editar Dados Básicos
  const [editName, setEditName] = useState('');
  const [editUsername, setEditUsername] = useState('');
  const [editRole, setEditRole] = useState<AdminRole>('Gerente');

  // Adicionar usuário
  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newUsername.trim() || !newPassword.trim()) return;

    addAdminUser({
      name: newName,
      username: newUsername,
      password: newPassword,
      role: newRole,
    });

    setNewName('');
    setNewUsername('');
    setNewPassword('');
    setIsAddUserOpen(false);
  };

  // Abrir modal de edição
  const handleOpenEdit = (user: AdminUser) => {
    setEditingUser(user);
    setEditName(user.name);
    setEditUsername(user.username);
    setEditRole(user.role);
  };

  // Salvar edição
  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser || !editName.trim() || !editUsername.trim()) return;

    updateAdminUser(editingUser.id, {
      name: editName.trim(),
      username: editUsername.trim().toLowerCase(),
      role: editRole,
    });

    setEditingUser(null);
  };

  // Abrir modal de alteração de senha
  const handleOpenPasswordModal = (user: AdminUser) => {
    setChangingPasswordUser(user);
    setTargetPassword('');
    setConfirmPassword('');
    setPasswordError('');
  };

  // Salvar nova senha
  const handleSavePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!changingPasswordUser) return;

    if (!targetPassword.trim()) {
      setPasswordError('A nova senha não pode estar vazia.');
      return;
    }

    if (targetPassword !== confirmPassword) {
      setPasswordError('As senhas digitadas não coincidem.');
      return;
    }

    updateAdminUser(changingPasswordUser.id, {
      password: targetPassword.trim(),
    });

    setChangingPasswordUser(null);
  };

  const getRoleBadge = (role: AdminRole) => {
    switch (role) {
      case 'Gerente':
        return 'bg-amber-100 text-amber-900 border-amber-300';
      case 'Cozinha / Pasteleiro':
        return 'bg-blue-100 text-blue-900 border-blue-300';
      case 'Caixa / Atendimento':
        return 'bg-emerald-100 text-emerald-900 border-emerald-300';
      default:
        return 'bg-stone-100 text-stone-800 border-stone-200';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in space-y-8">
      {/* Header da Seção */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-black text-stone-900 font-display">
              Gerenciamento de Usuários & Senhas 👥
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300">
              {adminUsers.length} membros
            </span>
          </div>
          <p className="text-xs sm:text-sm text-stone-500 mt-0.5">
            Gerencie quem tem acesso ao painel da cozinha, altere senhas e cadastre novos funcionários.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsAddUserOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-stone-950 font-black rounded-2xl shadow-md shadow-orange-500/20 text-xs sm:text-sm transition-all transform active:scale-95"
          >
            <UserPlus className="w-4 h-4" />
            <span>+ Novo Usuário</span>
          </button>

          <button
            onClick={resetAdminUsersToDefault}
            className="flex items-center gap-1.5 px-3 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs rounded-2xl transition-colors"
            title="Restaurar usuários e senhas originais"
          >
            <RotateCcw className="w-4 h-4" />
            <span className="hidden sm:inline">Restaurar Padrões</span>
          </button>
        </div>
      </div>

      {/* Card do Usuário Atualmente Conectado */}
      {adminUser && (
        <div className="bg-gradient-to-r from-stone-900 to-stone-800 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-stone-800 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-amber-500 text-stone-950 flex items-center justify-center font-black text-2xl font-display shadow-lg shadow-amber-500/20">
              {adminUser.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-xl font-black font-display text-white">
                  {adminUser.name}
                </h3>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  {adminUser.role}
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  Sessão Ativa
                </span>
              </div>
              <p className="text-xs text-stone-400 mt-1">
                Login de Acesso: <strong className="text-stone-200 font-mono">@{adminUser.username}</strong>
                {adminUser.lastLogin && ` • Conectado hoje às ${formatTime(adminUser.lastLogin)}`}
              </p>
            </div>
          </div>

          <button
            onClick={() => handleOpenPasswordModal(adminUser)}
            className="flex items-center justify-center gap-2 px-5 py-3 bg-stone-800 hover:bg-stone-700 text-stone-200 font-bold rounded-2xl border border-stone-700 text-xs transition-colors self-start md:self-auto"
          >
            <KeyRound className="w-4 h-4 text-amber-400" />
            <span>Alterar Minha Senha</span>
          </button>
        </div>
      )}

      {/* Tabela / Grid de Usuários Cadastrados */}
      <div className="bg-white rounded-3xl border border-stone-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-stone-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-amber-600" />
            <h3 className="font-extrabold text-stone-900 text-base font-display">
              Membros da Equipe com Acesso ({adminUsers.length})
            </h3>
          </div>
          <span className="text-xs text-stone-400">
            Todos os logins têm acesso autenticado à cozinha
          </span>
        </div>

        <div className="divide-y divide-stone-100">
          {adminUsers.map((user) => {
            const isCurrentUser = adminUser?.id === user.id;

            return (
              <div
                key={user.id}
                className="p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-stone-50/60 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-stone-100 border border-stone-200 text-stone-800 flex items-center justify-center font-bold text-lg font-display shrink-0">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-black text-stone-900 text-sm sm:text-base">
                        {user.name}
                      </h4>
                      {isCurrentUser && (
                        <span className="px-2 py-0.2 rounded-md bg-stone-900 text-white text-[10px] font-black">
                          Você
                        </span>
                      )}
                      <span
                        className={`px-2 py-0.5 rounded-full text-[11px] font-bold border ${getRoleBadge(
                          user.role
                        )}`}
                      >
                        {user.role}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-xs text-stone-500 mt-1">
                      <span>
                        Login: <strong className="text-stone-800 font-mono">@{user.username}</strong>
                      </span>
                      <span>•</span>
                      <span>
                        Senha: <span className="font-mono text-stone-400">••••••••</span>
                      </span>
                      {user.lastLogin && (
                        <>
                          <span className="hidden md:inline">•</span>
                          <span className="hidden md:inline">
                            Último login: {formatTime(user.lastLogin)}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Ações por Usuário */}
                <div className="flex items-center gap-2 self-end sm:self-auto">
                  <button
                    onClick={() => handleOpenPasswordModal(user)}
                    className="flex items-center gap-1.5 px-3 py-2 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 rounded-xl font-bold text-xs transition-colors"
                    title="Mudar senha deste usuário"
                  >
                    <KeyRound className="w-3.5 h-3.5 text-amber-600" />
                    <span>Mudar Senha</span>
                  </button>

                  <button
                    onClick={() => handleOpenEdit(user)}
                    className="p-2 text-stone-500 hover:text-stone-900 hover:bg-stone-100 rounded-xl transition-colors"
                    title="Editar dados"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>

                  {!isCurrentUser && adminUsers.length > 1 && (
                    <button
                      onClick={() => deleteAdminUser(user.id)}
                      className="p-2 text-stone-300 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                      title="Excluir usuário"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* =========================================================================
          MODAL: ADICIONAR NOVO USUÁRIO
      ========================================================================== */}
      {isAddUserOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 animate-fade-in">
          <div
            onClick={() => setIsAddUserOpen(false)}
            className="fixed inset-0 bg-stone-900/60 backdrop-blur-xs transition-opacity"
          />

          <div className="relative bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden border border-stone-100 z-10 p-6 sm:p-8 animate-slide-up space-y-6">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-stone-900 text-base font-display">
                    Novo Membro da Equipe
                  </h3>
                  <p className="text-[11px] text-stone-500">Crie o acesso para um atendente ou pasteleiro</p>
                </div>
              </div>
              <button
                onClick={() => setIsAddUserOpen(false)}
                className="p-1.5 text-stone-400 hover:text-stone-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
                  Nome Completo
                </label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Ex: Mateus Silva"
                  className="w-full px-4 py-2.5 rounded-2xl border border-stone-200 text-xs sm:text-sm outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
                  Login / Usuário (sem espaços)
                </label>
                <input
                  type="text"
                  required
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value.replace(/\s+/g, ''))}
                  placeholder="Ex: mateus_cozinha"
                  className="w-full px-4 py-2.5 rounded-2xl border border-stone-200 text-xs sm:text-sm outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
                  Cargo / Função
                </label>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value as AdminRole)}
                  className="w-full px-4 py-2.5 rounded-2xl border border-stone-200 text-xs sm:text-sm outline-none focus:border-amber-500 bg-white"
                >
                  <option value="Gerente">Gerente</option>
                  <option value="Cozinha / Pasteleiro">Cozinha / Pasteleiro</option>
                  <option value="Caixa / Atendimento">Caixa / Atendimento</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
                  Senha Inicial
                </label>
                <div className="relative">
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Mínimo de 4 caracteres"
                    className="w-full px-4 py-2.5 pr-10 rounded-2xl border border-stone-200 text-xs sm:text-sm outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
                  >
                    {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="pt-2 flex gap-2.5">
                <button
                  type="submit"
                  className="flex-1 py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-stone-950 font-black rounded-2xl shadow-md text-xs sm:text-sm transition-all"
                >
                  Criar Usuário
                </button>
                <button
                  type="button"
                  onClick={() => setIsAddUserOpen(false)}
                  className="px-4 py-3 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold rounded-2xl text-xs transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: ALTERAR SENHA
      ========================================================================== */}
      {changingPasswordUser && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 animate-fade-in">
          <div
            onClick={() => setChangingPasswordUser(null)}
            className="fixed inset-0 bg-stone-900/60 backdrop-blur-xs transition-opacity"
          />

          <div className="relative bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden border border-stone-100 z-10 p-6 sm:p-8 animate-slide-up space-y-6">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
                  <KeyRound className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-stone-900 text-base font-display">
                    Alterar Senha de Acesso
                  </h3>
                  <p className="text-[11px] text-stone-500">
                    Usuário: <strong className="text-stone-800">@{changingPasswordUser.username}</strong> ({changingPasswordUser.name})
                  </p>
                </div>
              </div>
              <button
                onClick={() => setChangingPasswordUser(null)}
                className="p-1.5 text-stone-400 hover:text-stone-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSavePassword} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
                  Nova Senha
                </label>
                <div className="relative">
                  <input
                    type={showTargetPassword ? 'text' : 'password'}
                    required
                    value={targetPassword}
                    onChange={(e) => setTargetPassword(e.target.value)}
                    placeholder="Digite a nova senha"
                    className="w-full px-4 py-2.5 pr-10 rounded-2xl border border-stone-200 text-xs sm:text-sm outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowTargetPassword(!showTargetPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
                  >
                    {showTargetPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
                  Confirmar Nova Senha
                </label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repita a nova senha"
                  className="w-full px-4 py-2.5 rounded-2xl border border-stone-200 text-xs sm:text-sm outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 font-mono"
                />
              </div>

              {passwordError && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{passwordError}</span>
                </div>
              )}

              <div className="pt-2 flex gap-2.5">
                <button
                  type="submit"
                  className="flex-1 py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-stone-950 font-black rounded-2xl shadow-md text-xs sm:text-sm transition-all"
                >
                  Salvar Nova Senha
                </button>
                <button
                  type="button"
                  onClick={() => setChangingPasswordUser(null)}
                  className="px-4 py-3 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold rounded-2xl text-xs transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: EDITAR DADOS BÁSICOS DO USUÁRIO
      ========================================================================== */}
      {editingUser && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 animate-fade-in">
          <div
            onClick={() => setEditingUser(null)}
            className="fixed inset-0 bg-stone-900/60 backdrop-blur-xs transition-opacity"
          />

          <div className="relative bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden border border-stone-100 z-10 p-6 sm:p-8 animate-slide-up space-y-6">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
                  <Edit2 className="w-5 h-5" />
                </div>
                <h3 className="font-extrabold text-stone-900 text-base font-display">
                  Editar Dados do Usuário
                </h3>
              </div>
              <button
                onClick={() => setEditingUser(null)}
                className="p-1.5 text-stone-400 hover:text-stone-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
                  Nome do Funcionário
                </label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-2xl border border-stone-200 text-xs sm:text-sm outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
                  Login de Acesso
                </label>
                <input
                  type="text"
                  required
                  value={editUsername}
                  onChange={(e) => setEditUsername(e.target.value.replace(/\s+/g, ''))}
                  className="w-full px-4 py-2.5 rounded-2xl border border-stone-200 text-xs sm:text-sm outline-none focus:border-amber-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
                  Cargo
                </label>
                <select
                  value={editRole}
                  onChange={(e) => setEditRole(e.target.value as AdminRole)}
                  className="w-full px-4 py-2.5 rounded-2xl border border-stone-200 text-xs sm:text-sm outline-none focus:border-amber-500 bg-white"
                >
                  <option value="Gerente">Gerente</option>
                  <option value="Cozinha / Pasteleiro">Cozinha / Pasteleiro</option>
                  <option value="Caixa / Atendimento">Caixa / Atendimento</option>
                </select>
              </div>

              <div className="pt-2 flex gap-2.5">
                <button
                  type="submit"
                  className="flex-1 py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-stone-950 font-black rounded-2xl shadow-md text-xs sm:text-sm transition-all"
                >
                  Salvar Alterações
                </button>
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="px-4 py-3 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold rounded-2xl text-xs transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

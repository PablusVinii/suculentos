'use client';

import React, { useState, useEffect } from 'react';
import { useStore } from '@/store/useStore';
import { PixConfig, PixKeyType } from '@/types';
import { formatTime } from '@/utils/format';
import {
  QrCode,
  Copy,
  Check,
  RotateCcw,
  Sparkles,
  ShieldCheck,
  Building2,
  Mail,
  Smartphone,
  FileText,
  Key,
  Info,
  CheckCircle2,
  Save,
  HelpCircle,
  ExternalLink,
  Zap,
} from 'lucide-react';

const KEY_TYPES: { id: PixKeyType; label: string; icon: React.ElementType; placeholder: string; example: string }[] = [
  { id: 'email', label: 'E-mail', icon: Mail, placeholder: 'exemplo@suculentos.com.br', example: 'pix@suculentospastelaria.com.br' },
  { id: 'telefone', label: 'Celular / WhatsApp', icon: Smartphone, placeholder: '(11) 99999-8888', example: '(11) 98765-4321' },
  { id: 'cpf', label: 'CPF', icon: FileText, placeholder: '000.000.000-00', example: '123.456.789-00' },
  { id: 'cnpj', label: 'CNPJ', icon: Building2, placeholder: '00.000.000/0001-00', example: '12.345.678/0001-90' },
  { id: 'aleatoria', label: 'Chave Aleatória (EVP)', icon: Key, placeholder: 'Chave aleatória gerada pelo banco (32 caracteres)', example: 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d' },
];

export const PixConfigManager: React.FC = () => {
  const { pixConfig, updatePixConfig, resetPixConfigToDefault, showToast } = useStore();

  const [keyType, setKeyType] = useState<PixKeyType>(pixConfig.keyType || 'email');
  const [key, setKey] = useState(pixConfig.key || '');
  const [receiverName, setReceiverName] = useState(pixConfig.receiverName || '');
  const [city, setCity] = useState(pixConfig.city || '');
  const [instructions, setInstructions] = useState(pixConfig.instructions || '');

  const [isSaved, setIsSaved] = useState(false);
  const [previewCopied, setPreviewCopied] = useState(false);
  const [showRestoreModal, setShowRestoreModal] = useState(false);

  // Sincroniza o estado local caso a configuração mude remotamente
  useEffect(() => {
    setKeyType(pixConfig.keyType || 'email');
    setKey(pixConfig.key || '');
    setReceiverName(pixConfig.receiverName || '');
    setCity(pixConfig.city || '');
    setInstructions(pixConfig.instructions || '');
  }, [pixConfig]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    if (!key.trim()) {
      showToast('⚠️ Digite a Chave PIX antes de salvar.');
      return;
    }

    if (!receiverName.trim()) {
      showToast('⚠️ Informe o nome do favorecido/beneficiário.');
      return;
    }

    const newConfig: PixConfig = {
      key: key.trim(),
      keyType,
      receiverName: receiverName.trim(),
      city: city.trim() || undefined,
      instructions: instructions.trim() || undefined,
      updatedAt: new Date().toISOString(),
    };

    updatePixConfig(newConfig);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  const handleTestCopy = () => {
    if (!key.trim()) {
      showToast('⚠️ Preencha a chave para testar a cópia.');
      return;
    }
    navigator.clipboard?.writeText(key.trim());
    setPreviewCopied(true);
    showToast('📋 Chave PIX copiada para a área de transferência!');
    setTimeout(() => setPreviewCopied(false), 2000);
  };

  const handleConfirmRestore = () => {
    resetPixConfigToDefault();
    setShowRestoreModal(false);
  };

  const activeTypeObj = KEY_TYPES.find((t) => t.id === keyType) || KEY_TYPES[0];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      {/* Cabeçalho da Seção */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 bg-white p-6 rounded-3xl border border-stone-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center font-bold">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-black text-stone-900 font-display">
                  Configuração de Pagamento PIX
                </h2>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  Sincronização Ativa
                </span>
              </div>
              <p className="text-xs sm:text-sm text-stone-500 mt-0.5">
                Defina a chave PIX onde o dinheiro dos clientes será recebido. Ao salvar, ela é sincronizada na hora no cardápio de todos os clientes.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setShowRestoreModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-stone-600 hover:text-stone-900 bg-stone-100 hover:bg-stone-200 text-xs font-bold transition-all"
            title="Restaurar chave e dados padrão do sistema"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Restaurar Padrões</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Formulário Principal de Edição (7 colunas) */}
        <div className="lg:col-span-7 space-y-6">
          <form onSubmit={handleSave} className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-sm space-y-6">
            <div>
              <label className="block text-xs font-extrabold uppercase tracking-wider text-stone-700 mb-3">
                1. Selecione o Tipo da Chave PIX
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {KEY_TYPES.map((item) => {
                  const Icon = item.icon;
                  const isSelected = keyType === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setKeyType(item.id)}
                      className={`flex flex-col items-center justify-center p-3 sm:p-3.5 rounded-2xl border text-xs font-bold transition-all ${
                        isSelected
                          ? 'border-amber-500 bg-amber-500/10 text-amber-900 ring-2 ring-amber-500/30 font-black scale-[1.02]'
                          : 'border-stone-200 hover:bg-stone-50 text-stone-600'
                      }`}
                    >
                      <Icon className={`w-5 h-5 mb-1.5 ${isSelected ? 'text-amber-600' : 'text-stone-400'}`} />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Campo da Chave */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-extrabold text-stone-800 flex items-center gap-1.5">
                  <span>2. Chave PIX ({activeTypeObj.label})</span>
                  <span className="text-red-500">*</span>
                </label>
                <span className="text-[11px] text-stone-400">
                  Exemplo: <code className="font-mono text-stone-600">{activeTypeObj.example}</code>
                </span>
              </div>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={key}
                  onChange={(e) => setKey(e.target.value)}
                  placeholder={activeTypeObj.placeholder}
                  className="w-full px-4 py-3.5 rounded-2xl border border-stone-200 bg-stone-50 text-stone-900 font-mono text-sm focus:bg-white focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 transition-all outline-none"
                />
              </div>
              <p className="text-[11px] text-stone-500 mt-1.5 flex items-center gap-1">
                <Info className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                Esta é a informação exata que será copiada pelo cliente ao clicar em "Copiar Chave PIX".
              </p>
            </div>

            {/* Nome do Titular / Favorecido */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-extrabold text-stone-800 flex items-center gap-1.5">
                  <span>3. Nome do Favorecido / Titular da Conta</span>
                  <span className="text-red-500">*</span>
                </label>
                <span className="text-[11px] text-stone-400">Exibido para segurança do cliente</span>
              </div>
              <input
                type="text"
                required
                value={receiverName}
                onChange={(e) => setReceiverName(e.target.value)}
                placeholder="Ex: Suculentos Pastelaria LTDA ou Seu Nome"
                className="w-full px-4 py-3 rounded-2xl border border-stone-200 bg-stone-50 text-stone-900 text-sm focus:bg-white focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 transition-all outline-none"
              />
            </div>

            {/* Cidade do Titular */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-extrabold text-stone-800 mb-1.5">
                  4. Cidade da Conta (Opcional)
                </label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="Ex: São Paulo"
                  className="w-full px-4 py-3 rounded-2xl border border-stone-200 bg-stone-50 text-stone-900 text-sm focus:bg-white focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 transition-all outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-extrabold text-stone-800 mb-1.5">
                  Última Atualização
                </label>
                <div className="px-4 py-3 rounded-2xl bg-stone-100 text-stone-600 text-xs font-mono flex items-center h-[46px]">
                  {pixConfig.updatedAt
                    ? new Date(pixConfig.updatedAt).toLocaleString('pt-BR')
                    : 'Padrão Inicial'}
                </div>
              </div>
            </div>

            {/* Instruções Adicionais para o Cliente */}
            <div>
              <label className="block text-xs font-extrabold text-stone-800 mb-1.5">
                5. Mensagem ou Instruções para o Cliente (Opcional)
              </label>
              <textarea
                rows={2}
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                placeholder="Ex: Envie o comprovante pelo WhatsApp ou apresente ao entregador."
                className="w-full px-4 py-3 rounded-2xl border border-stone-200 bg-stone-50 text-stone-900 text-xs focus:bg-white focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 transition-all outline-none resize-none"
              />
            </div>

            {/* Botão Salvar e Sincronizar */}
            <div className="pt-2">
              <button
                type="submit"
                id="save-pix-config-button"
                className={`w-full flex items-center justify-center gap-2 py-4 rounded-2xl font-black text-sm transition-all shadow-md active:scale-98 ${
                  isSaved
                    ? 'bg-emerald-600 text-white shadow-emerald-500/20'
                    : 'bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-600 hover:to-orange-600 text-white shadow-orange-500/25 hover:shadow-lg'
                }`}
              >
                {isSaved ? (
                  <>
                    <CheckCircle2 className="w-5 h-5 animate-bounce" />
                    <span>Salvo e Sincronizado com Sucesso!</span>
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    <span>Salvar e Sincronizar Chave PIX Agora</span>
                  </>
                )}
              </button>
              <p className="text-center text-[11px] text-stone-400 mt-2.5">
                ⚡ A sincronização em tempo real atualiza o checkout e a tela de confirmação de todos os clientes conectados.
              </p>
            </div>
          </form>
        </div>

        {/* Simulador / Preview em Tempo Real (5 colunas) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-stone-900 text-white rounded-3xl p-6 sm:p-7 border border-stone-800 shadow-xl relative overflow-hidden">
            <div className="absolute -right-8 -top-8 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none"></div>

            <div className="flex items-center justify-between pb-4 mb-4 border-b border-stone-800">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
                <h3 className="text-xs font-black uppercase tracking-wider text-amber-400 font-display">
                  Prévia em Tempo Real (Visão do Cliente)
                </h3>
              </div>
              <span className="text-[10px] bg-stone-800 text-stone-400 px-2 py-0.5 rounded-full font-bold">
                Como o cliente vê
              </span>
            </div>

            {/* Simulação do Card no Checkout */}
            <div className="bg-stone-950/80 rounded-2xl p-4 sm:p-5 border border-stone-800/80 space-y-3.5 mb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
                    <QrCode className="w-4 h-4" />
                  </div>
                  <span className="font-extrabold text-xs text-stone-100">
                    Chave PIX ({activeTypeObj.label}):
                  </span>
                </div>

                <button
                  type="button"
                  onClick={handleTestCopy}
                  className="flex items-center gap-1 text-[11px] font-bold text-amber-300 hover:text-amber-200 bg-amber-500/20 hover:bg-amber-500/30 px-2.5 py-1.5 rounded-xl border border-amber-500/30 transition-all cursor-pointer"
                >
                  {previewCopied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-300">Copiado!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copiar Chave</span>
                    </>
                  )}
                </button>
              </div>

              {/* Caixa com a Chave */}
              <div className="p-3 rounded-xl bg-stone-900 border border-stone-800 flex items-center justify-between">
                <code className="text-xs text-amber-300 font-mono select-all break-all">
                  {key.trim() || activeTypeObj.example}
                </code>
              </div>

              {/* Detalhes do Favorecido */}
              <div className="text-[11px] text-stone-400 space-y-1 pt-1 border-t border-stone-800/60">
                <div className="flex justify-between">
                  <span className="text-stone-500">Favorecido / Titular:</span>
                  <span className="font-bold text-stone-200">{receiverName.trim() || 'Suculentos Pastelaria'}</span>
                </div>
                {city.trim() && (
                  <div className="flex justify-between">
                    <span className="text-stone-500">Cidade:</span>
                    <span className="text-stone-300">{city.trim()}</span>
                  </div>
                )}
              </div>

              {/* Mensagem de Instrução */}
              {instructions.trim() && (
                <p className="text-[10px] text-stone-400 italic bg-stone-900/60 p-2.5 rounded-xl border border-stone-800">
                  💬 "{instructions.trim()}"
                </p>
              )}
            </div>

            {/* Simulação QR Code Decorativo */}
            <div className="p-4 rounded-2xl bg-stone-800/50 border border-stone-700/50 flex items-center gap-3.5">
              <div className="w-14 h-14 bg-white p-1 rounded-xl flex items-center justify-center shrink-0">
                <QrCode className="w-12 h-12 text-stone-950" />
              </div>
              <div className="text-left">
                <h4 className="text-xs font-bold text-white flex items-center gap-1">
                  <Zap className="w-3.5 h-3.5 text-amber-400" />
                  PIX Instantâneo & Automático
                </h4>
                <p className="text-[11px] text-stone-400 mt-0.5">
                  Os clientes podem copiar a chave com 1 toque no celular ou computador e colar direto no app do banco.
                </p>
              </div>
            </div>
          </div>

          {/* Dicas e Orientações */}
          <div className="bg-amber-500/10 rounded-3xl p-5 border border-amber-500/20 text-stone-700 text-xs space-y-2.5">
            <div className="flex items-center gap-2 text-amber-900 font-extrabold">
              <ShieldCheck className="w-4 h-4 text-amber-600" />
              <span>Dicas para maior conversão de vendas:</span>
            </div>
            <ul className="space-y-1.5 text-[11px] text-amber-950/90 list-disc list-inside">
              <li>Use uma chave de fácil conferência (ex: <strong>E-mail</strong> institucional ou <strong>CNPJ</strong> da empresa).</li>
              <li>Mantenha o nome do titular atualizado para evitar dúvidas no momento da transferência.</li>
              <li>A chave configurada aqui atualiza automaticamente em todos os pedidos futuros e em andamento.</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Modal de Confirmação para Restaurar Padrões */}
      {showRestoreModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 sm:p-6 animate-fade-in">
          <div
            onClick={() => setShowRestoreModal(false)}
            className="fixed inset-0 bg-stone-900/60 backdrop-blur-xs transition-opacity"
          />
          <div className="relative bg-white rounded-3xl shadow-2xl max-w-sm w-full overflow-hidden border border-stone-100 z-10 text-center p-6 animate-slide-up">
            <div className="w-14 h-14 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center mx-auto mb-3">
              <RotateCcw className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-black text-stone-900 font-display">
              Restaurar Padrão Inicial?
            </h3>
            <p className="text-xs text-stone-500 mt-1 mb-5">
              Isso redefinirá a chave para o e-mail padrão oficial do sistema (<code className="font-mono text-stone-700">pix@suculentospastelaria.com.br</code>).
            </p>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setShowRestoreModal(false)}
                className="py-2.5 rounded-xl border border-stone-200 text-stone-700 font-bold text-xs hover:bg-stone-100 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmRestore}
                className="py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-black text-xs transition-all shadow-md"
              >
                Sim, Restaurar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

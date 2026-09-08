'use client';

import React, { useState, useEffect } from 'react';
import { useStore } from '@/store/useStore';
import { StoreScheduleConfig, StoreScheduleMode, DaySchedule } from '@/types';
import { getStoreOpenStatus, formatTimeDisplay } from '@/utils/schedule';
import {
  Clock,
  Calendar,
  Save,
  RotateCcw,
  Sparkles,
  Zap,
  CheckCircle2,
  AlertTriangle,
  Power,
  Store,
  Info,
  Sliders,
  Check,
} from 'lucide-react';

export const ScheduleManager: React.FC = () => {
  const {
    storeSchedule,
    updateStoreSchedule,
    setStoreScheduleMode,
    resetStoreScheduleToDefault,
  } = useStore();

  const [formSchedule, setFormSchedule] = useState<DaySchedule[]>(storeSchedule.schedule);
  const [closedMessage, setClosedMessage] = useState<string>(storeSchedule.closedMessage);
  const [autoReject, setAutoReject] = useState<boolean>(storeSchedule.autoRejectOrdersWhenClosed);
  const [hasChanges, setHasChanges] = useState<boolean>(false);

  useEffect(() => {
    setFormSchedule(storeSchedule.schedule);
    setClosedMessage(storeSchedule.closedMessage);
    setAutoReject(storeSchedule.autoRejectOrdersWhenClosed);
    setHasChanges(false);
  }, [storeSchedule]);

  const currentStatus = getStoreOpenStatus(storeSchedule);

  const handleToggleDay = (dayOfWeek: number) => {
    const updated = formSchedule.map((day) =>
      day.dayOfWeek === dayOfWeek ? { ...day, isOpen: !day.isOpen } : day
    );
    setFormSchedule(updated);
    setHasChanges(true);
  };

  const handleTimeChange = (dayOfWeek: number, field: 'openTime' | 'closeTime', value: string) => {
    const updated = formSchedule.map((day) =>
      day.dayOfWeek === dayOfWeek ? { ...day, [field]: value } : day
    );
    setFormSchedule(updated);
    setHasChanges(true);
  };

  const handleApplyPreset = (presetType: 'standard' | 'all_days' | 'extended_weekend') => {
    let updated: DaySchedule[] = [];

    if (presetType === 'standard') {
      // Terça a Domingo 18:00 às 23:30 (Segunda fechada)
      updated = formSchedule.map((day) => ({
        ...day,
        isOpen: day.dayOfWeek !== 1,
        openTime: '18:00',
        closeTime: day.dayOfWeek === 5 || day.dayOfWeek === 6 ? '23:59' : '23:30',
      }));
    } else if (presetType === 'all_days') {
      // Todos os dias 18:00 às 23:30
      updated = formSchedule.map((day) => ({
        ...day,
        isOpen: true,
        openTime: '18:00',
        closeTime: '23:30',
      }));
    } else if (presetType === 'extended_weekend') {
      // Sexta a Domingo até 01:00 da madrugada
      updated = formSchedule.map((day) => ({
        ...day,
        isOpen: day.dayOfWeek !== 1,
        openTime: '18:00',
        closeTime: day.dayOfWeek === 5 || day.dayOfWeek === 6 ? '01:00' : '23:30',
      }));
    }

    setFormSchedule(updated);
    setHasChanges(true);
  };

  const handleSaveAll = (e: React.FormEvent) => {
    e.preventDefault();
    const newConfig: StoreScheduleConfig = {
      mode: storeSchedule.mode,
      schedule: formSchedule,
      closedMessage: closedMessage.trim(),
      autoRejectOrdersWhenClosed: autoReject,
      updatedAt: new Date().toISOString(),
    };

    updateStoreSchedule(newConfig);
    setHasChanges(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
      {/* Top Banner de Status em Tempo Real */}
      <div className="p-6 sm:p-7 rounded-3xl bg-gradient-to-r from-stone-950 via-stone-900 to-stone-950 text-white border border-stone-800 shadow-xl space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div
              className={`w-16 h-16 rounded-3xl flex items-center justify-center text-3xl shadow-lg rotate-[-2deg] ${
                currentStatus.isOpen
                  ? 'bg-gradient-to-tr from-emerald-500 to-teal-400 text-stone-950 shadow-emerald-500/20'
                  : 'bg-gradient-to-tr from-rose-500 to-red-600 text-white shadow-rose-500/20'
              }`}
            >
              {currentStatus.isOpen ? '🟢' : '🔴'}
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h2 className="text-xl sm:text-2xl font-black font-display tracking-tight text-white">
                  Status Atual da Loja:
                </h2>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-black tracking-wider uppercase inline-flex items-center gap-1.5 ${
                    currentStatus.isOpen
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                      : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                  }`}
                >
                  <span
                    className={`w-2 h-2 rounded-full ${
                      currentStatus.isOpen ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'
                    }`}
                  ></span>
                  {currentStatus.isOpen ? 'Online • Aberto p/ Pedidos' : 'Offline • Fechado'}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-stone-300 mt-1">
                {currentStatus.subText}
              </p>
            </div>
          </div>

          {/* Seletor de Modo Rápido (1-Clique) */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 bg-stone-900/90 p-2 rounded-2xl border border-stone-800">
            <button
              type="button"
              id="schedule-mode-auto"
              onClick={() => setStoreScheduleMode('auto')}
              className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                storeSchedule.mode === 'auto'
                  ? 'bg-amber-500 text-stone-950 shadow-md scale-[1.02]'
                  : 'text-stone-300 hover:text-white hover:bg-stone-800'
              }`}
            >
              <Zap className="w-3.5 h-3.5" />
              <span>⚡ Automático</span>
            </button>

            <button
              type="button"
              id="schedule-mode-open"
              onClick={() => setStoreScheduleMode('always_open')}
              className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                storeSchedule.mode === 'always_open'
                  ? 'bg-emerald-500 text-stone-950 shadow-md scale-[1.02]'
                  : 'text-stone-300 hover:text-white hover:bg-stone-800'
              }`}
            >
              <Power className="w-3.5 h-3.5" />
              <span>🟢 Forçar Aberto</span>
            </button>

            <button
              type="button"
              id="schedule-mode-closed"
              onClick={() => setStoreScheduleMode('always_closed')}
              className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                storeSchedule.mode === 'always_closed'
                  ? 'bg-rose-500 text-white shadow-md scale-[1.02]'
                  : 'text-stone-300 hover:text-white hover:bg-stone-800'
              }`}
            >
              <Power className="w-3.5 h-3.5" />
              <span>🔴 Forçar Fechado</span>
            </button>
          </div>
        </div>

        {/* Explicação do Modo Ativo */}
        <div className="pt-4 border-t border-stone-800/80 text-xs text-stone-400 flex items-center gap-2">
          <Info className="w-4 h-4 text-amber-400 shrink-0" />
          <span>
            {storeSchedule.mode === 'auto' &&
              'Modo Automático ativo: O sistema abre e fecha a loja automaticamente com base no relógio do aparelho e na grade da semana abaixo.'}
            {storeSchedule.mode === 'always_open' &&
              'Modo Forçar Aberto ativo: A loja permanecerá ONLINE mesmo fora dos horários programados. Ideal para dias especiais, feriados ou eventos.'}
            {storeSchedule.mode === 'always_closed' &&
              'Modo Forçar Fechado ativo: A loja permanecerá OFFLINE para todos os clientes até que você mude para Automático ou Aberto.'}
          </span>
        </div>
      </div>

      {/* Formulário da Grade Semanal e Configurações */}
      <form onSubmit={handleSaveAll} className="space-y-6">
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/90 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-200 pb-5">
            <div>
              <h3 className="text-lg font-black text-stone-900 font-display flex items-center gap-2">
                <Calendar className="w-5 h-5 text-amber-600" />
                <span>Grade Semanal de Funcionamento</span>
              </h3>
              <p className="text-xs text-stone-500 mt-0.5">
                Defina os dias de atendimento e os horários de abertura e fechamento da pastelaria.
              </p>
            </div>

            {/* Atalhos Rápidos de Grade */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider">
                Atalhos:
              </span>
              <button
                type="button"
                onClick={() => handleApplyPreset('standard')}
                className="px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 text-xs font-bold transition-all"
              >
                Ter a Dom (18h-23h30)
              </button>
              <button
                type="button"
                onClick={() => handleApplyPreset('all_days')}
                className="px-3 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold transition-all"
              >
                Todos os Dias
              </button>
              <button
                type="button"
                onClick={() => handleApplyPreset('extended_weekend')}
                className="px-3 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold transition-all"
              >
                Fim de Semana até 01h
              </button>
            </div>
          </div>

          {/* Tabela Interativa de Dias da Semana */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-3">
            {formSchedule.map((day) => {
              const isToday = new Date().getDay() === day.dayOfWeek;

              return (
                <div
                  key={day.dayOfWeek}
                  className={`p-4 rounded-2xl border transition-all flex flex-col justify-between space-y-4 ${
                    day.isOpen
                      ? isToday
                        ? 'bg-amber-50/80 border-amber-300 ring-2 ring-amber-500/20'
                        : 'bg-stone-50/80 border-stone-200 hover:border-amber-300'
                      : 'bg-stone-100/50 border-stone-200 opacity-60'
                  }`}
                >
                  <div className="space-y-2">
                    {/* Header do Dia */}
                    <div className="flex items-center justify-between">
                      <span className="font-black text-sm text-stone-900 font-display">
                        {day.dayName}
                      </span>
                      {isToday && (
                        <span className="px-1.5 py-0.2 rounded-md bg-amber-500 text-white text-[9px] font-black uppercase">
                          Hoje
                        </span>
                      )}
                    </div>

                    {/* Switch Aberto / Fechado */}
                    <button
                      type="button"
                      onClick={() => handleToggleDay(day.dayOfWeek)}
                      className={`w-full py-1.5 px-2.5 rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                        day.isOpen
                          ? 'bg-emerald-500 text-white shadow-xs'
                          : 'bg-stone-200 text-stone-600 hover:bg-stone-300'
                      }`}
                    >
                      <span
                        className={`w-2 h-2 rounded-full ${
                          day.isOpen ? 'bg-white' : 'bg-stone-400'
                        }`}
                      ></span>
                      <span>{day.isOpen ? 'Aberto' : 'Folga (Fechado)'}</span>
                    </button>
                  </div>

                  {/* Inputs de Horário */}
                  {day.isOpen ? (
                    <div className="space-y-2 pt-2 border-t border-stone-200/80">
                      <div>
                        <label className="block text-[10px] font-extrabold uppercase text-stone-500 mb-1">
                          Abertura:
                        </label>
                        <input
                          type="time"
                          value={day.openTime}
                          onChange={(e) =>
                            handleTimeChange(day.dayOfWeek, 'openTime', e.target.value)
                          }
                          className="w-full px-2.5 py-1.5 rounded-xl border border-stone-300 bg-white text-xs font-bold text-stone-900 outline-none focus:border-amber-500"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-extrabold uppercase text-stone-500 mb-1">
                          Fechamento:
                        </label>
                        <input
                          type="time"
                          value={day.closeTime}
                          onChange={(e) =>
                            handleTimeChange(day.dayOfWeek, 'closeTime', e.target.value)
                          }
                          className="w-full px-2.5 py-1.5 rounded-xl border border-stone-300 bg-white text-xs font-bold text-stone-900 outline-none focus:border-amber-500"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="py-6 text-center text-xs text-stone-400 font-semibold italic">
                      Não abre
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Mensagem de Loja Fechada & Bloqueio */}
          <div className="pt-6 border-t border-stone-200 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-2 flex items-center gap-1.5">
                <Store className="w-4 h-4 text-amber-600" />
                <span>Mensagem Personalizada quando Fechado:</span>
              </label>
              <textarea
                rows={3}
                value={closedMessage}
                onChange={(e) => {
                  setClosedMessage(e.target.value);
                  setHasChanges(true);
                }}
                placeholder="Ex: No momento estamos fechados. Nosso horário de atendimento é de Terça a Domingo das 18:00 às 23:30..."
                className="w-full p-3.5 rounded-2xl border border-stone-300 text-xs text-stone-800 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 leading-relaxed"
              />
              <span className="text-[11px] text-stone-400 mt-1 block">
                Esta mensagem aparecerá no cardápio do cliente quando a loja estiver offline.
              </span>
            </div>

            <div className="space-y-4 flex flex-col justify-between">
              <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-stone-800">
                    Bloquear Envio de Pedidos quando Fechado:
                  </span>
                  <input
                    type="checkbox"
                    checked={autoReject}
                    onChange={(e) => {
                      setAutoReject(e.target.checked);
                      setHasChanges(true);
                    }}
                    className="w-4 h-4 text-amber-600 rounded border-stone-300 focus:ring-amber-500 cursor-pointer"
                  />
                </div>
                <p className="text-[11px] text-stone-500 leading-relaxed">
                  Quando ativado, os clientes poderão ver os produtos no cardápio, mas o botão de finalizar pedido ficará bloqueado com um aviso até a reabertura da loja.
                </p>
              </div>

              {/* Botões de Ação */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={resetStoreScheduleToDefault}
                  className="flex items-center gap-1.5 px-4 py-3 rounded-2xl border border-stone-300 text-stone-600 hover:bg-stone-100 text-xs font-bold transition-all"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Restaurar Padrão</span>
                </button>

                <button
                  type="submit"
                  disabled={!hasChanges}
                  className={`flex items-center gap-2 px-6 py-3 rounded-2xl text-xs font-black shadow-md transition-all active:scale-98 ${
                    hasChanges
                      ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-orange-500/25 hover:from-amber-600 hover:to-orange-600 cursor-pointer'
                      : 'bg-stone-200 text-stone-400 cursor-not-allowed'
                  }`}
                >
                  <Save className="w-4 h-4" />
                  <span>Salvar Alterações de Horário</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

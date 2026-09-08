'use client';

import React from 'react';
import { useStore } from '@/store/useStore';
import { getStoreOpenStatus, formatTimeDisplay } from '@/utils/schedule';
import { X, Clock, Calendar, CheckCircle2, AlertCircle, Store, Sparkles } from 'lucide-react';

interface StoreHoursModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const StoreHoursModal: React.FC<StoreHoursModalProps> = ({ isOpen, onClose }) => {
  const { storeSchedule } = useStore();

  if (!isOpen) return null;

  const status = getStoreOpenStatus(storeSchedule);
  const currentDayOfWeek = new Date().getDay();

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 sm:p-6 animate-fade-in">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-stone-900/60 backdrop-blur-xs transition-opacity"
      />

      <div className="relative bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden border border-stone-100 z-10 animate-slide-up">
        {/* Header */}
        <div className="bg-gradient-to-r from-stone-950 via-stone-900 to-stone-950 p-6 text-white flex items-center justify-between border-b border-stone-800">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 text-stone-950 flex items-center justify-center font-bold text-2xl shadow-lg shadow-orange-500/20">
              🥟
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-black font-display text-amber-400">
                  Horário de Atendimento
                </h3>
              </div>
              <p className="text-xs text-stone-400">
                Pastéis frescos e fritos na hora
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Card de Status Atual */}
          <div
            className={`p-4 rounded-2xl border flex items-center justify-between ${
              status.isOpen
                ? 'bg-emerald-50/80 border-emerald-200 text-emerald-950'
                : 'bg-rose-50/80 border-rose-200 text-rose-950'
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-3.5 h-3.5 rounded-full relative flex items-center justify-center ${
                  status.isOpen ? 'bg-emerald-500' : 'bg-rose-500'
                }`}
              >
                {status.isOpen && (
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                )}
              </div>
              <div>
                <div className="font-black text-sm">
                  {status.isOpen ? '🟢 Aberto Agora' : '🔴 Fechado no Momento'}
                </div>
                <div className="text-xs opacity-90 font-medium">
                  {status.subText}
                </div>
              </div>
            </div>

            {status.isOpen && (
              <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-emerald-600 text-white uppercase tracking-wider">
                Online
              </span>
            )}
          </div>

          {/* Grade da Semana */}
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-stone-500 mb-3 px-1">
              <Calendar className="w-4 h-4 text-amber-600" />
              <span>Programação Semanal:</span>
            </div>

            <div className="space-y-1.5 rounded-2xl bg-stone-50 p-2.5 border border-stone-200/80">
              {storeSchedule.schedule.map((day) => {
                const isToday = day.dayOfWeek === currentDayOfWeek;
                return (
                  <div
                    key={day.dayOfWeek}
                    className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                      isToday
                        ? 'bg-amber-500 text-white font-black shadow-sm ring-1 ring-amber-400'
                        : 'text-stone-700 hover:bg-stone-100'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span>{day.dayName}</span>
                      {isToday && (
                        <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-white text-amber-700 font-extrabold uppercase">
                          Hoje
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5">
                      {day.isOpen ? (
                        <span className={isToday ? 'text-white' : 'text-stone-900 font-bold'}>
                          {formatTimeDisplay(day.openTime)} às {formatTimeDisplay(day.closeTime)}
                        </span>
                      ) : (
                        <span
                          className={`text-[11px] font-bold ${
                            isToday ? 'text-amber-100' : 'text-stone-400'
                          }`}
                        >
                          Fechado (Folga)
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Mensagem / Aviso */}
          {storeSchedule.closedMessage && (
            <div className="p-3.5 rounded-2xl bg-stone-100 border border-stone-200 text-xs text-stone-600 space-y-1">
              <div className="font-bold text-stone-800 flex items-center gap-1.5">
                <Store className="w-3.5 h-3.5 text-amber-600" />
                <span>Atendimento & Encomendas:</span>
              </div>
              <p className="text-[11px] leading-relaxed">
                {storeSchedule.closedMessage}
              </p>
            </div>
          )}

          {/* Botão Fechar */}
          <button
            onClick={onClose}
            className="w-full py-3 bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs rounded-2xl transition-all active:scale-98"
          >
            Entendido, Voltar ao Cardápio
          </button>
        </div>
      </div>
    </div>
  );
};

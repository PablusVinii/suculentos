import { StoreScheduleConfig, StoreStatusResult, DaySchedule } from '@/types';

function parseTimeToMinutes(timeStr: string): number {
  if (!timeStr || !timeStr.includes(':')) return 0;
  const [hours, minutes] = timeStr.split(':').map((v) => parseInt(v, 10) || 0);
  return hours * 60 + minutes;
}

export function formatTimeDisplay(timeStr: string): string {
  if (!timeStr) return '';
  const [h, m] = timeStr.split(':');
  const padH = (h || '00').padStart(2, '0');
  const padM = (m || '00').padStart(2, '0');
  return `${padH}:${padM}`;
}

export function getStoreOpenStatus(
  config?: StoreScheduleConfig | null,
  customDate?: Date
): StoreStatusResult {
  // Se não houver configuração ou estiver corrompida, assume padrão aberto
  if (!config || !Array.isArray(config.schedule) || config.schedule.length === 0) {
    return {
      isOpen: true,
      statusText: 'Aberto Agora',
      subText: 'Fritando na hora',
      badgeColor: 'emerald',
      isOverride: false,
      mode: 'auto',
    };
  }

  // 1. Tratamento de Modo Manual Forçado
  if (config.mode === 'always_open') {
    return {
      isOpen: true,
      statusText: 'Aberto Agora',
      subText: 'Fritando na hora • Aberto pelo Gerente',
      badgeColor: 'emerald',
      isOverride: true,
      mode: 'always_open',
    };
  }

  if (config.mode === 'always_closed') {
    return {
      isOpen: false,
      statusText: 'Fechado no Momento',
      subText: config.closedMessage || 'Pausa temporária no atendimento',
      badgeColor: 'rose',
      isOverride: true,
      mode: 'always_closed',
    };
  }

  // 2. Modo Automático (Baseado no Relógio Local)
  const now = customDate || new Date();
  const currentDayOfWeek = now.getDay(); // 0 = Dom, 1 = Seg, ..., 6 = Sab
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  const scheduleMap = new Map<number, DaySchedule>();
  config.schedule.forEach((s) => scheduleMap.set(s.dayOfWeek, s));

  const todaySchedule = scheduleMap.get(currentDayOfWeek);
  const yesterdayDayOfWeek = (currentDayOfWeek + 6) % 7;
  const yesterdaySchedule = scheduleMap.get(yesterdayDayOfWeek);

  let isOpen = false;
  let activeCloseTime = '';

  // Verifica se estamos no turno da madrugada que começou ontem à noite (ex: ontem abriu 18:00 e fecha 01:00 de hoje)
  if (yesterdaySchedule && yesterdaySchedule.isOpen) {
    const yOpenM = parseTimeToMinutes(yesterdaySchedule.openTime);
    const yCloseM = parseTimeToMinutes(yesterdaySchedule.closeTime);

    if (yCloseM < yOpenM && currentMinutes < yCloseM) {
      isOpen = true;
      activeCloseTime = yesterdaySchedule.closeTime;
    }
  }

  // Verifica se estamos no turno de hoje
  if (!isOpen && todaySchedule && todaySchedule.isOpen) {
    const tOpenM = parseTimeToMinutes(todaySchedule.openTime);
    const tCloseM = parseTimeToMinutes(todaySchedule.closeTime);

    // Caso regular (ex: 18:00 às 23:30)
    if (tCloseM >= tOpenM) {
      if (currentMinutes >= tOpenM && currentMinutes <= tCloseM) {
        isOpen = true;
        activeCloseTime = todaySchedule.closeTime;
      }
    } else {
      // Caso que vira a noite (ex: 18:00 às 02:00)
      if (currentMinutes >= tOpenM) {
        isOpen = true;
        activeCloseTime = todaySchedule.closeTime;
      }
    }
  }

  // Calcula o próximo horário de abertura caso esteja fechado
  let nextOpenText = '';
  if (!isOpen) {
    // 1. Checa se ainda abre hoje mais tarde
    if (todaySchedule && todaySchedule.isOpen) {
      const tOpenM = parseTimeToMinutes(todaySchedule.openTime);
      if (currentMinutes < tOpenM) {
        nextOpenText = `Abre hoje às ${formatTimeDisplay(todaySchedule.openTime)}`;
      }
    }

    // 2. Se não abre mais hoje, procura nos próximos 7 dias
    if (!nextOpenText) {
      for (let i = 1; i <= 7; i++) {
        const checkDay = (currentDayOfWeek + i) % 7;
        const s = scheduleMap.get(checkDay);
        if (s && s.isOpen) {
          if (i === 1) {
            nextOpenText = `Abre amanhã às ${formatTimeDisplay(s.openTime)}`;
          } else {
            nextOpenText = `Abre ${s.dayName.split('-')[0]} às ${formatTimeDisplay(s.openTime)}`;
          }
          break;
        }
      }
    }
  }

  if (isOpen) {
    return {
      isOpen: true,
      statusText: 'Aberto Agora',
      subText: activeCloseTime
        ? `Fritando na hora • Fecha às ${formatTimeDisplay(activeCloseTime)}`
        : 'Fritando na hora • Pedidos liberados',
      badgeColor: 'emerald',
      nextOpenText: undefined,
      isOverride: false,
      mode: 'auto',
    };
  }

  return {
    isOpen: false,
    statusText: 'Fechado no Momento',
    subText: nextOpenText || config.closedMessage || 'Fora do horário de atendimento',
    badgeColor: 'rose',
    nextOpenText: nextOpenText || undefined,
    isOverride: false,
    mode: 'auto',
  };
}

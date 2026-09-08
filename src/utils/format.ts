export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

export function formatTime(isoDateString: string): string {
  try {
    const date = new Date(isoDateString);
    return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  } catch {
    return '--:--';
  }
}

export function formatDateTime(isoDateString: string): string {
  try {
    const date = new Date(isoDateString);
    return date.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return '--/--/---- --:--';
  }
}

export function formatDate(isoDateString: string): string {
  try {
    const date = new Date(isoDateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  } catch {
    return '--/--/----';
  }
}

export function getDayKey(isoDateString: string): string {
  try {
    const date = new Date(isoDateString);
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  } catch {
    return 'outros';
  }
}

export function getDayLabel(isoDateString: string): string {
  try {
    const date = new Date(isoDateString);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    const isToday =
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear();

    const isYesterday =
      date.getDate() === yesterday.getDate() &&
      date.getMonth() === yesterday.getMonth() &&
      date.getFullYear() === yesterday.getFullYear();

    const formattedDate = date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });

    const weekDay = date.toLocaleDateString('pt-BR', { weekday: 'long' });
    const capitalizedWeekDay = weekDay.charAt(0).toUpperCase() + weekDay.slice(1);

    if (isToday) {
      return `Hoje • ${formattedDate} (${capitalizedWeekDay})`;
    }
    if (isYesterday) {
      return `Ontem • ${formattedDate} (${capitalizedWeekDay})`;
    }

    return `${formattedDate} • ${capitalizedWeekDay}`;
  } catch {
    return 'Data não especificada';
  }
}

export function getElapsedMinutes(isoDateString: string): number {
  try {
    const diffMs = Date.now() - new Date(isoDateString).getTime();
    return Math.max(0, Math.floor(diffMs / (1000 * 60)));
  } catch {
    return 0;
  }
}

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

export function getElapsedMinutes(isoDateString: string): number {
  try {
    const diffMs = Date.now() - new Date(isoDateString).getTime();
    return Math.max(0, Math.floor(diffMs / (1000 * 60)));
  } catch {
    return 0;
  }
}

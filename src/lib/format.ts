export function shorten(value: string, left = 6, right = 4): string {
  if (value.length <= left + right + 3) return value;
  return `${value.slice(0, left)}…${value.slice(-right)}`;
}

export function formatRaw(raw: string, decimals: number, fractionDigits = 6): string {
  const negative = raw.startsWith('-');
  const digits = negative ? raw.slice(1) : raw || '0';
  const safeDecimals = Math.max(0, decimals);
  const padded = digits.padStart(safeDecimals + 1, '0');
  const whole = padded.slice(0, padded.length - safeDecimals) || '0';
  const fraction = padded.slice(padded.length - safeDecimals).replace(/0+$/, '');
  const value = fraction
    ? `${whole}.${fraction.slice(0, fractionDigits)}`
    : whole;
  return negative ? `-${value}` : value;
}

export function formatDelta(raw: string, decimals: number): {
  text: string;
  positive: boolean;
  zero: boolean;
} {
  const zero = raw === '0' || raw === '-0';
  const negative = raw.startsWith('-') && !zero;
  const formatted = formatRaw(negative ? raw.slice(1) : raw, decimals);
  return {
    text: zero ? '0' : `${negative ? '−' : '+'}${formatted}`,
    positive: !negative && !zero,
    zero,
  };
}

export function relativeAge(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins} mins ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 48) return `${hours} hours ago`;
  return `${Math.floor(hours / 24)} days ago`;
}

export function formatTimestamp(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toISOString().replace('T', ' ').slice(0, 19) + ' UTC';
}

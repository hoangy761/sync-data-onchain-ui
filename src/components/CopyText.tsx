import { useEffect, useState, type MouseEvent } from 'react';
import { shorten } from '../lib/format';

export function CopyText({
  value,
  left,
  right,
  className = '',
}: {
  value: string;
  left?: number;
  right?: number;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const timer = window.setTimeout(() => setCopied(false), 1200);
    return () => window.clearTimeout(timer);
  }, [copied]);

  function onClick(event: MouseEvent<HTMLButtonElement>) {
    event.stopPropagation();
    if (!copyToClipboard(value)) return;
    setCopied(true);
  }

  const label = left != null && right != null ? shorten(value, left, right) : value;

  return (
    <button
      type="button"
      className={`cursor-pointer font-mono text-link ${className}`}
      title="Click to copy"
      onClick={onClick}
    >
      {copied ? 'Copied' : label}
    </button>
  );
}

function copyToClipboard(value: string): boolean {
  const area = document.createElement('textarea');
  area.value = value;
  area.setAttribute('readonly', '');
  area.style.position = 'fixed';
  area.style.top = '0';
  area.style.left = '0';
  area.style.opacity = '0';
  document.body.appendChild(area);
  area.focus();
  area.select();
  area.setSelectionRange(0, value.length);
  let ok = false;
  try {
    ok = document.execCommand('copy');
  } catch {
    ok = false;
  }
  document.body.removeChild(area);
  if (!ok && navigator.clipboard?.writeText) {
    void navigator.clipboard.writeText(value);
    return true;
  }
  return ok;
}

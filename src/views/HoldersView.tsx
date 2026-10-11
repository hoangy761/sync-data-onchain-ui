import { useEffect, useState } from 'react';
import { ChainSelect, TokenSelect } from '../components/ChainTokenSelects';
import { Alert } from '../components/ui';
import { api, type TopHoldersDto } from '../lib/api';
import { formatRaw, shorten } from '../lib/format';
import type { ChainTokenSelection } from '../lib/useChainTokenSelection';

export function HoldersView({ selection }: { selection: ChainTokenSelection }) {
  const { selected, chain } = selection;
  const [data, setData] = useState<TopHoldersDto | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const chainLabel = chain ? `${chain.name} · ${chain.chainId}` : null;
  const symbol = data?.symbol ?? selected?.symbol ?? 'TOKEN';

  useEffect(() => {
    if (!selected) {
      setData(null);
      return;
    }
    let cancelled = false;
    const load = () => {
      api
        .getTopHolders(selected.chainId, selected.tokenAddress)
        .then((row) => {
          if (!cancelled) {
            setData(row);
            setError(null);
          }
        })
        .catch((err: Error) => {
          if (!cancelled) setError(err.message);
        });
    };
    load();
    const timer = window.setInterval(load, 15000);
    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, [selected]);

  async function copyAddress(address: string) {
    const copiedOk = await writeClipboard(address);
    if (!copiedOk) return;
    setCopied(address);
    window.setTimeout(() => setCopied((current) => (current === address ? null : current)), 1200);
  }

  return (
    <div className="mx-auto max-w-[1100px] px-6 pb-16 pt-8">
      <div className="mb-4 grid gap-2.5 sm:grid-cols-2 lg:max-w-[520px]">
        <ChainSelect selection={selection} />
        <TokenSelect selection={selection} />
      </div>
      <div className="mb-3.5 text-[13px] text-muted">
        Top holders
        {chainLabel ? ` / ${chainLabel}` : ''}
        {selected ? ` / ${selected.symbol ?? 'TOKEN'}` : ''}
      </div>
      {error && <Alert>{error}</Alert>}
      {!selected && <p className="text-sm text-muted">No token is tracked on this chain.</p>}
      {selected && (
        <section className="overflow-hidden rounded-lg border border-line bg-paper">
          <div className="flex items-center justify-between border-b border-line px-[18px] py-3.5">
            <span className="text-[15px] font-semibold">Top 100 by balance</span>
            <span className="text-xs text-muted">
              {data ? `${data.holders.length} holders` : 'Loading…'}
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[13px]">
              <thead className="bg-slate-50 text-xs font-medium text-muted">
                <tr>
                  <th className="px-4 py-3">#</th>
                  <th className="px-4 py-3">Holder</th>
                  <th className="px-4 py-3 text-right">Balance</th>
                  <th className="px-4 py-3 text-right">Updated block</th>
                </tr>
              </thead>
              <tbody>
                {data && data.holders.length === 0 && (
                  <tr>
                    <td className="px-4 py-6 text-muted" colSpan={4}>
                      No indexed holders with a positive balance yet.
                    </td>
                  </tr>
                )}
                {data?.holders.map((holder) => (
                  <tr key={holder.holderAddress} className="border-t border-line">
                    <td className="px-4 py-3 text-muted tabular-nums">{holder.rank}</td>
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        className="font-mono text-link"
                        title={holder.holderAddress}
                        onClick={() => void copyAddress(holder.holderAddress)}
                      >
                        {copied === holder.holderAddress
                          ? 'Copied'
                          : shorten(holder.holderAddress, 8, 6)}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-right font-mono tabular-nums">
                      {formatRaw(holder.balanceRaw, data.decimals)} {symbol}
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-muted">
                      {holder.updatedBlock}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
      <p className="mt-3 text-xs text-muted">
        Ranked from indexed balances after each processed Transfer. Zero balances are omitted. Click an
        address to copy it.
      </p>
    </div>
  );
}

function writeClipboard(address: string): Promise<boolean> {
  if (navigator.clipboard?.writeText) {
    return navigator.clipboard.writeText(address).then(
      () => true,
      () => writeClipboardFallback(address),
    );
  }
  return Promise.resolve(writeClipboardFallback(address));
}

function writeClipboardFallback(address: string): boolean {
  const input = document.createElement('textarea');
  input.value = address;
  input.setAttribute('readonly', '');
  input.style.position = 'fixed';
  input.style.left = '-9999px';
  document.body.appendChild(input);
  input.select();
  const ok = document.execCommand('copy');
  document.body.removeChild(input);
  return ok;
}

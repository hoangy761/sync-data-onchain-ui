import { useEffect, useState } from 'react';
import { ChainSelect, TokenSelect } from '../components/ChainTokenSelects';
import { Alert, Badge, Card, Kv } from '../components/ui';
import { api, type SyncStatusDto } from '../lib/api';
import { formatTimestamp, shorten } from '../lib/format';
import type { ChainTokenSelection } from '../lib/useChainTokenSelection';

export function SyncView({ selection }: { selection: ChainTokenSelection }) {
  const { selected, chain } = selection;
  const [status, setStatus] = useState<SyncStatusDto | null>(null);
  const [error, setError] = useState<string | null>(null);
  const chainLabel = chain ? `${chain.name} · ${chain.chainId}` : null;

  useEffect(() => {
    if (!selected) {
      setStatus(null);
      return;
    }
    let cancelled = false;
    const load = () => {
      api
        .getSyncStatus(selected.chainId, selected.tokenAddress)
        .then((row) => {
          if (!cancelled) {
            setStatus(row);
            setError(null);
          }
        })
        .catch((err: Error) => {
          if (!cancelled) setError(err.message);
        });
    };
    load();
    const timer = window.setInterval(load, 10000);
    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, [selected]);

  const lag = status?.lagBlocks;
  const caughtUp = lag === '0';

  return (
    <div className="mx-auto max-w-[1100px] px-6 pb-16 pt-8">
      <div className="mb-4 grid gap-2.5 sm:grid-cols-2 lg:max-w-[520px]">
        <ChainSelect selection={selection} />
        <TokenSelect selection={selection} />
      </div>
      <div className="mb-3.5 text-[13px] text-muted">
        Sync status
        {chainLabel ? ` / ${chainLabel}` : ''}
        {selected ? ` / ${selected.symbol ?? 'TOKEN'}` : ''}
      </div>
      {error && <Alert>{error}</Alert>}
      {!selected && (
        <p className="text-sm text-muted">No token is tracked on this chain.</p>
      )}
      {status && (
        <Card
          title={`${status.symbol ?? 'Token'} checkpoint`}
          badge={
            <Badge tone={caughtUp ? 'ok' : 'bad'}>
              {caughtUp ? 'Caught up' : `Lag ${lag} blocks`}
            </Badge>
          }
        >
          <Kv
            rows={[
              [
                'Token',
                <span className="font-mono text-[13px]">
                  {shorten(status.tokenAddress, 10, 6)}
                  {chainLabel ? ` · ${chainLabel}` : ` · chain ${status.chainId}`}
                </span>,
              ],
              [
                'Start block',
                <span className="font-mono text-[13px]">{status.deploymentBlock}</span>,
              ],
              [
                'Last processed',
                <span className="font-mono text-[13px]">{status.lastProcessedBlock}</span>,
              ],
              [
                'Last block hash',
                <span className="break-all font-mono text-[12px]">
                  {status.lastBlockHash ?? '—'}
                </span>,
              ],
              [
                'Latest block',
                <span className="font-mono text-[13px]">{status.latestBlock ?? '—'}</span>,
              ],
              [
                'Safe head',
                <span className="font-mono text-[13px]">{status.safeHead ?? '—'}</span>,
              ],
              [
                'Lag',
                <span className={`font-mono text-[13px] ${caughtUp ? 'text-ok' : 'text-bad'}`}>
                  {lag ?? '—'}
                </span>,
              ],
              ['Updated', formatTimestamp(status.updatedAt)],
            ]}
          />
        </Card>
      )}
      <p className="text-xs text-muted">
        Safe head is latest minus confirmation depth. Checkpoint advances only after a committed batch.
      </p>
    </div>
  );
}

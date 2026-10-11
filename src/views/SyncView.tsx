import { useEffect, useState } from 'react';
import { ChainSelect, TokenSelect } from '../components/ChainTokenSelects';
import { CopyText } from '../components/CopyText';
import { Alert, Badge, Card, Kv } from '../components/ui';
import { api, type SyncStatusDto } from '../lib/api';
import { formatBlock, formatPercent, formatTimestamp } from '../lib/format';
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
  const percentLabel = formatPercent(status?.syncPercent ?? null);
  const badgeText =
    percentLabel !== '—'
      ? `${percentLabel} synced`
      : caughtUp
        ? 'Caught up'
        : lag
          ? `Lag ${lag} blocks`
          : 'Chain head unavailable';
  const badgeTone = caughtUp ? 'ok' : percentLabel === '—' ? 'muted' : 'bad';

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
          badge={<Badge tone={badgeTone}>{badgeText}</Badge>}
        >
          <SyncRange
            startBlock={status.deploymentBlock}
            lastProcessedBlock={status.lastProcessedBlock}
            currentBlock={status.latestBlock}
            syncPercent={status.syncPercent}
          />
          <Kv
            rows={[
              [
                'Token',
                <span className="text-[13px]">
                  <CopyText value={status.tokenAddress} left={10} right={6} />
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
                status.lastBlockHash ? (
                  <CopyText
                    value={status.lastBlockHash}
                    className="break-all text-left text-[12px]"
                  />
                ) : (
                  '—'
                ),
              ],
              [
                'Chain head',
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
        Safe head is chain head minus confirmation depth. Checkpoint advances only after a committed batch.
        Percent is the share of blocks from the start block through the chain head that are already processed.
      </p>
    </div>
  );
}

function SyncRange({
  startBlock,
  lastProcessedBlock,
  currentBlock,
  syncPercent,
}: {
  startBlock: string;
  lastProcessedBlock: string;
  currentBlock: string | null;
  syncPercent: string | null;
}) {
  const amount = syncPercent == null ? null : Number(syncPercent);
  const width = amount == null || !Number.isFinite(amount) ? 0 : Math.min(100, Math.max(0, amount));
  const label = formatPercent(syncPercent);
  const marker = Math.min(78, Math.max(22, width));

  return (
    <div className="border-b border-line px-[18px] py-4">
      <div className="mb-3 flex items-baseline justify-between gap-3">
        <span className="text-sm text-muted">Range</span>
        <span className="font-mono text-lg font-semibold tabular-nums">{label}</span>
      </div>
      <div
        className="relative h-3 rounded-full bg-slate-200"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={amount == null ? undefined : Math.round(width)}
        aria-label="Sync progress from start block to chain head"
      >
        <div
          className="h-full rounded-full bg-ok transition-[width] duration-500"
          style={{ width: `${width}%` }}
        />
        {amount != null && (
          <span
            className="absolute top-1/2 h-5 w-0.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-ink"
            style={{ left: `${width}%` }}
          />
        )}
      </div>
      <div className="relative mt-3 h-10 text-[12px]">
        <div className="absolute left-0 text-left">
          <div className="text-muted">Start</div>
          <div className="mt-0.5 font-mono text-[13px]">{formatBlock(startBlock)}</div>
        </div>
        {amount != null && (
          <div
            className="absolute -translate-x-1/2 text-center"
            style={{ left: `${marker}%` }}
          >
            <div className="text-muted">Last processed</div>
            <div className="mt-0.5 font-mono text-[13px]">{formatBlock(lastProcessedBlock)}</div>
          </div>
        )}
        <div className="absolute right-0 text-right">
          <div className="text-muted">Chain head</div>
          <div className="mt-0.5 font-mono text-[13px]">{formatBlock(currentBlock)}</div>
        </div>
      </div>
    </div>
  );
}
